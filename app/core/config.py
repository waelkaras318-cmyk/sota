"""
Configuration using environment variables. For local dev copy .env.example to .env
"""
from pydantic import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "streamly-backend"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./dev.db"

    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    AWS_REGION: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = ""

    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    ALLOWED_HOSTS: str = "*"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
