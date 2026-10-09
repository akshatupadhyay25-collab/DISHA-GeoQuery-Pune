"""
Real VLM Service using OpenCLIP and OWL-ViT
Implements actual zero-shot image-text matching and object detection
"""

import torch
import numpy as np
from PIL import Image
from pathlib import Path
from typing import List, Dict, Any, Optional
import open_clip
from transformers import Owlv2Processor, Owlv2ForObjectDetection
from sentence_transformers import SentenceTransformer
import faiss
import json

class RealVLMService:
    """Production VLM service using real AI models"""
    
    def __init__(self):
        print("🤖 Initializing Real VLM Service...")
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"   Using device: {self.device}")
        
        # Load models
        self._load_openclip()
        self._load_owlvit()
        self._load_sentence_transformer()
        
        # Initialize embedding index
        self.tile_embeddings = []
        self.tile_metadata = []
        self.faiss_index = None
        
        print("✅ VLM Service initialized")
    
    def _load_openclip(self):
        """Load OpenCLIP model for zero-shot classification"""
        print("  Loading OpenCLIP ViT-B-32...")
        self.clip_model, _, self.clip_preprocess = open_clip.create_model_and_transforms(
            'ViT-B-32',
            pretrained='openai'
        )
        self.clip_tokenizer = open_clip.get_tokenizer('ViT-B-32')
        self.clip_model = self.clip_model.to(self.device)
        self.clip_model.eval()
        print("  ✅ OpenCLIP loaded")
    
    def _load_owlvit(self):
        """Load OWL-ViT model for object detection"""
        print("  Loading OWL-ViT v2...")
        self.owlvit_processor = Owlv2Processor.from_pretrained(
            "google/owlv2-base-patch16-ensemble"
        )
        self.owlvit_model = Owlv2ForObjectDetection.from_pretrained(
            "google/owlv2-base-patch16-ensemble"
        )
        self.owlvit_model = self.owlvit_model.to(self.device)
        self.owlvit_model.eval()
        print("  ✅ OWL-ViT loaded")
    
    def _load_sentence_transformer(self):
        """Load Sentence Transformer for query embeddings"""
        print("  Loading Sentence Transformer...")
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("  ✅ Sentence Transformer loaded")
    
    def encode_image(self, image: Image.Image) -> np.ndarray:
        """Encode image using OpenCLIP"""
        # Preprocess image
        image_tensor = self.clip_preprocess(image).unsqueeze(0).to(self.device)
        
        # Encode
        with torch.no_grad():
            image_features = self.clip_model.encode_image(image_tensor)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        
        return image_features.cpu().numpy()
    
    def encode_text(self, text: str) -> np.ndarray:
        """Encode text using OpenCLIP"""
        # Tokenize
        text_tensor = self.clip_tokenizer([text]).to(self.device)
        
        # Encode
        with torch.no_grad():
            text_features = self.clip_model.encode_text(text_tensor)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        
        return text_features.cpu().numpy()
    
    def zero_shot_classify(self, image: Image.Image, class_names: List[str]) -> Dict[str, float]:
        """
        Zero-shot image classification using OpenCLIP
        Returns probabilities for each class
        """
        # Encode image
        image_features = self.encode_image(image)
        
        # Encode all class names
        text_features = []
        for class_name in class_names:
            text_feat = self.encode_text(f"a satellite photo of {class_name}")
            text_features.append(text_feat)
        
        text_features = np.vstack(text_features)
        
        # Compute similarities
        similarities = (image_features @ text_features.T).flatten()
        
        # Convert to probabilities using softmax
        exp_similarities = np.exp(similarities * 100)  # Temperature scaling
        probabilities = exp_similarities / exp_similarities.sum()
        
        # Return as dictionary
        results = {
            class_name: float(prob)
            for class_name, prob in zip(class_names, probabilities)
        }
        
        return results
    
    def detect_objects(
        self,
        image: Image.Image,
        queries: List[str],
        threshold: float = 0.1
    ) -> List[Dict[str, Any]]:
        """
        Detect objects in image using OWL-ViT
        Returns list of detections with bounding boxes and confidence scores
        """
        # Process image and queries
        inputs = self.owlvit_processor(
            text=queries,
            images=image,
            return_tensors="pt",
            padding=True
        ).to(self.device)
        
        # Run detection
        with torch.no_grad():
            outputs = self.owlvit_model(**inputs)
        
        # Post-process detections
        target_sizes = torch.tensor([image.size[::-1]]).to(self.device)
        results = self.owlvit_processor.post_process_object_detection(
            outputs,
            target_sizes=target_sizes,
            threshold=threshold
        )
        
        # Format results
        detections = []
        for result in results:
            boxes = result['boxes'].cpu().numpy()
            scores = result['scores'].cpu().numpy()
            labels = result['labels'].cpu().numpy()
            
            for box, score, label in zip(boxes, scores, labels):
                x1, y1, x2, y2 = box
                
                detections.append({
                    'bbox': {
                        'x1': float(x1),
                        'y1': float(y1),
                        'x2': float(x2),
                        'y2': float(y2)
                    },
                    'confidence': float(score),
                    'label': queries[label],
                    'model': 'OWL-ViT v2'
                })
        
        # Sort by confidence
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        return detections
    
    def encode_query(self, query: str) -> np.ndarray:
        """Encode natural language query using Sentence Transformer"""
        embedding = self.sentence_model.encode([query])
        return embedding
    
    def build_embedding_index(self, embeddings: np.ndarray):
        """Build FAISS index for fast similarity search"""
        dimension = embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        self.faiss_index.add(embeddings.astype(np.float32))
    
    def search_similar_tiles(
        self,
        query_embedding: np.ndarray,
        top_k: int = 10
    ) -> List[tuple]:
        """Search for similar tiles using FAISS"""
        if self.faiss_index is None:
            raise ValueError("FAISS index not built. Call build_embedding_index first.")
        
        distances, indices = self.faiss_index.search(
            query_embedding.astype(np.float32),
            top_k
        )
        
        # Return list of (index, distance) tuples
        results = list(zip(indices[0], distances[0]))
        return results
    
    def add_tile_embedding(self, tile_id: str, embedding: np.ndarray, metadata: Dict):
        """Add a tile embedding to the index"""
        self.tile_embeddings.append(embedding)
        self.tile_metadata.append({
            'tile_id': tile_id,
            **metadata
        })
    
    def save_embeddings(self, filepath: Path):
        """Save embeddings to disk"""
        data = {
            'embeddings': np.vstack(self.tile_embeddings).tolist(),
            'metadata': self.tile_metadata
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f)
        
        print(f"✅ Saved {len(self.tile_embeddings)} embeddings to {filepath}")
    
    def load_embeddings(self, filepath: Path):
        """Load embeddings from disk"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        embeddings = np.array(data['embeddings'])
        self.tile_metadata = data['metadata']
        
        # Build FAISS index
        self.build_embedding_index(embeddings)
        
        print(f"✅ Loaded {len(self.tile_metadata)} embeddings from {filepath}")


# Global instance
vlm_service = RealVLMService()
