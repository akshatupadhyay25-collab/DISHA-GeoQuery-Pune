"""
Query Orchestrator Service
Connects natural language input → VLM search → Spatial operations → Results
"""
import uuid
import time
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.gemini_service import gemini_service
from app.services.vlm_service import vlm_service
from app.services.spatial_service import spatial_service

class QueryService:
    """
    Main orchestrator: takes a natural language query and returns
    geospatial results through the full pipeline.
    """
    
    def __init__(self):
        self.query_history = {}
    
    def process_query(self, user_query: str, session_id: str = None) -> Dict[str, Any]:
        """
        Full query processing pipeline:
        1. Parse query with Gemini
        2. Execute visual search with CLIP
        3. Run object detection with OWL-ViT
        4. Apply spatial filters with GeoPandas
        5. Generate results + explanations
        """
        start_time = time.time()
        query_id = str(uuid.uuid4())[:12]
        
        # Step 1: Parse the query
        parsed = gemini_service.parse_query(user_query)
        
        # Step 2: Visual tile search
        visual_terms = " ".join(parsed.get("visual_search_terms", [user_query]))
        tile_results = vlm_service.search_tiles_by_text(visual_terms, top_k=20)
        
        # Step 3: Object detection on top tiles
        all_detections = []
        for tile in tile_results[:10]:  # Process top 10 tiles
            for search_term in parsed.get("visual_search_terms", [visual_terms]):
                detections = vlm_service.detect_objects(tile["tile_id"], search_term)
                all_detections.extend(detections)
        
        # Remove duplicates (keep highest confidence)
        seen = set()
        unique_detections = []
        for det in sorted(all_detections, key=lambda x: x["confidence"], reverse=True):
            key = f"{det['tile_id']}_{det['bbox']['lat_min']:.6f}_{det['bbox']['lon_min']:.6f}"
            if key not in seen:
                seen.add(key)
                unique_detections.append(det)
        
        # Step 4: Apply spatial filters
        spatial_target = parsed.get("spatial_target", {})
        spatial_filter = parsed.get("spatial_filter", {})
        
        target_geometry = None
        if spatial_target.get("name"):
            target_geometry = spatial_service.get_target_geometry(spatial_target["name"])
        
        if target_geometry and spatial_filter.get("distance_meters"):
            filtered_detections = spatial_service.filter_by_proximity(
                unique_detections, target_geometry, spatial_filter["distance_meters"]
            )
        elif target_geometry and spatial_filter.get("type") == "intersect":
            filtered_detections = spatial_service.filter_by_proximity(
                unique_detections, target_geometry, 50  # Small buffer for intersection
            )
        else:
            filtered_detections = unique_detections
        
        # Step 5: Generate GeoJSON output
        geojson = spatial_service.generate_geojson(filtered_detections)
        
        # Step 6: Generate insights
        insights = gemini_service.generate_insights(
            user_query, len(filtered_detections),
            {"visual_terms": parsed.get("visual_search_terms"),
             "spatial_target": spatial_target.get("name")}
        )
        
        # Step 7: Generate explanations for top results
        for det in filtered_detections[:5]:
            det["explanation"] = gemini_service.generate_explanation(
                det.get("detection_class", "object"),
                det.get("confidence", 0.8),
                {"tile_id": det.get("tile_id")}
            )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        result = {
            "query_id": query_id,
            "original_query": user_query,
            "parsed_query": parsed,
            "results": {
                "total_found": len(filtered_detections),
                "detections": filtered_detections,
                "tiles_searched": len(tile_results),
                "tile_results": tile_results[:5]
            },
            "geojson": geojson,
            "insights": insights,
            "processing_time_ms": processing_time,
            "target_geometry": target_geometry,
            "spatial_filter_applied": spatial_filter,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in history
        self.query_history[query_id] = result
        
        return result
    
    def get_query_result(self, query_id: str) -> Optional[Dict]:
        """Retrieve a previous query result"""
        return self.query_history.get(query_id)
    
    def refine_query(self, original_query_id: str, refinement: str) -> Dict[str, Any]:
        """
        Multi-turn: refine a previous query with additional constraints.
        Example: Original = "Find buildings near river"
                 Refinement = "Now filter to only residential ones built after 2020"
        """
        original = self.get_query_result(original_query_id)
        if not original:
            return {"error": "Original query not found"}
        
        # Combine queries
        combined_query = f"{original['original_query']}. Additionally, {refinement}"
        return self.process_query(combined_query)
    
    def get_explainability(self, query_id: str, detection_index: int = 0) -> Dict:
        """
        ExplainGeo Feature: Get attention heatmap and explanation for a detection
        """
        result = self.get_query_result(query_id)
        if not result:
            return {"error": "Query not found"}
        
        detections = result.get("results", {}).get("detections", [])
        if detection_index >= len(detections):
            return {"error": "Detection index out of range"}
        
        detection = detections[detection_index]
        tile_id = detection.get("tile_id", "")
        
        # Get attention heatmap
        heatmap = vlm_service.get_attention_heatmap(tile_id, detection)
        
        # Convert heatmap to list for JSON serialization
        heatmap_list = heatmap.tolist()
        
        return {
            "detection": detection,
            "attention_heatmap": heatmap_list,
            "heatmap_size": [64, 64],
            "explanation": detection.get("explanation", ""),
            "confidence": detection.get("confidence", 0),
            "model_info": {
                "name": "OWL-ViT (ViT-B/32)",
                "input_resolution": "800x800",
                "detection_method": "Zero-shot open-vocabulary detection"
            }
        }

# Singleton
query_service = QueryService()
