"""
Map Configuration API Endpoint
Provides map tile URLs and API keys to frontend
"""

from fastapi import APIRouter
from app.config import config

router = APIRouter(prefix="/api/map", tags=["map"])

@router.get("/config")
async def get_map_config():
    """
    Get map configuration for frontend
    Returns tile URL and any required API keys
    """
    return {
        "provider": config.get_map_provider(),
        "tile_url": config.get_tile_url(),
        "mapbox_token": config.MAPBOX_TOKEN if config.MAPBOX_TOKEN else None,
        "attribution": get_attribution(config.get_map_provider())
    }

def get_attribution(provider: str) -> str:
    """Get attribution text based on map provider"""
    attributions = {
        'osm': '© OpenStreetMap contributors',
        'mapbox': '© Mapbox © OpenStreetMap',
        'google': '© Google',
        'carto': '© CARTO © OpenStreetMap'
    }
    return attributions.get(provider, '© OpenStreetMap contributors')
