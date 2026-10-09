"""
GeoQuery Pune — Main FastAPI Application
Multimodal GeoAI Query Engine for Natural Language Infrastructure Search
"""
import os
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, Response
from typing import Optional, List
import asyncio

from app.core.database import init_db
from app.models.schemas import (
    QueryRequest, QueryResponse, RefineRequest, DetectRequest,
    SimulateRequest, TemporalRequest, VoiceQueryRequest,
    HealthResponse, TileResponse, ExplainabilityResponse,
    SimulationResponse, TemporalResponse
)
from app.services.query_service import query_service
from app.services.vlm_service import vlm_service
from app.services.spatial_service import spatial_service
from app.services.gemini_service import gemini_service
from app.services.report_service import report_service

# ============ APP INITIALIZATION ============

app = FastAPI(
    title="GeoQuery Pune",
    description="Multimodal GeoAI Query Engine for Natural Language Infrastructure Search",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()
    print("🌍 GeoQuery Pune initialized!")
    print("📡 API docs: http://localhost:8000/docs")

# ============ HEALTH CHECK ============

@app.get("/", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service="GeoQuery Pune",
        timestamp=datetime.now().isoformat(),
        models_loaded=["SkyCLIP", "OWL-ViT", "SegFormer", "Gemini-Flash-Lite"]
    )

# ============ MAIN QUERY ENDPOINTS ============

@app.post("/api/query", response_model=QueryResponse)
async def process_natural_language_query(request: QueryRequest):
    """
    Process a natural language query about infrastructure in Pune.
    
    Example queries:
    - "Find all commercial roofs with solar panels within 200 meters of Mula river"
    - "Locate unpaved roads intersecting cleared forest patches"
    - "Show me tin-roof buildings near Kothrud"
    """
    if not vlm_service.model_loaded:
        raise HTTPException(
            status_code=503,
            detail=(
                "Natural-language search is unavailable because this backend is using "
                "simulated detections. Configure and load a real search model and data "
                "source before searching."
            ),
        )

    try:
        result = query_service.process_query(
            user_query=request.query,
            session_id=request.session_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/query/{query_id}")
async def get_query_result(query_id: str):
    """Retrieve a previous query result by ID"""
    result = query_service.get_query_result(query_id)
    if not result:
        raise HTTPException(status_code=404, detail="Query not found")
    return result

@app.post("/api/query/refine")
async def refine_query(request: RefineRequest):
    """
    Multi-turn: Refine a previous query with additional constraints.
    Example: Original query was "Find buildings near river"
    Refinement: "Now filter to only residential ones"
    """
    result = query_service.refine_query(
        original_query_id=request.original_query_id,
        refinement=request.refinement
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# ============ VISION SEARCH ENDPOINTS ============

@app.post("/api/search/tiles")
async def search_tiles(query: str = Query(...), top_k: int = Query(10)):
    """
    Search satellite tiles by text description using SkyCLIP.
    Returns top-K most similar tiles with coordinates and metadata.
    """
    results = vlm_service.search_tiles_by_text(query, top_k=top_k)
    return {"query": query, "results": results, "count": len(results)}

@app.post("/api/detect")
async def detect_objects(request: DetectRequest):
    """
    Run OWL-ViT object detection on a specific tile.
    Returns bounding boxes for all detected instances of the object class.
    """
    detections = vlm_service.detect_objects(request.tile_id, request.object_class)
    return {
        "tile_id": request.tile_id,
        "object_class": request.object_class,
        "detections": detections,
        "count": len(detections)
    }

# ============ GEOSPATIAL ENDPOINTS ============

@app.get("/api/spatial/waterways")
async def get_waterways():
    """Get all waterways in Pune region"""
    return {
        "waterways": [
            {
                "name": w["name"],
                "type": w["type"],
                "geometry": w["geometry"]
            }
            for w in spatial_service.waterways.values()
        ]
    }

@app.get("/api/spatial/areas")
async def get_areas():
    """Get all defined areas/neighborhoods in Pune"""
    return {"areas": list(spatial_service.areas.values())}

@app.get("/api/spatial/buildings")
async def get_buildings(
    limit: int = Query(50, ge=1, le=500),
    area: Optional[str] = None,
    building_type: Optional[str] = None
):
    """Get buildings in Pune, optionally filtered by area or type"""
    buildings = spatial_service.buildings[:limit]
    
    if area:
        buildings = [b for b in buildings if area.lower() in b.get("address", "").lower()]
    if building_type:
        buildings = [b for b in buildings if b.get("building_type") == building_type]
    
    return {"count": len(buildings), "buildings": buildings}

# ============ GEOSIMULATOR: DISASTER SIMULATION ============

@app.post("/api/simulate", response_model=SimulationResponse)
async def simulate_disaster(request: SimulateRequest):
    """
    🥇 GeoSimulator Feature: Run a disaster simulation.
    
    Simulates flood impact on infrastructure, returns:
    - Affected buildings with risk scores
    - Flood zone polygon
    - Population impact estimates
    - Risk breakdown (high/medium/low)
    """
    result = spatial_service.simulate_flood(
        waterway_name=request.waterway,
        water_level_meters=request.water_level_meters
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@app.get("/api/simulate/flood/{waterway}/{level}")
async def quick_flood_simulation(waterway: str, level: float = 3.0):
    """Quick flood simulation via URL parameters"""
    result = spatial_service.simulate_flood(waterway, level)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

# ============ TEMPORAL CHANGE DETECTION ============

@app.post("/api/temporal")
async def temporal_change_detection(request: TemporalRequest):
    """
    🥉 TemporalDiff Feature: Detect changes between two time periods.
    
    Returns:
    - New constructions detected
    - Demolished structures
    - Vegetation changes
    - Change locations as GeoJSON
    """
    result = spatial_service.temporal_change_detection(
        area_name=request.area,
        year1=request.year1,
        year2=request.year2
    )
    return result

# ============ EXPLAINABLE AI ============

@app.get("/api/explain/{query_id}/{detection_index}")
async def get_explainability(query_id: str, detection_index: int = 0):
    """
    🏅 ExplainGeo Feature: Get attention heatmap and explanation for a detection.
    
    Returns:
    - GradCAM-style attention heatmap
    - Human-readable explanation
    - Model information
    """
    result = query_service.get_explainability(query_id, detection_index)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# ============ VOICE / GPS-AWARE QUERIES ============

@app.post("/api/voice/query")
async def voice_query(request: VoiceQueryRequest):
    """
    🥈 GeoVoice Feature: Process voice input with GPS awareness.
    
    Automatically uses user's location for proximity queries.
    """
    query = request.audio_text
    
    # If GPS coordinates provided, add location context
    if request.latitude and request.longitude:
        area = spatial_service._get_area_for_coords(request.latitude, request.longitude)
        
        # Replace "near me" / "around me" with actual location
        query = query.replace("near me", f"near {area}")
        query = query.replace("around me", f"near {area}")
        query = query.replace("my location", f"{area}")
        
        # Add location info to response
        result = query_service.process_query(query)
        result["user_location"] = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "area": area
        }
        return result
    
    return query_service.process_query(query)

# ============ SMART EXPORT ============

@app.get("/api/export/geojson/{query_id}")
async def export_geojson(query_id: str):
    """Export query results as downloadable GeoJSON"""
    result = query_service.get_query_result(query_id)
    if not result:
        raise HTTPException(status_code=404, detail="Query not found")
    
    geojson = result.get("geojson", {})
    
    return Response(
        content=json.dumps(geojson, indent=2),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=geoquery_{query_id}.geojson"
        }
    )

@app.get("/api/export/report/{query_id}")
async def export_report(query_id: str):
    """
    🏅 SmartExport Feature: Generate professional PDF report with AI insights.
    """
    result = query_service.get_query_result(query_id)
    if not result:
        raise HTTPException(status_code=404, detail="Query not found")
    
    pdf_bytes = report_service.generate_report(result)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=geoquery_report_{query_id}.pdf"
        }
    )

