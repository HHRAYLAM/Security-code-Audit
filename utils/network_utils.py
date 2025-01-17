from web3 import Web3
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(override=True)

def init_web3(network='local'):
    if network.lower() == 'local':
        # 本地网络（例如Ganache）
        ganache_url = "http://127.0.0.1:7545"
        web3 = Web3(Web3.HTTPProvider(ganache_url))
    elif network.lower() == 'sepolia':
        # Sepolia测试网络
        sepolia_url = f"https://sepolia.infura.io/v3/{os.getenv('INFURA_API_KEY')}"
        web3 = Web3(Web3.HTTPProvider(sepolia_url))
    elif network.lower() == 'linea':
        # Linea主网
        linea_url = f"https://linea-mainnet.infura.io/v3/{os.getenv('INFURA_API_KEY')}"
        web3 = Web3(Web3.HTTPProvider(linea_url))
    else:
        raise ValueError(f"Unsupported network: {network}")
    
    if not web3.isConnected():
        raise ConnectionError(f"Failed to connect to {network} network")
    
    return web3