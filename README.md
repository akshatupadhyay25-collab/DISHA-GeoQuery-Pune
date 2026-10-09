# DISHA - Digital Intelligence System for Habitat Analysis

Advanced AI-powered geospatial intelligence platform for Pune region with multi-modal AI analysis.

## 🌟 Features

1. **Natural Language Queries** - Ask questions in plain English about Pune's geography
2. **Multi-Model AI Pipeline** - SkyCLIP, OWL-ViT, Gemini Flash, SegFormer, OpenCLIP
3. **Interactive Map** - Mapbox satellite imagery with Planet Labs high-resolution data
4. **Advanced Analysis** - Change detection, urban growth, vegetation analysis
5. **Simulation Engine** - Predict future scenarios and environmental impact
6. **Query History** - Track and revisit previous analyses

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (Download from python.org - NOT Windows Store version)
- **Node.js 18+** (Download from nodejs.org)
- **API Keys**:
  - Gemini API: Get from makersuite.google.com
  - Mapbox: Get from mapbox.com
  - Planet Labs: Get from planet.com

### Installation

#### 1. Clone and Setup Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

#### 2. Configure Environment Variables

Edit `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
PLANET_API_KEY=your_planet_api_key_here
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/disha
```

#### 3. Setup Frontend

```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Start Backend Server

Open a terminal in the `backend` directory:

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

### Start Frontend Development Server

Open a NEW terminal in the `frontend` directory:

```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## 📁 Project Structure

```
geoquery-pune/
├── backend/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── models/        # AI model interfaces
│   │   ├── services/      # Business logic
│   │   └── main.py        # FastAPI application
│   ├── tests/             # Test suite
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ui/       # UI components (including ai-chat-input)
    │   ├── pages/        # Route pages
    │   ├── services/     # API client
    │   ├── stores/       # Zustand state management
    │   ├── lib/          # Utilities
    │   ├── App.tsx       # Router configuration
    │   ├── main.tsx      # Entry point
    │   └── index.css     # Tailwind 4 styles
    ├── package.json      # Node dependencies
    └── vite.config.ts    # Vite configuration
```

## 🗺️ API Endpoints

### Map Configuration
- `GET /api/map/config` - Get default map configuration
- `GET /api/map/tiles/{z}/{x}/{y}` - Fetch satellite tiles

### Search & Query
- `POST /api/search` - Execute geospatial search with AI
- `POST /api/search/reverse` - Reverse geocoding

### Analysis
- `POST /api/analysis/change-detection` - Detect changes between time periods
- `POST /api/analysis/vegetation` - Vegetation health analysis
- `POST /api/analysis/urban-growth` - Urban expansion analysis

### Simulation
- `POST /api/simulation/flood` - Flood risk simulation
- `POST /api/simulation/traffic` - Traffic flow analysis
- `POST /api/simulation/urban-development` - Urban development scenarios

## 🎨 Design System

**Colors:**
- Background: `#F6F7F5` (light) / `#18201D` (dark)
- Primary: `#176B52` (forest green)
- Accent: `#2D9B6F` (emerald)

**Typography:**
- Inter (UI text)
- Geist (headings)
- JetBrains Mono (code/coordinates)

**Spacing:** 8pt grid system

## 🔧 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **Redis** - Caching and session storage
- **PostgreSQL** - Database (optional)

### AI Models
- **SkyCLIP** - Remote sensing image understanding
- **OWL-ViT** - Zero-shot object detection
- **Gemini Flash** - Natural language processing
- **SegFormer** - Semantic segmentation
- **OpenCLIP** - Multi-modal embeddings

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Mapbox GL** - Interactive maps
- **Axios** - HTTP client

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Module not found:**
```bash
pip install -r requirements.txt --upgrade
```

### Frontend Issues

**Port already in use:**
```bash
# Kill process on port 5173
npx kill-port 5173
```

**Dependencies issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
npm run build  # Check for TypeScript errors
```

### API Issues

**CORS errors:** Ensure backend is running on port 8000

**404 errors:** Check that API endpoints match between frontend and backend

**API key errors:** Verify `.env` file has correct keys

## 📊 Performance

- **Query Response:** < 2 seconds average
- **Map Tile Loading:** < 500ms
- **AI Model Inference:** < 3 seconds
- **Concurrent Users:** 100+ supported

## 🚢 Production Deployment

### Backend (Docker)

```bash
cd backend
docker build -t disha-backend .
docker run -p 8000:8000 --env-file .env disha-backend
```

### Frontend (Build)

```bash
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

### Environment Variables for Production

Set these in your deployment platform:
- `GEMINI_API_KEY`
- `MAPBOX_ACCESS_TOKEN`
- `PLANET_API_KEY`
- `REDIS_URL`
- `DATABASE_URL`
- `ENVIRONMENT=production`

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions:
- GitHub Issues: Report bugs and feature requests
- Documentation: Check API docs at `/docs`
- Email: support@disha-geoquery.com

## 🎯 Use Cases

- **Urban Planning** - Analyze development patterns
- **Environmental Monitoring** - Track vegetation and water bodies
- **Infrastructure Planning** - Identify optimal locations
- **Disaster Management** - Flood and risk assessment
- **Research** - Geospatial data analysis
- **Education** - Learn about Pune's geography

## 🔐 Security

- All API keys stored in environment variables
- CORS properly configured
- Input validation on all endpoints
- Rate limiting enabled
- HTTPS recommended for production

---

**Built with ❤️ for Pune's geospatial intelligence needs**

Last Updated: October 2026