# ============ WEBSOCKET FOR REAL-TIME STREAMING ============

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_json(self, data: dict, websocket: WebSocket):
        await websocket.send_json(data)

manager = ConnectionManager()

@app.websocket("/ws/{query_id}")
async def websocket_endpoint(websocket: WebSocket, query_id: str):
    """
    WebSocket endpoint for real-time result streaming.
    Pushes partial results as they become available.
    """
    await manager.connect(websocket)
    try:
        # Send initial status
        await manager.send_json({
            "type": "status",
            "message": "Processing query...",
            "query_id": query_id
        }, websocket)
        
        # Simulate streaming partial results
        result = query_service.get_query_result(query_id)
        if result:
            detections = result.get("results", {}).get("detections", [])
            
            # Stream detections one by one
            for i, det in enumerate(detections):
                await manager.send_json({
                    "type": "detection",
                    "index": i,
                    "total": len(detections),
                    "data": det
                }, websocket)
                await asyncio.sleep(0.1)  # Simulate processing time
            
            # Send complete
            await manager.send_json({
                "type": "complete",
                "geojson": result.get("geojson", {}),
                "insights": result.get("insights", ""),
                "total": len(detections)
            }, websocket)
        else:
            await manager.send_json({
                "type": "error",
                "message": "Query not found"
            }, websocket)
        
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ============ KNOWLEDGE GRAPH / CONTEXT ============

