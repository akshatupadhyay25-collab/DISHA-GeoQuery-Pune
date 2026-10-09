"""
Gemini Service - Natural Language Query Understanding
Uses Gemini 2.0 Flash Lite for query decomposition and understanding
"""
import json
from typing import Dict, Any, Optional
from app.core.config import settings
import os

# Try to import Gemini SDK (handle both old and new versions)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    try:
        from google import genai
        GEMINI_AVAILABLE = True
    except ImportError:
        GEMINI_AVAILABLE = False
        genai = None

class GeminiService:
    def __init__(self):
        self.model = None
        api_key = os.getenv("GEMINI_API_KEY", settings.GEMINI_API_KEY)
        
        if GEMINI_AVAILABLE and api_key:
            try:
                # Try old API first
                if hasattr(genai, 'configure'):
                    genai.configure(api_key=api_key)
                    self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
                # Try new API
                elif hasattr(genai, 'Client'):
                    client = genai.Client(api_key=api_key)
                    self.model = client
            except Exception as e:
                print(f"Warning: Could not initialize Gemini: {e}")
                self.model = None
    
    def parse_query(self, user_query: str) -> Dict[str, Any]:
        """
        Parse natural language query into structured components
        Returns: {
            "visual_search_terms": [...],
            "spatial_filter": {...},
            "spatial_target": {...},
            "return_format": {...},
            "temporal_filter": {...}
        }
        """
        if not self.model:
            return self._fallback_parse(user_query)
        
        prompt = f"""You are a GeoAI query parser. Parse this natural language query about infrastructure in Pune, India into structured components.

Query: "{user_query}"

Extract and return as JSON:
{{
    "visual_search_terms": ["list of visual features to search for in satellite imagery"],
    "spatial_filter": {{
        "type": "buffer/intersect/within/near",
        "distance_meters": number or null,
        "description": "spatial relationship description"
    }},
    "spatial_target": {{
        "type": "osm_feature/landmark/area",
        "name": "name of target (e.g., Mula river, Kothrud)",
        "osm_tags": {{"key": "value"}} or null
    }},
    "temporal_filter": {{
        "time_period": "e.g., last 2 years, since 2020",
        "comparison": "before/after/between"
    }},
    "return_format": {{
        "include_coordinates": true,
        "include_bboxes": true,
        "include_confidence": true
    }},
    "context": {{
        "is_pune_specific": true,
        "local_references": ["any Pune-specific area names mentioned"]
    }}
}}

Only return valid JSON, no other text."""

        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
            return result
        except Exception as e:
            print(f"Gemini parse error: {e}")
            return self._fallback_parse(user_query)
    
    def generate_explanation(self, detection_class: str, confidence: float, metadata: Dict) -> str:
        """Generate human-readable explanation for a detection"""
        if not self.model:
            return f"Detected as {detection_class} with {confidence*100:.1f}% confidence"
        
        prompt = f"""Generate a brief, clear explanation for this AI detection result:
- Detected object: {detection_class}
- Confidence: {confidence*100:.1f}%
- Context: {json.dumps(metadata)}

Write one sentence explaining why the AI identified this as {detection_class}. Focus on visual features."""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except:
            return f"Detected as {detection_class} with {confidence*100:.1f}% confidence"
    
    def generate_insights(self, query: str, results_count: int, metadata: Dict) -> str:
        """Generate AI-written insights for a query result"""
        if not self.model:
            return f"Found {results_count} matching features for your query."
        
        prompt = f"""You are a GeoAI assistant providing insights about infrastructure in Pune, India.

Query: "{query}"
Results found: {results_count}
Metadata: {json.dumps(metadata)}

Write 2-3 sentences of actionable insights about these results. Mention any patterns, risks, or notable findings. Be specific to Pune context when relevant."""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except:
            return f"Found {results_count} matching features."
    
    def _fallback_parse(self, query: str) -> Dict[str, Any]:
        """Fallback rule-based parsing when Gemini is unavailable"""
        query_lower = query.lower()
        
        # Extract visual search terms
        visual_terms = []
        visual_keywords = [
            "solar panel", "tin roof", "building", "road", "water tank",
            "swimming pool", "vegetation", "forest", "construction",
            "parking lot", "commercial", "residential", "industrial"
        ]
        for kw in visual_keywords:
            if kw in query_lower:
                visual_terms.append(kw)
        
        if not visual_terms:
            visual_terms = [query]
        
        # Extract spatial filter
        spatial_filter = {"type": "none", "distance_meters": None}
        if "within" in query_lower or "near" in query_lower or "close to" in query_lower:
            # Try to extract distance
            import re
            distance_match = re.search(r'(\d+)\s*(m|meter|km|kilometer)', query_lower)
            if distance_match:
                distance = int(distance_match.group(1))
                unit = distance_match.group(2)
                if unit.startswith('km'):
                    distance *= 1000
                spatial_filter = {"type": "buffer", "distance_meters": distance}
            else:
                spatial_filter = {"type": "buffer", "distance_meters": 200}
        
        if "intersect" in query_lower:
            spatial_filter["type"] = "intersect"
        
        # Extract spatial target
        spatial_target = {"type": "none", "name": None}
        pune_features = [
            "mula river", "mutha river", "pavana river",
            "kothrud", "baner", "hinjewadi", "viman nagar",
            "koregaon park", "shivaji nagar", "deccan"
        ]
        for feature in pune_features:
            if feature in query_lower:
                spatial_target = {
                    "type": "osm_feature",
                    "name": feature.title(),
                    "osm_tags": None
                }
                break
        
        # Extract temporal filter
        temporal_filter = {"time_period": None}
        if "since" in query_lower or "between" in query_lower or "last" in query_lower:
            temporal_filter["time_period"] = "temporal query detected"
        
        return {
            "visual_search_terms": visual_terms,
            "spatial_filter": spatial_filter,
            "spatial_target": spatial_target,
            "temporal_filter": temporal_filter,
            "return_format": {
                "include_coordinates": True,
                "include_bboxes": True,
                "include_confidence": True
            },
            "context": {
                "is_pune_specific": any(f in query_lower for f in pune_features),
                "local_references": []
            }
        }

# Singleton instance
gemini_service = GeminiService()
