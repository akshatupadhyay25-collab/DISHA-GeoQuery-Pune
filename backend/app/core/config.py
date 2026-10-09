from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "GeoQuery Pune"
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Database
    DATABASE_URL: str = "postgresql://geoquery:geoquery123@db:5432/geoquery_pune"
    POSTGRES_USER: str = "geoquery"
    POSTGRES_PASSWORD: str = "geoquery123"
    POSTGRES_DB: str = "geoquery_pune"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash-lite"
    
    # Pune BBox
    PUNE_BBOX_WEST: float = 73.70
    PUNE_BBOX_SOUTH: float = 18.44
    PUNE_BBOX_EAST: float = 74.00
    PUNE_BBOX_NORTH: float = 18.62
    
    # Paths
    DATA_DIR: str = "./data"
    TILE_DIR: str = "./data/tiles"
    EMBEDDINGS_DIR: str = "./data/embeddings"
    
    class Config:
        env_file = ".env"

settings = Settings()
