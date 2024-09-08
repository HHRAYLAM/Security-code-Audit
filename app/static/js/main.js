import contractABI from "../contractABI.js";

document.addEventListener("DOMContentLoaded", () => {
  const initialize = async () => {
    const contractAddress = window.contractAddress; // 确保这个地址是你在 Remix 或 Truffle 上部署的合约地址
    console.log("Contract address:", contractAddress);

    let userWalletAddress;
    let web3;
    let contract; // 在这里定义 contract 变量

    const networkConfig = {
      local: { chainId: ["1337", "5777"], name: "本地网络" },
      sepolia: { chainId: ["11155111"], name: "Sepolia 测试网络" },
      linea: { chainId: ["59144"], name: "Linea 主网" },
      Holesky: { chainId: ["17000"], name: "Holesky 测试网络" },
    };

    const currentNetwork = "sepolia"; // 切换到本地网络

    const initializeWeb3 = async () => {
      if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const chainId = await web3.eth.getChainId();
          console.log("Current chainId:", chainId);
          console.log(
            "Expected chainIds:",
            networkConfig[currentNetwork].chainId
          );
          const isCorrectNetwork =
            networkConfig[currentNetwork].chainId.includes(
              chainId.toString()
            ) ||
            networkConfig[currentNetwork].chainId.includes(
              "0x" + chainId.toString(16)
            );
          if (!isCorrectNetwork) {
            alert(
              `Please switch metamask to ${networkConfig[currentNetwork].name} on MetaMask`
            );
            return false;
          }
          contract = new web3.eth.Contract(contractABI, contractAddress); // 在这里实例化 contract
          return true;
        } catch (error) {
          console.error("Failed to initialize Web3", error);
          alert(
            "Failed to initialize Web3, please ensure MetaMask is installed and unlocked"
          );
          return false;
        }
      } else {
        console.error("MetaMask is not installed");
        alert("Please install MetaMask to use this application");
        return false;
      }
    };

    const connectWallet = async () => {
      if (await initializeWeb3()) {
        try {
          const accounts = await web3.eth.getAccounts();
          userWalletAddress = accounts[0];
          document.getElementById("upload-button").disabled = false;
          console.log("Wallet connected:", userWalletAddress);

          const balance = await web3.eth.getBalance(userWalletAddress);
          console.log(
            "Account balance:",
            web3.utils.fromWei(balance, "ether"),
            "ETH"
          );
        } catch (error) {
          console.error("Failed to connect wallet", error);
          alert("Failed to connect wallet, please try again");
        }
      }
    };

    const uploadAuditRecord = async (userWalletAddress, codeHash) => {
      console.log(
        "uploadAuditRecord called with userWalletAddress:",
        userWalletAddress
      );
      try {
        // 确保合约实例化正确
        if (!contract || !contract.methods) {
          throw new Error("Contract is not initialized correctly");
        }

        const auditFee = await contract.methods.auditFee().call();
        console.log("Audit fee:", auditFee);

        const transactionParameters = {
          to: contractAddress, // 合约地址
          from: userWalletAddress, // 用户地址
          value: auditFee, // 审计费用
          gas: 8000000, // 增加 Gas 限额
        };

        console.log(
          "Sending transaction with parameters:",
          transactionParameters
        );

        // 调用合约的 uploadAuditRecord 函数
        const txHash = await contract.methods
          .uploadAuditRecord(codeHash)
          .send(transactionParameters)
          .on("transactionHash", function (hash) {
            console.log("Transaction hash:", hash);
          })
          .on("receipt", function (receipt) {
            console.log("Transaction receipt:", receipt);
            // 处理交易收据
            const events = receipt.events;
            if (events && events.AuditRecorded) {
              const { recordId, codeHash, auditor, timestamp } =
                events.AuditRecorded.returnValues;
              console.log("AuditRecorded event:", {
                recordId,
                codeHash,
                auditor,
                timestamp,
              });
            }
          })
          .on("error", function (error, receipt) {
            console.error("Error sending transaction:", error);
            if (receipt) {
              console.error("Transaction receipt:", receipt);
            }
          });

        // 定期检查交易状态
        const checkTransactionStatus = async (txHash) => {
          let receipt = null;
          while (receipt === null) {
            receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt === null) {
              console.log("Waiting for transaction to be mined...");
              await new Promise((resolve) => setTimeout(resolve, 5000)); // 等待 5 秒
            }
          }
          console.log("Transaction mined:", receipt);
          return receipt.status;
        };

        const transactionStatus = await checkTransactionStatus(txHash);
        if (!transactionStatus) {
          throw new Error("Transaction failed");
        }

        return true;
      } catch (error) {
        console.error("Error sending transaction:", error);
        alert(`发送交易时出错: ${error.message}`);
        return false;
      }
    };

    document
      .getElementById("connect-button")
      .addEventListener("click", connectWallet);

    document
      .getElementById("upload-button")
      .addEventListener("click", async () => {
        console.log("Upload button clicked");
        if (!(await initializeWeb3())) return;

        const userWalletAddress = (await web3.eth.getAccounts())[0];
        console.log("User wallet address:", userWalletAddress);

        const fileInput = document.getElementById("file-input");
        const file = fileInput.files[0];
        if (!file) {
          alert("Please select a file");
          return;
        }

        const reader = new FileReader();
        reader.onload = async function (event) {
          const fileContent = event.target.result;
          const codeHash = web3.utils.sha3(fileContent);

          const transactionSuccess = await uploadAuditRecord(
            userWalletAddress,
            codeHash
          );
          if (!transactionSuccess) {
            alert("Transaction failed");
            return;
          }

          // 等待一段时间以确保交易被确认
          await new Promise((resolve) => setTimeout(resolve, 30000)); // 等待 30 秒

          const formData = new FormData();
          formData.append("wallet_address", userWalletAddress);
          formData.append("file", file);

          try {
            const response = await fetch("/upload", {
              method: "POST",
              body: formData,
              redirect: "follow",
            });

            if (response.redirected) {
              window.location.href = response.url;
            } else if (response.ok) {
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const result = await response.json();
                console.log("Audit result:", result);
                const auditResultStr = JSON.stringify(result);
                window.location.href = `/success?audit_result=${encodeURIComponent(
                  auditResultStr
                )}`;
              } else {
                const text = await response.text();
                console.error("Unexpected response format:", text);
                alert(`Unexpected response format: ${text}`);
              }
            } else {
              const errorText = await response.text();
              console.error("Audit failed", errorText);
              alert(`Audit failed: ${errorText}`);
            }
          } catch (error) {
            console.error("Error during upload process", error);
            alert(`Error during upload process: ${error.message}`);
          }
        };

        reader.readAsText(file);
      });

    // 监听网络变化
    if (window.ethereum) {
      window.ethereum.on("chainChanged", async (chainId) => {
        console.log("Chain changed to:", chainId);
        const isCorrectNetwork =
          networkConfig[currentNetwork].chainId.includes(chainId) ||
          networkConfig[currentNetwork].chainId.includes(
            parseInt(chainId).toString()
          );
        if (!isCorrectNetwork) {
          alert(
            `Please switch metamask to ${networkConfig[currentNetwork].name} on MetaMask`
          );
          document.getElementById("upload-button").disabled = true;
        } else {
          await connectWallet();
        }
      });

      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
          console.log("Please connect to MetaMask.");
          document.getElementById("upload-button").disabled = true;
        } else {
          await connectWallet();
        }
      });

      window.ethereum.on("disconnect", (error) => {
        console.log("MetaMask disconnected:", error);
        document.getElementById("upload-button").disabled = true;
      });
    }
  };
  initialize();
});
