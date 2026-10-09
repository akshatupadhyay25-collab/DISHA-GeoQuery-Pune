"""
Vision Language Model Service
Handles satellite image search and object detection using CLIP and OWL-ViT
"""
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from PIL import Image
import json
import os
from pathlib import Path

class VLMService:
    """
    Manages CLIP-based tile search and OWL-ViT object detection.
    For hackathon, uses pre-computed embeddings and simulated detections
    with realistic parameters.
    """
    
    def __init__(self):
        self.embeddings = {}
        self.tile_metadata = {}
        self.model_loaded = False
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        """Initialize with realistic mock data for Pune region"""
        # Pre-computed tile embeddings for Pune (simulated)
        np.random.seed(42)
        
        # Generate ~100 tile embeddings covering Pune region
        self.pune_tiles = []
        for i in range(100):
            lat = 18.44 + np.random.uniform(0, 0.18)
            lon = 73.70 + np.random.uniform(0, 0.30)
            
            tile = {
                "tile_id": f"pune_tile_{i:04d}",
                "center_lat": lat,
                "center_lon": lon,
                "lat_min": lat - 0.005,
                "lat_max": lat + 0.005,
                "lon_min": lon - 0.005,
                "lon_max": lon + 0.005,
                "embedding": np.random.randn(512).astype(np.float32),
                "source": np.random.choice(["skyscript", "sentinel2", "geoogle_earth"]),
                "acquisition_date": f"2024-{np.random.randint(1,13):02d}-{np.random.randint(1,29):02d}",
                "tags": self._generate_tile_tags(lat, lon)
            }
            self.pune_tiles.append(tile)
            self.tile_metadata[tile["tile_id"]] = tile
        
        # Normalize embeddings for cosine similarity
        for tile in self.pune_tiles:
            norm = np.linalg.norm(tile["embedding"])
            tile["embedding"] = tile["embedding"] / (norm + 1e-8)
    
    def _generate_tile_tags(self, lat: float, lon: float) -> List[str]:
        """Generate realistic OSM-like tags for a tile based on location"""
        tags = []
        
        # Simulate different areas of Pune
        if lat > 18.55:  # Northern Pune - more industrial
            tags.extend(["industrial_area", "warehouse", "factory", "road"])
        if lon > 73.85:  # Eastern Pune - more residential
            tags.extend(["residential", "building", "road", "parking"])
        if lat < 18.48:  # Southern Pune - mixed
            tags.extend(["commercial", "building", "road", "vegetation"])
        if 18.50 < lat < 18.55 and 73.80 < lon < 73.90:  # Central Pune
            tags.extend(["commercial", "residential", "school", "hospital"])
        
        # Random features
        features = [
            "solar_panel", "tin_roof", "water_tank", "swimming_pool",
            "parking_lot", "construction_site", "vegetation", "bare_land",
            "road", "highway", "building", "residential", "commercial"
        ]
        num_features = np.random.randint(2, 6)
        tags.extend(np.random.choice(features, num_features, replace=False).tolist())
        
        return list(set(tags))
    
    def search_tiles_by_text(self, query_text: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Zero-shot text-to-tile search using CLIP embeddings.
        Returns top-K most similar tiles to the text query.
        """
        # Simulate CLIP text embedding
        np.random.seed(hash(query_text) % 2**31)
        text_embedding = np.random.randn(512).astype(np.float32)
        text_embedding = text_embedding / (np.linalg.norm(text_embedding) + 1e-8)
        
        # Compute cosine similarity with all tile embeddings
        results = []
        for tile in self.pune_tiles:
            similarity = float(np.dot(text_embedding, tile["embedding"]))
            
            # Boost similarity if tile tags match query terms
            query_terms = query_text.lower().split()
            tag_bonus = sum(0.1 for tag in tile["tags"] 
                          if any(term in tag.replace("_", " ") for term in query_terms))
            similarity += tag_bonus
            
            results.append({
                "tile_id": tile["tile_id"],
                "similarity": min(similarity, 1.0),
                "confidence": min((similarity + 1) / 2, 0.99),
                "center_lat": tile["center_lat"],
                "center_lon": tile["center_lon"],
                "lat_min": tile["lat_min"],
                "lat_max": tile["lat_max"],
                "lon_min": tile["lon_min"],
                "lon_max": tile["lon_max"],
                "tags": tile["tags"],
                "source": tile["source"],
                "acquisition_date": tile["acquisition_date"]
            })
        
        # Sort by similarity and return top-K
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]
    
    def detect_objects(self, tile_id: str, object_class: str) -> List[Dict[str, Any]]:
        """
        OWL-ViT zero-shot object detection on a tile.
        Returns bounding boxes for detected objects.
        """
        tile = self.tile_metadata.get(tile_id)
        if not tile:
            return []
        
        detections = []
        
        # Simulate detections based on tile tags
        np.random.seed(hash(tile_id + object_class) % 2**31)
        
        # Check if this tile likely contains the object
        object_normalized = object_class.lower().replace(" ", "_")
        tag_match = any(object_normalized in tag or tag in object_normalized 
                       for tag in tile["tags"])
        
        if not tag_match:
            # Low chance of detection in non-matching tiles
            if np.random.random() > 0.3:
                return []
        
        # Generate 1-5 detections per tile
        num_detections = np.random.randint(1, 6) if tag_match else np.random.randint(0, 2)
        
        for _ in range(num_detections):
            # Random bbox within tile bounds
            lat_range = tile["lat_max"] - tile["lat_min"]
            lon_range = tile["lon_max"] - tile["lon_min"]
            
            bbox_width = np.random.uniform(0.1, 0.4) * lat_range
            bbox_height = np.random.uniform(0.1, 0.4) * lon_range
            
            lat_min = tile["lat_min"] + np.random.uniform(0, lat_range - bbox_width)
            lon_min = tile["lon_min"] + np.random.uniform(0, lon_range - bbox_height)
            
            confidence = np.random.uniform(0.5, 0.95) if tag_match else np.random.uniform(0.3, 0.7)
            
            detections.append({
                "detection_class": object_class,
                "confidence": float(confidence),
                "bbox": {
                    "lat_min": float(lat_min),
                    "lat_max": float(lat_min + bbox_width),
                    "lon_min": float(lon_min),
                    "lon_max": float(lon_min + bbox_height)
                },
                "center_lat": float(lat_min + bbox_width / 2),
                "center_lon": float(lon_min + bbox_height / 2),
                "tile_id": tile_id,
                "model": "OWL-ViT",
                "explanation": self._get_detection_explanation(object_class, confidence)
            })
        
        # Sort by confidence
        detections.sort(key=lambda x: x["confidence"], reverse=True)
        return detections
    
    def _get_detection_explanation(self, object_class: str, confidence: float) -> str:
        """Generate explanation for a detection"""
        explanations = {
            "solar_panel": "Rectangular reflective surface detected on rooftop, consistent with photovoltaic panel geometry and spectral signature",
            "tin_roof": "Metallic reflective roof surface with corrugated pattern detected, consistent with corrugated metal sheet roofing",
            "building": "Rectangular built structure with defined edges and shadow pattern detected in satellite imagery",
            "water_tank": "Circular or rectangular water storage structure detected on rooftop or ground level",
            "construction_site": "Area with exposed earth, construction materials, and partial structures detected",
            "vegetation": "Dense green vegetation cover detected with high NDVI signature",
            "parking_lot": "Organized rectangular area with vehicle-sized objects and paved surface detected",
            "road": "Linear paved surface with consistent width detected in satellite imagery"
        }
        
        base = explanations.get(object_class.lower(), f"Object matching '{object_class}' visual pattern detected")
        return f"{base} (confidence: {confidence*100:.1f}%)"
    
    def get_attention_heatmap(self, tile_id: str, detection: Dict) -> np.ndarray:
        """
        Generate simulated GradCAM-style attention heatmap for explainability.
        Returns a 2D numpy array representing attention weights.
        """
        np.random.seed(hash(tile_id + str(detection.get("bbox", {}))) % 2**31)
        
        # Create a 64x64 heatmap
        heatmap = np.random.uniform(0, 0.3, (64, 64))
        
        # Add a Gaussian blob at the detection location
        bbox = detection.get("bbox", {})
        if bbox:
            # Map bbox to heatmap coordinates
            tile = self.tile_metadata.get(tile_id, {})
            if tile:
                cx = int(32 * (detection.get("center_lon", tile.get("center_lon", 0)) - tile.get("lon_min", 0)) / 
                         (tile.get("lon_max", 1) - tile.get("lon_min", 0)))
                cy = int(32 * (detection.get("center_lat", tile.get("center_lat", 0)) - tile.get("lat_min", 0)) / 
                         (tile.get("lat_max", 1) - tile.get("lat_min", 0)))
                
                cx = np.clip(cx, 0, 63)
                cy = np.clip(cy, 0, 63)
                
                # Gaussian blob
                for i in range(64):
                    for j in range(64):
                        dist = np.sqrt((i - cy)**2 + (j - cx)**2)
                        heatmap[i, j] += 0.7 * np.exp(-dist**2 / 50)
        
        # Normalize to [0, 1]
        heatmap = heatmap / (heatmap.max() + 1e-8)
        return heatmap
    
    def compute_temporal_change(self, tile_id: str, date1: str, date2: str) -> Dict:
        """
        Compute change detection between two time periods for a tile.
        """
        np.random.seed(hash(tile_id + date1 + date2) % 2**31)
        
        changes = {
            "tile_id": tile_id,
            "date1": date1,
            "date2": date2,
            "change_types": [],
            "change_percentage": float(np.random.uniform(5, 35)),
            "new_construction": int(np.random.randint(0, 8)),
            "demolished": int(np.random.randint(0, 3)),
            "vegetation_change": float(np.random.uniform(-20, 20)),
        }
        
        if changes["new_construction"] > 0:
            changes["change_types"].append("new_construction")
        if changes["demolished"] > 0:
            changes["change_types"].append("demolition")
        if changes["vegetation_change"] < -10:
            changes["change_types"].append("vegetation_loss")
        elif changes["vegetation_change"] > 10:
            changes["change_types"].append("vegetation_gain")
        
        return changes

# Singleton instance
vlm_service = VLMService()
