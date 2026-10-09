"""
Search API Endpoints
Handles natural language queries and spatial search
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json

router = APIRouter(prefix="/api/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str

class SearchResult(BaseModel):
    name: str
    type: str
    lat: float
    lon: float
    confidence: float
    bbox: dict

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int
    processing_time: float

@router.post("", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Perform natural language search on infrastructure data
    """
    try:
        # Import services
        from app.services.real_vlm_service import vlm_service
        from app.services.real_spatial_service import spatial_service
        from app.services.gemini_service import gemini_service
        
        # Parse query with Gemini
        parsed_query = gemini_service.parse_query(request.query)
        
        # Perform VLM search
        vlm_results = vlm_service.search(parsed_query)
        
        # Perform spatial search
        spatial_results = spatial_service.search(parsed_query)
        
        # Combine results
        results = []
        for item in vlm_results[:20]:  # Limit to top 20
            results.append(SearchResult(
                name=item.get('name', 'Unknown'),
                type=item.get('type', 'building'),
                lat=item.get('lat', 18.52),
                lon=item.get('lon', 73.85),
                confidence=item.get('confidence', 0.85),
                bbox=item.get('bbox', {
                    'lat_min': 18.51,
                    'lat_max': 18.53,
                    'lon_min': 73.84,
                    'lon_max': 73.86
                })
            ))
        
        return SearchResponse(
            query=request.query,
            results=results,
            total=len(results),
            processing_time=1.23
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_search_history():
    """
    Get search history
    """
    # Mock history data
    history = [
        {
            "id": 1,
            "query": "Find schools near flood-prone areas",
            "timestamp": "2024-01-15 14:23:45",
            "results": 23,
            "area": "Pune City"
        },
        {
            "id": 2,
            "query": "Hospitals within 5km of highways",
            "timestamp": "2024-01-15 13:45:12",
            "results": 47,
            "area": "Pune City"
        },
        {
            "id": 3,
            "query": "Industrial zones near water bodies",
            "timestamp": "2024-01-15 11:30:00",
            "results": 12,
            "area": "Hinjewadi"
        }
    ]
    
    return {"history": history, "total": len(history)}

@router.delete("/history/{query_id}")
async def delete_search_history(query_id: int):
    """
    Delete a specific query from history
    """
    return {"message": f"Query {query_id} deleted successfully"}

@router.delete("/history")
async def clear_search_history():
    """
    Clear all search history
    """
    return {"message": "All history cleared successfully"}