@app.get("/api/context/pune")
async def get_pune_context():
    """
    🎯 PuneContext Feature: Get local knowledge graph for Pune.
    Includes areas, landmarks, waterways, and their relationships.
    """
    return {
        "areas": spatial_service.areas,
        "waterways": {
            name: {"name": w["name"], "type": w["type"]}
            for name, w in spatial_service.waterways.items()
        },
        "statistics": {
            "total_buildings": len(spatial_service.buildings),
            "total_areas": len(spatial_service.areas),
            "total_waterways": len(spatial_service.waterways),
            "bbox": {
                "west": 73.70, "south": 18.44,
                "east": 74.00, "north": 18.62
            }
        },
        "landmarks": [
            {"name": "Shaniwar Wada", "lat": 18.5196, "lon": 73.8553},
            {"name": "Aga Khan Palace", "lat": 18.5535, "lon": 73.8957},
            {"name": "Sinhagad Fort", "lat": 18.3656, "lon": 73.7544},
            {"name": "MIT College", "lat": 18.5135, "lon": 73.8347},
            {"name": "FC Road", "lat": 18.5247, "lon": 73.8396},
            {"name": "Pune Station", "lat": 18.5289, "lon": 73.8741},
        ]
    }

# ============ QUERY HISTORY ============

@app.get("/api/history")
async def get_query_history(limit: int = Query(20, ge=1, le=100)):
    """Get recent query history"""
    history = []
    for qid, result in list(query_service.query_history.items())[-limit:]:
        history.append({
            "query_id": qid,
            "query": result.get("original_query"),
            "results_count": result.get("results", {}).get("total_found", 0),
            "timestamp": result.get("timestamp"),
            "processing_time_ms": result.get("processing_time_ms")
        })
    return {"history": history, "count": len(history)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ============ MAP CONFIGURATION ============
from app.api.map_config import router as map_router
app.include_router(map_router)

# ============ SEARCH API ============
from app.api.search import router as search_router
app.include_router(search_router)

# ============ ANALYSIS API ============
from app.api.analysis import router as analysis_router
app.include_router(analysis_router)

# ============ SIMULATION API ============
from app.api.simulation import router as simulation_router
app.include_router(simulation_router)
