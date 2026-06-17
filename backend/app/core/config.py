from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ALIYUN_API_KEY: str = ""
    DATABASE_URL: str = "postgresql://xieshang_user:xieshang_password@localhost:5432/xieshang_db"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
