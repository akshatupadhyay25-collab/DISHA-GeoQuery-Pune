"""
Pydantic models for API request/response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ============ Request Models ============

class QueryRequest(BaseModel):
    query: str = Field(..., description="Natural language query about infrastructure")
    session_id: Optional[str] = Field(None, description="Session ID for multi-turn conversations")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Find all commercial roofs with solar panels within 200 meters of Mula river",
                "session_id": None
            }
        }

class RefineRequest(BaseModel):
    original_query_id: str
    refinement: str = Field(..., description="Additional constraint to apply")

class DetectRequest(BaseModel):
    tile_id: str
    object_class: str = Field(..., description="Object to detect (e.g., 'solar panel', 'building')")

class SimulateRequest(BaseModel):
    simulation_type: str = Field("flood", description="Type of simulation: flood, fire, earthquake")
    waterway: str = Field("mula_river", description="Target waterway for flood simulation")
    water_level_meters: float = Field(3.0, description="Water level in meters")

class TemporalRequest(BaseModel):
    area: str = Field(..., description="Pune area name (e.g., 'Kothrud', 'Baner')")
    year1: int = Field(2022, description="Start year")
    year2: int = Field(2025, description="End year")

class VoiceQueryRequest(BaseModel):
    audio_text: str = Field(..., description="Transcribed voice input")
    latitude: Optional[float] = Field(None, description="User's current latitude")
    longitude: Optional[float] = Field(None, description="User's current longitude")

# ============ Response Models ============

class DetectionResponse(BaseModel):
    detection_class: str
    confidence: float
    bbox: Dict[str, float]
    center_lat: float
    center_lon: float
    tile_id: str
    model: str
    explanation: str
    distance_to_target: Optional[float] = None

class QueryResponse(BaseModel):
    query_id: str
    original_query: str
    parsed_query: Dict[str, Any]
    results: Dict[str, Any]
    geojson: Dict[str, Any]
    insights: str
    processing_time_ms: int
    timestamp: str

class SimulationResponse(BaseModel):
    simulation_type: str
    waterway: str
    water_level_meters: float
    summary: Dict[str, Any]
    flood_zone: Dict[str, Any]
    affected_buildings: List[Dict[str, Any]]

class TemporalResponse(BaseModel):
    area: str
    period: str
    summary: Dict[str, Any]
    changes: List[Dict[str, Any]]
    change_geojson: Dict[str, Any]

class TileResponse(BaseModel):
    tile_id: str
    similarity: float
    confidence: float
    center_lat: float
    center_lon: float
    tags: List[str]
    source: str

class ExplainabilityResponse(BaseModel):
    detection: Dict[str, Any]
    attention_heatmap: List[List[float]]
    heatmap_size: List[int]
    explanation: str
    confidence: float
    model_info: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: str
    models_loaded: List[str]
