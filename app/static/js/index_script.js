document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("connect-button")
    .addEventListener("click", async function () {
      // 处理连接钱包的逻辑
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      document.getElementById("wallet-address").value = walletAddress;
    });

  document
    .getElementById("upload-button")
    .addEventListener("click", async function () {
      const boatContainer = document.querySelector(".boat-container");
      const boat = document.querySelector(".boat");
      const progressBar = document.getElementById("progress-bar");
      const walletAddress = document.getElementById("wallet-address").value;

      // 检查钱包付款状态
      const paymentStatus = await checkPaymentStatus(walletAddress);
      if (paymentStatus === "paid") {
        // 显示小船和进度条
        boatContainer.classList.remove("hidden");
        setTimeout(() => {
          boatContainer.style.opacity = 1;
        }, 10);

        // 开始上传文件并获取进度
        await uploadFileAndTrackProgress();
      } else {
        alert("Please complete the payment before uploading the file.");
      }
    });

  function updateProgressBar(percentage) {
    const progressBar = document.getElementById("progress-bar");
    progressBar.value = percentage;

    // 更新小船位置
    const boat = document.querySelector(".boat");
    const progressBarWidth = progressBar.offsetWidth;
    const boatPosition =
      (percentage / 100) * progressBarWidth - boat.offsetWidth / 2;
    boat.style.transform = `translateX(${boatPosition}px)`;
  }

  async function checkPaymentStatus(walletAddress) {
    const response = await fetch("/check_payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
    const data = await response.json();
    return data.status;
  }

  async function uploadFileAndTrackProgress() {
    const fileInput = document.getElementById("file-input");
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append(
      "wallet_address",
      document.getElementById("wallet-address").value
    );

    // 上传文件
    await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    // 使用 WebSocket 实时更新进度
    const socket = io();
    socket.on("progress_update", (data) => {
      updateProgressBar(data.progress);

      if (data.progress === 100) {
        // 等待进度条动画完成后开始小船动画
        const boat = document.querySelector(".boat");
        boat.style.animation = "sail 5s forwards";

        boat.addEventListener("animationend", function () {
          window.location.href = "/success"; // 假设成功页面的URL是 /success
        });
      }
    });
  }
});
