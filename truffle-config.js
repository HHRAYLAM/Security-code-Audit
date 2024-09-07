const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();
const privateKey = process.env.PRIVATE_KEY;
const infuraApiKey = process.env.INFURA_API_KEY;
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "1337",
    },
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          privateKey,
          `https://sepolia.infura.io/v3/${infuraApiKey}`
        ),
      network_id: 11155111,
      gas: 10000000, // Increase gas limit
      gasPrice: 10000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 1000000, // Increase timeout
    },
    lineaMainnet: {
      provider: () =>
        new HDWalletProvider(
          privateKey,
          `https://linea-mainnet.infura.io/v3/${infuraApiKey}`
        ),
      network_id: 59144,
      gas: 80000000,
      gasPrice: 10000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 1000000, // Increase timeout
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
