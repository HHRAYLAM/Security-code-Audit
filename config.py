import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')
    CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
    API_TOKEN = os.getenv('API_TOKEN')