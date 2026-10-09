"""
Geospatial Service
Handles spatial operations using GeoPandas, Shapely, and PostGIS-compatible operations
"""
import json
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import math

class SpatialService:
    """
    Manages all geospatial operations: buffering, intersection,
    proximity analysis, GeoJSON generation, and flood simulation.
    """
    
    def __init__(self):
        self._initialize_pune_data()
    
    def _initialize_pune_data(self):
        """Initialize with realistic Pune geospatial data"""
        
        # Mula River - major waterway through Pune
        self.waterways = {
            "mula_river": {
                "name": "Mula River",
                "type": "river",
                "geometry": self._generate_river_path(
                    start_lat=18.56, start_lon=73.72,
                    end_lat=18.52, end_lon=73.92,
                    meander=0.003
                )
            },
            "mutha_river": {
                "name": "Mutha River",
                "type": "river", 
                "geometry": self._generate_river_path(
                    start_lat=18.49, start_lon=73.75,
                    end_lat=18.52, end_lon=73.92,
                    meander=0.002
                )
            },
            "pavana_river": {
                "name": "Pavana River",
                "type": "river",
                "geometry": self._generate_river_path(
                    start_lat=18.60, start_lon=73.70,
                    end_lat=18.56, end_lon=73.78,
                    meander=0.002
                )
            }
        }
        
        # Pune areas/neighborhoods
        self.areas = {
            "kothrud": {"name": "Kothrud", "center": (18.51, 73.80), "radius": 0.015},
            "baner": {"name": "Baner", "center": (18.56, 73.78), "radius": 0.012},
            "hinjewadi": {"name": "Hinjewadi", "center": (18.59, 73.74), "radius": 0.020},
            "viman_nagar": {"name": "Viman Nagar", "center": (18.56, 73.91), "radius": 0.010},
            "koregaon_park": {"name": "Koregaon Park", "center": (18.53, 73.90), "radius": 0.008},
            "shivaji_nagar": {"name": "Shivaji Nagar", "center": (18.53, 73.84), "radius": 0.010},
            "deccan": {"name": "Deccan", "center": (18.51, 73.83), "radius": 0.008},
            "warje": {"name": "Warje", "center": (18.48, 73.78), "radius": 0.012},
            "hadapsar": {"name": "Hadapsar", "center": (18.51, 73.93), "radius": 0.015},
            "wakad": {"name": "Wakad", "center": (18.58, 73.77), "radius": 0.012},
        }
        
        # Generate sample buildings across Pune
        np.random.seed(42)
        self.buildings = []
        building_types = ["residential", "commercial", "industrial", "school", "hospital", "temple"]
        roof_types = ["concrete", "tin", "tile", "metal_sheet", "solar_panel"]
        
        for i in range(500):
            lat = 18.44 + np.random.uniform(0, 0.18)
            lon = 73.70 + np.random.uniform(0, 0.30)
            
            # Weight building types by area
            if lat > 18.55:
                btype = np.random.choice(["industrial", "warehouse", "residential"], p=[0.4, 0.3, 0.3])
            elif lon > 73.85:
                btype = np.random.choice(["residential", "commercial", "school"], p=[0.5, 0.3, 0.2])
            else:
                btype = np.random.choice(building_types)
            
            size_m = np.random.uniform(50, 500)  # Building area in sq meters
            height_m = np.random.uniform(3, 30)
            
            # Roof type based on building type and area
            if btype == "industrial":
                roof = np.random.choice(["tin", "metal_sheet"], p=[0.6, 0.4])
            elif btype == "residential":
                roof = np.random.choice(["concrete", "tin", "tile"], p=[0.6, 0.25, 0.15])
            else:
                roof = np.random.choice(roof_types)
            
            # Solar panel probability
            has_solar = np.random.random() < 0.08  # 8% of buildings
            
            building = {
                "id": f"building_{i:04d}",
                "lat": lat,
                "lon": lon,
                "building_type": btype,
                "roof_material": roof,
                "has_solar_panel": has_solar,
                "height_m": height_m,
                "area_sqm": size_m,
                "bbox": {
                    "lat_min": lat - 0.0002,
                    "lat_max": lat + 0.0002,
                    "lon_min": lon - 0.0002,
                    "lon_max": lon + 0.0002
                },
                "address": self._generate_address(lat, lon)
            }
            self.buildings.append(building)
        
        # DEM (Digital Elevation Model) - simplified for Pune
        self.elevation_data = self._generate_dem()
    
    def _generate_river_path(self, start_lat, start_lon, end_lat, end_lon, meander=0.002):
        """Generate a realistic meandering river path"""
        num_points = 20
        points = []
        for i in range(num_points):
            t = i / (num_points - 1)
            lat = start_lat + (end_lat - start_lat) * t + meander * np.sin(3 * np.pi * t)
            lon = start_lon + (end_lon - start_lon) * t + meander * np.cos(2 * np.pi * t)
            points.append([lon, lat])  # GeoJSON uses [lon, lat]
        return {"type": "LineString", "coordinates": points}
    
    def _generate_address(self, lat: float, lon: float) -> str:
        """Generate a realistic Pune address"""
        area = self._get_area_for_coords(lat, lon)
        streets = ["MG Road", "JM Road", "FC Road", "SB Road", "Baner Road", 
                   "Pashan Road", "Kothrud Road", "Karve Road", "Sinhagad Road"]
        return f"{np.random.randint(1, 200)}, {np.random.choice(streets)}, {area}, Pune"
    
    def _get_area_for_coords(self, lat: float, lon: float) -> str:
        """Get the area name for given coordinates"""
        for area_key, area in self.areas.items():
            center_lat, center_lon = area["center"]
            dist = math.sqrt((lat - center_lat)**2 + (lon - center_lon)**2)
            if dist < area["radius"]:
                return area["name"]
        return "Pune"
    
    def _generate_dem(self) -> Dict:
        """Generate simplified Digital Elevation Model for Pune"""
        # Pune elevation ranges from ~550m to ~700m
        # Rivers flow through lower elevations
        dem = {}
        for lat_i in range(36):  # 0.005 degree grid
            for lon_i in range(60):
                lat = 18.44 + lat_i * 0.005
                lon = 73.70 + lon_i * 0.005
                
                # Base elevation
                elevation = 560 + 50 * (lat - 18.44) / 0.18
                # Add some terrain variation
                elevation += 20 * np.sin(lat * 100) * np.cos(lon * 100)
                # Lower near rivers
                for river in self.waterways.values():
                    for pt in river["geometry"]["coordinates"]:
                        dist = math.sqrt((lon - pt[0])**2 + (lat - pt[1])**2)
                        if dist < 0.01:
                            elevation -= 30 * (1 - dist / 0.01)
                
                dem[f"{lat:.4f},{lon:.4f}"] = float(elevation)
        
        return dem
    
    def buffer_geometry(self, geometry: Dict, distance_meters: float) -> Dict:
        """Create a buffer around a geometry"""
        # Approximate: 1 degree ≈ 111,000 meters
        buffer_deg = distance_meters / 111000.0
        
        if geometry["type"] == "LineString":
            # Buffer a line -> create a polygon
            coords = geometry["coordinates"]
            # Simple buffer: expand each point
            buffered_points = []
            for pt in coords:
                lon, lat = pt
                for angle in np.linspace(0, 2 * np.pi, 16):
                    buffered_points.append([
                        lon + buffer_deg * np.cos(angle),
                        lat + buffer_deg * np.sin(angle)
                    ])
            
            # Create convex hull approximation
            from functools import cmp_to_key
            # Simplified: just create a polygon from the expanded coordinates
            all_points = []
            for pt in coords:
                lon, lat = pt
                all_points.append([lon + buffer_deg, lat + buffer_deg])
            for pt in reversed(coords):
                lon, lat = pt
                all_points.append([lon - buffer_deg, lat - buffer_deg])
            all_points.append(all_points[0])  # Close the polygon
            
            return {"type": "Polygon", "coordinates": [all_points]}
        
        return geometry
    
    def point_in_buffer(self, point_lat: float, point_lon: float, 
                       geometry: Dict, buffer_meters: float) -> bool:
        """Check if a point is within a buffered geometry"""
        buffer_deg = buffer_meters / 111000.0
        
        if geometry["type"] == "LineString":
            coords = geometry["coordinates"]
            for i in range(len(coords) - 1):
                p1 = coords[i]
                p2 = coords[i + 1]
                
                # Distance from point to line segment
                dist = self._point_to_segment_distance(
                    point_lon, point_lat, p1[0], p1[1], p2[0], p2[1]
                )
                if dist <= buffer_deg:
                    return True
        return False
    
    def _point_to_segment_distance(self, px, py, x1, y1, x2, y2):
        """Calculate distance from point to line segment"""
        dx = x2 - x1
        dy = y2 - y1
        
        if dx == 0 and dy == 0:
            return math.sqrt((px - x1)**2 + (py - y1)**2)
        
        t = max(0, min(1, ((px - x1) * dx + (py - y1) * dy) / (dx**2 + dy**2)))
        proj_x = x1 + t * dx
        proj_y = y1 + t * dy
        
        return math.sqrt((px - proj_x)**2 + (py - proj_y)**2)
    
    def filter_by_proximity(self, detections: List[Dict], target_geometry: Dict, 
                           buffer_meters: float) -> List[Dict]:
        """Filter detections to those within buffer of target geometry"""
        filtered = []
        for det in detections:
            center_lat = det.get("center_lat", 0)
            center_lon = det.get("center_lon", 0)
            
            if self.point_in_buffer(center_lat, center_lon, target_geometry, buffer_meters):
                det["distance_to_target"] = self._min_distance_to_geometry(
                    center_lat, center_lon, target_geometry
                ) * 111000  # Convert to meters
                filtered.append(det)
        
        filtered.sort(key=lambda x: x.get("distance_to_target", float('inf')))
        return filtered
    
    def _min_distance_to_geometry(self, lat, lon, geometry):
        """Minimum distance from point to geometry"""
        if geometry["type"] == "LineString":
            min_dist = float('inf')
            coords = geometry["coordinates"]
            for i in range(len(coords) - 1):
                dist = self._point_to_segment_distance(
                    lon, lat, coords[i][0], coords[i][1],
                    coords[i+1][0], coords[i+1][1]
                )
                min_dist = min(min_dist, dist)
            return min_dist
        return 0
    
    def get_target_geometry(self, target_name: str) -> Optional[Dict]:
        """Get geometry for a named target (river, area, etc.)"""
        target_lower = target_name.lower().replace(" ", "_")
        
        # Check waterways
        for key, waterway in self.waterways.items():
            if target_lower in key or target_lower in waterway["name"].lower().replace(" ", "_"):
                return waterway["geometry"]
        
        # Check areas
        for key, area in self.areas.items():
            if target_lower in key or target_lower in area["name"].lower().replace(" ", "_"):
                # Return area as a circle polygon
                center_lat, center_lon = area["center"]
                radius = area["radius"]
                points = []
                for angle in np.linspace(0, 2 * np.pi, 32):
                    points.append([
                        center_lon + radius * np.cos(angle),
                        center_lat + radius * np.sin(angle)
                    ])
                points.append(points[0])
                return {"type": "Polygon", "coordinates": [points]}
        
        return None
    
    def generate_geojson(self, detections: List[Dict], include_metadata: bool = True) -> Dict:
        """Convert detections to GeoJSON FeatureCollection"""
        features = []
        
        for i, det in enumerate(detections):
            bbox = det.get("bbox", {})
            if bbox:
                geometry = {
                    "type": "Polygon",
                    "coordinates": [[
                        [bbox["lon_min"], bbox["lat_min"]],
                        [bbox["lon_max"], bbox["lat_min"]],
                        [bbox["lon_max"], bbox["lat_max"]],
                        [bbox["lon_min"], bbox["lat_max"]],
                        [bbox["lon_min"], bbox["lat_min"]]
                    ]]
                }
            else:
                geometry = {
                    "type": "Point",
                    "coordinates": [det.get("center_lon", 0), det.get("center_lat", 0)]
                }
            
            properties = {
                "id": det.get("detection_class", "feature") + f"_{i}",
                "detection_class": det.get("detection_class"),
                "confidence": det.get("confidence"),
                "model": det.get("model", "OWL-ViT"),
                "explanation": det.get("explanation", ""),
                "tile_id": det.get("tile_id", ""),
            }
            
            if "distance_to_target" in det:
                properties["distance_to_target_m"] = round(det["distance_to_target"], 1)
            
            if include_metadata:
                properties.update({
                    "center_lat": det.get("center_lat"),
                    "center_lon": det.get("center_lon"),
                })
            
            features.append({
                "type": "Feature",
                "geometry": geometry,
                "properties": properties
            })
        
        return {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {
                "total_features": len(features),
                "generated_at": datetime.now().isoformat(),
                "crs": "EPSG:4326"
            }
        }
    
    def simulate_flood(self, waterway_name: str, water_level_meters: float) -> Dict:
        """
        GeoSimulator Feature: Simulate flood impact
        Returns affected buildings and risk assessment.
        """
        waterway = None
        for key, w in self.waterways.items():
            if waterway_name.lower() in key or waterway_name.lower() in w["name"].lower():
                waterway = w
                break
        
        if not waterway:
            return {"error": f"Waterway '{waterway_name}' not found"}
        
        # Find all buildings near the waterway
        affected_buildings = []
        high_risk = []
        medium_risk = []
        low_risk = []
        
        buffer_m = water_level_meters * 50  # Approximate spread per meter of water level
        
        for building in self.buildings:
            lat, lon = building["lat"], building["lon"]
            
            if self.point_in_buffer(lat, lon, waterway["geometry"], buffer_m):
                # Calculate actual distance
                dist = self._min_distance_to_geometry(
                    lat, lon, waterway["geometry"]
                ) * 111000  # meters
                
                # Get building elevation relative to river
                elevation = self.elevation_data.get(
                    f"{lat:.4f},{lon:.4f}", 580
                )
                
                # Risk assessment
                relative_height = elevation - 555  # Approximate river level
                risk_score = max(0, min(1, 1 - (relative_height / (water_level_meters * 2))))
                
                affected = {
                    **building,
                    "distance_to_river_m": round(dist, 1),
                    "elevation_m": round(elevation, 1),
                    "risk_score": round(risk_score, 3),
                    "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.4 else "low"
                }
                
                affected_buildings.append(affected)
                
                if risk_score > 0.7:
                    high_risk.append(affected)
                elif risk_score > 0.4:
                    medium_risk.append(affected)
                else:
                    low_risk.append(affected)
        
        # Generate flood zone polygon
        flood_zone = self.buffer_geometry(waterway["geometry"], buffer_m)
        
        return {
            "simulation_type": "flood",
            "waterway": waterway["name"],
            "water_level_meters": water_level_meters,
            "buffer_meters": buffer_m,
            "summary": {
                "total_affected": len(affected_buildings),
                "high_risk": len(high_risk),
                "medium_risk": len(medium_risk),
                "low_risk": len(low_risk),
                "estimated_population": len(affected_buildings) * 4,  # ~4 people per building
            },
            "flood_zone": flood_zone,
            "affected_buildings": affected_buildings[:50],  # Limit for performance
            "risk_breakdown": {
                "high": high_risk[:20],
                "medium": medium_risk[:20],
                "low": low_risk[:20]
            }
        }
    
    def temporal_change_detection(self, area_name: str, year1: int, year2: int) -> Dict:
        """
        TemporalDiff Feature: Detect changes between two time periods
        """
        np.random.seed(hash(f"{area_name}_{year1}_{year2}") % 2**31)
        
        # Simulate change detection results
        new_constructions = int(np.random.randint(5, 25))
        demolished = int(np.random.randint(1, 8))
        vegetation_loss_pct = float(np.random.uniform(2, 15))
        vegetation_gain_pct = float(np.random.uniform(0, 5))
        
        changes = []
        
        # New constructions
        for i in range(min(new_constructions, 10)):
            area = self.areas.get(area_name.lower().replace(" ", "_"))
            if area:
                center_lat, center_lon = area["center"]
            else:
                center_lat, center_lon = 18.52, 73.85
            
            lat = center_lat + np.random.uniform(-0.01, 0.01)
            lon = center_lon + np.random.uniform(-0.01, 0.01)
            
            changes.append({
                "type": "new_construction",
                "lat": float(lat),
                "lon": float(lon),
                "area_sqm": float(np.random.uniform(100, 2000)),
                "building_type": np.random.choice(["residential", "commercial", "industrial"]),
                "year_built": np.random.randint(year1 + 1, year2 + 1),
                "confidence": float(np.random.uniform(0.8, 0.98))
            })
        
        # Demolitions
        for i in range(min(demolished, 5)):
            if area:
                center_lat, center_lon = area["center"]
            else:
                center_lat, center_lon = 18.52, 73.85
            
            lat = center_lat + np.random.uniform(-0.01, 0.01)
            lon = center_lon + np.random.uniform(-0.01, 0.01)
            
            changes.append({
                "type": "demolition",
                "lat": float(lat),
                "lon": float(lon),
                "previous_type": np.random.choice(["residential", "commercial"]),
                "year_demolished": np.random.randint(year1 + 1, year2 + 1),
                "confidence": float(np.random.uniform(0.7, 0.95))
            })
        
        return {
            "area": area_name,
            "period": f"{year1}-{year2}",
            "summary": {
                "new_constructions": new_constructions,
                "demolished": demolished,
                "net_change": new_constructions - demolished,
                "vegetation_loss_pct": round(vegetation_loss_pct, 1),
                "vegetation_gain_pct": round(vegetation_gain_pct, 1),
            },
            "changes": changes,
            "change_geojson": self._changes_to_geojson(changes)
        }
    
    def _changes_to_geojson(self, changes: List[Dict]) -> Dict:
        """Convert changes to GeoJSON"""
        features = []
        for i, change in enumerate(changes):
            color = "#00ff00" if change["type"] == "new_construction" else "#ff0000"
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [change["lon"], change["lat"]]
                },
                "properties": {
                    **change,
                    "marker_color": color,
                    "id": f"change_{i}"
                }
            })
        return {"type": "FeatureCollection", "features": features}

# Singleton
spatial_service = SpatialService()
