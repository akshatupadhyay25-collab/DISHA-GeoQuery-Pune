"""
Real Spatial Service using actual OSM data
Implements geospatial operations with real data from OpenStreetMap
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import geopandas as gpd
from shapely.geometry import shape, Point, Polygon, LineString
from shapely.ops import nearest_points
import numpy as np

class RealSpatialService:
    """Production spatial service using real OSM data"""
    
    def __init__(self):
        print("🗺️  Initializing Real Spatial Service...")
        
        self.data_dir = Path(__file__).parent.parent.parent / 'data' / 'osm'
        
        # Load OSM data
        self.buildings_gdf = None
        self.roads_gdf = None
        self.waterways_gdf = None
        
        self._load_osm_data()
        
        print("✅ Spatial Service initialized")
    
    def _load_osm_data(self):
        """Load OSM data from GeoPackage files"""
        print("  Loading OSM data...")
        
        # Load buildings
        buildings_file = self.data_dir / 'pune_buildings.gpkg'
        if buildings_file.exists():
            self.buildings_gdf = gpd.read_file(buildings_file)
            print(f"    ✅ Buildings: {len(self.buildings_gdf)} features")
        else:
            print(f"    ⚠️  Buildings file not found: {buildings_file}")
        
        # Load roads
        roads_file = self.data_dir / 'pune_roads.gpkg'
        if roads_file.exists():
            self.roads_gdf = gpd.read_file(roads_file)
            print(f"    ✅ Roads: {len(self.roads_gdf)} features")
        else:
            print(f"    ⚠️  Roads file not found: {roads_file}")
        
        # Load waterways
        waterways_file = self.data_dir / 'pune_waterways.gpkg'
        if waterways_file.exists():
            self.waterways_gdf = gpd.read_file(waterways_file)
            print(f"    ✅ Waterways: {len(self.waterways_gdf)} features")
        else:
            print(f"    ⚠️  Waterways file not found: {waterways_file}")
    
    def get_buildings_in_bbox(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float
    ) -> List[Dict[str, Any]]:
        """Get buildings within a bounding box"""
        if self.buildings_gdf is None:
            return []
        
        # Create bounding box polygon
        bbox = Polygon([
            (min_lon, min_lat),
            (max_lon, min_lat),
            (max_lon, max_lat),
            (min_lon, max_lat),
            (min_lon, min_lat)
        ])
        
        # Filter buildings within bbox
        mask = self.buildings_gdf.geometry.within(bbox)
        filtered = self.buildings_gdf[mask]
        
        # Convert to list of dicts
        results = []
        for _, row in filtered.iterrows():
            centroid = row.geometry.centroid
            results.append({
                'osm_id': row.get('osm_id', ''),
                'building_type': row.get('building', 'yes'),
                'name': row.get('name', ''),
                'height': row.get('height', ''),
                'lat': centroid.y,
                'lon': centroid.x,
                'geometry': row.geometry.__geo_interface__
            })
        
        return results
    
    def get_buildings_near_point(
        self,
        lat: float,
        lon: float,
        radius_meters: float
    ) -> List[Dict[str, Any]]:
        """Get buildings within radius of a point"""
        if self.buildings_gdf is None:
            return []
        
        # Create point
        point = Point(lon, lat)
        
        # Create buffer (approximate - for production use proper projection)
        # 1 degree ≈ 111km, so convert meters to degrees
        radius_deg = radius_meters / 111000.0
        buffer = point.buffer(radius_deg)
        
        # Filter buildings within buffer
        mask = self.buildings_gdf.geometry.within(buffer)
        filtered = self.buildings_gdf[mask]
        
        # Calculate distances
        results = []
        for _, row in filtered.iterrows():
            centroid = row.geometry.centroid
            distance = point.distance(centroid) * 111000.0  # Convert to meters
            
            results.append({
                'osm_id': row.get('osm_id', ''),
                'building_type': row.get('building', 'yes'),
                'name': row.get('name', ''),
                'height': row.get('height', ''),
                'lat': centroid.y,
                'lon': centroid.x,
                'distance_m': distance,
                'geometry': row.geometry.__geo_interface__
            })
        
        # Sort by distance
        results.sort(key=lambda x: x['distance_m'])
        
        return results
    
    def get_roads_in_bbox(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float
    ) -> List[Dict[str, Any]]:
        """Get roads within a bounding box"""
        if self.roads_gdf is None:
            return []
        
        # Create bounding box
        bbox = Polygon([
            (min_lon, min_lat),
            (max_lon, min_lat),
            (max_lon, max_lat),
            (min_lon, max_lat),
            (min_lon, min_lat)
        ])
        
        # Filter roads
        mask = self.roads_gdf.geometry.intersects(bbox)
        filtered = self.roads_gdf[mask]
        
        # Convert to list
        results = []
        for _, row in filtered.iterrows():
            results.append({
                'osm_id': row.get('osm_id', ''),
                'highway_type': row.get('highway', ''),
                'name': row.get('name', ''),
                'surface': row.get('surface', ''),
                'geometry': row.geometry.__geo_interface__
            })
        
        return results
    
    def get_waterways_in_bbox(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float
    ) -> List[Dict[str, Any]]:
        """Get waterways within a bounding box"""
        if self.waterways_gdf is None:
            return []
        
        # Create bounding box
        bbox = Polygon([
            (min_lon, min_lat),
            (max_lon, min_lat),
            (max_lon, max_lat),
            (min_lon, max_lat),
            (min_lon, min_lat)
        ])
        
        # Filter waterways
        mask = self.waterways_gdf.geometry.intersects(bbox)
        filtered = self.waterways_gdf[mask]
        
        # Convert to list
        results = []
        for _, row in filtered.iterrows():
            results.append({
                'osm_id': row.get('osm_id', ''),
                'waterway_type': row.get('waterway', ''),
                'name': row.get('name', ''),
                'geometry': row.geometry.__geo_interface__
            })
        
        return results
    
    def find_nearest_waterway(
        self,
        lat: float,
        lon: float
    ) -> Optional[Dict[str, Any]]:
        """Find nearest waterway to a point"""
        if self.waterways_gdf is None or len(self.waterways_gdf) == 0:
            return None
        
        point = Point(lon, lat)
        
        # Find nearest
        min_distance = float('inf')
        nearest = None
        
        for _, row in self.waterways_gdf.iterrows():
            distance = point.distance(row.geometry)
            if distance < min_distance:
                min_distance = distance
                nearest = row
        
        if nearest is not None:
            return {
                'osm_id': nearest.get('osm_id', ''),
                'waterway_type': nearest.get('waterway', ''),
                'name': nearest.get('name', ''),
                'distance_m': min_distance * 111000.0,  # Convert to meters
                'geometry': nearest.geometry.__geo_interface__
            }
        
        return None
    
    def spatial_join_detections_with_buildings(
        self,
        detections: List[Dict[str, Any]],
        buffer_meters: float = 50.0
    ) -> List[Dict[str, Any]]:
        """
        Join AI detections with OSM building data
        For each detection, find nearby buildings from OSM
        """
        if self.buildings_gdf is None:
            return detections
        
        buffer_deg = buffer_meters / 111000.0
        
        enhanced_detections = []
        
        for detection in detections:
            # Get detection center
            bbox = detection.get('bbox', {})
            center_lat = (bbox.get('y1', 0) + bbox.get('y2', 0)) / 2
            center_lon = (bbox.get('x1', 0) + bbox.get('x2', 0)) / 2
            
            # Create point and buffer
            point = Point(center_lon, center_lat)
            buffer = point.buffer(buffer_deg)
            
            # Find buildings within buffer
            mask = self.buildings_gdf.geometry.within(buffer)
            nearby_buildings = self.buildings_gdf[mask]
            
            # Add building info to detection
            detection['nearby_buildings'] = []
            for _, building in nearby_buildings.iterrows():
                detection['nearby_buildings'].append({
                    'osm_id': building.get('osm_id', ''),
                    'building_type': building.get('building', 'yes'),
                    'name': building.get('name', '')
                })
            
            detection['building_count'] = len(nearby_buildings)
            
            enhanced_detections.append(detection)
        
        return enhanced_detections
    
    def generate_geojson(
        self,
        features: List[Dict[str, Any]],
        properties_key: str = 'properties'
    ) -> Dict[str, Any]:
        """Generate GeoJSON FeatureCollection from features"""
        geojson = {
            'type': 'FeatureCollection',
            'features': []
        }
        
        for feature in features:
            if 'geometry' in feature:
                geojson_feature = {
                    'type': 'Feature',
                    'geometry': feature['geometry'],
                    'properties': {
                        k: v for k, v in feature.items()
                        if k != 'geometry'
                    }
                }
                geojson['features'].append(geojson_feature)
        
        return geojson
    
    def export_to_file(
        self,
        geojson: Dict[str, Any],
        filepath: Path
    ):
        """Export GeoJSON to file"""
        with open(filepath, 'w') as f:
            json.dump(geojson, f, indent=2)
        
        print(f"✅ Exported GeoJSON to {filepath}")


# Global instance
spatial_service = RealSpatialService()
