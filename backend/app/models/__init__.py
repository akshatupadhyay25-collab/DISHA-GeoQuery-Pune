from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base
import json

class Building(Base):
    __tablename__ = "buildings"
    
    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, index=True)
    geometry_wkt = Column(Text)  # Store as WKT for SQLite compatibility
    building_type = Column(String)
    height = Column(Float)
    roof_material = Column(String)
    address = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

class Road(Base):
    __tablename__ = "roads"
    
    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, index=True)
    geometry_wkt = Column(Text)
    road_type = Column(String)
    surface = Column(String)
    name = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class Waterway(Base):
    __tablename__ = "waterways"
    
    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, index=True)
    geometry_wkt = Column(Text)
    waterway_type = Column(String)
    name = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class SatelliteTile(Base):
    __tablename__ = "satellite_tiles"
    
    id = Column(Integer, primary_key=True, index=True)
    tile_id = Column(String, unique=True, index=True)
    file_path = Column(String)
    lat_min = Column(Float)
    lat_max = Column(Float)
    lon_min = Column(Float)
    lon_max = Column(Float)
    center_lat = Column(Float)
    center_lon = Column(Float)
    zoom_level = Column(Integer)
    source = Column(String)  # skyscript, sentinel, etc.
    acquisition_date = Column(DateTime)
    embedding_vector = Column(Text)  # Store as JSON string
    metadata_json = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

class AIDetection(Base):
    __tablename__ = "ai_detections"
    
    id = Column(Integer, primary_key=True, index=True)
    tile_id = Column(String, index=True)
    query_id = Column(String, index=True)
    detection_class = Column(String, index=True)
    confidence = Column(Float)
    bbox_wkt = Column(Text)  # Bounding box as WKT
    lat_min = Column(Float)
    lat_max = Column(Float)
    lon_min = Column(Float)
    lon_max = Column(Float)
    center_lat = Column(Float)
    center_lon = Column(Float)
    model_version = Column(String)
    explanation = Column(Text)
    metadata_json = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

class Query(Base):
    __tablename__ = "queries"
    
    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(String, unique=True, index=True)
    user_query = Column(Text)
    parsed_query_json = Column(Text)
    results_count = Column(Integer)
    results_geojson = Column(Text)
    status = Column(String)  # pending, processing, completed, failed
    processing_time_ms = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(String, unique=True, index=True)
    query_id = Column(String, index=True)
    simulation_type = Column(String)  # flood, fire, earthquake
    parameters_json = Column(Text)
    affected_count = Column(Integer)
    affected_geojson = Column(Text)
    risk_score = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
