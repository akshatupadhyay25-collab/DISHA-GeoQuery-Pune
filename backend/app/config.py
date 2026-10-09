"""
Configuration Management
Loads environment variables from .env file
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    """Application Configuration"""
    
    # AI/LLM Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    
    # Map API Keys
    MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN', '')
    GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')
    CARTO_API_KEY = os.getenv('CARTO_API_KEY', '')
    
    # Satellite Imagery Keys
    PLANET_API_KEY = os.getenv('PLANET_API_KEY', '')
    SENTINEL_HUB_CLIENT_ID = os.getenv('SENTINEL_HUB_CLIENT_ID', '')
    SENTINEL_HUB_SECRET = os.getenv('SENTINEL_HUB_SECRET', '')
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./disha.db')
    
    # Server
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', '8000'))
    
    # Application
    APP_NAME = os.getenv('APP_NAME', 'DISHA GeoQuery Pune')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    SECRET_KEY = os.getenv('SECRET_KEY', 'disha-secret-key')
    
    # Pune Bounding Box
    PUNE_BBOX_WEST = float(os.getenv('PUNE_BBOX_WEST', '73.70'))
    PUNE_BBOX_SOUTH = float(os.getenv('PUNE_BBOX_SOUTH', '18.44'))
    PUNE_BBOX_EAST = float(os.getenv('PUNE_BBOX_EAST', '74.00'))
    PUNE_BBOX_NORTH = float(os.getenv('PUNE_BBOX_NORTH', '18.62'))
    
    @classmethod
    def get_map_provider(cls):
        """Determine which map provider to use based on available keys"""
        if cls.MAPBOX_TOKEN:
            return 'mapbox'
        elif cls.GOOGLE_MAPS_API_KEY:
            return 'google'
        elif cls.CARTO_API_KEY:
            return 'carto'
        else:
            return 'osm'  # Default to OpenStreetMap (free)
    
    @classmethod
    def get_tile_url(cls):
        """Get tile URL based on available API key"""
        provider = cls.get_map_provider()
        
        if provider == 'mapbox':
            return f'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{{z}}/{{x}}/{{y}}?access_token={cls.MAPBOX_TOKEN}'
        elif provider == 'google':
            return f'https://mt1.google.com/vt/lyrs=s&x={{x}}&y={{y}}&z={{z}}&key={cls.GOOGLE_MAPS_API_KEY}'
        elif provider == 'carto':
            return f'https://cartocdn-globalevents-a.akamaihd.net/base-dark/{{z}}/{{x}}/{{y}}.png?api_key={cls.CARTO_API_KEY}'
        else:
            # Default: OpenStreetMap (no API key needed)
            return 'https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png'
    
    @classmethod
    def get_pune_bbox(cls):
        """Get Pune bounding box as dict"""
        return {
            'west': cls.PUNE_BBOX_WEST,
            'south': cls.PUNE_BBOX_SOUTH,
            'east': cls.PUNE_BBOX_EAST,
            'north': cls.PUNE_BBOX_NORTH
        }
    
    @classmethod
    def print_config(cls):
        """Print current configuration (for debugging)"""
        print("\n" + "="*60)
        print("🔧 DISHA Configuration")
        print("="*60)
        print(f"App Name: {cls.APP_NAME}")
        print(f"Debug Mode: {'✅ Enabled' if cls.DEBUG else '❌ Disabled'}")
        print(f"Map Provider: {cls.get_map_provider().upper()}")
        print(f"Gemini API: {'✅ Configured' if cls.GEMINI_API_KEY else '❌ Not set (using fallback)'}")
        print(f"Gemini Model: {cls.GEMINI_MODEL}")
        print(f"Mapbox Token: {'✅ Configured' if cls.MAPBOX_TOKEN else '❌ Not set'}")
        print(f"Planet API: {'✅ Configured' if cls.PLANET_API_KEY else '❌ Not set'}")
        print(f"Pune BBox: {cls.PUNE_BBOX_SOUTH}°N to {cls.PUNE_BBOX_NORTH}°N, {cls.PUNE_BBOX_WEST}°E to {cls.PUNE_BBOX_EAST}°E")
        print("="*60 + "\n")

# Global config instance
config = Config()

# Print config on import
config.print_config()
