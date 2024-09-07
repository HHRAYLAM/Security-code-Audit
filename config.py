import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')
    CONTRACT_ADDRESS1 = os.getenv('CONTRACT_ADDRESS')
    API_TOKEN = os.getenv('API_TOKEN')