# DISHA - Quick Start Guide

## 🚀 Run the Application

### Step 1: Start Backend

Open PowerShell/CMD in the `backend` folder:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running at: http://localhost:8000  
✅ API Docs: http://localhost:8000/docs

### Step 2: Start Frontend

Open a NEW PowerShell/CMD window in the `frontend` folder:

```powershell
cd frontend
npm install
npm run dev
```

✅ Frontend running at: http://localhost:5173

## 🎯 Features

1. **Natural Language Search** - Ask questions about Pune in plain English
2. **AI-Powered Analysis** - Uses SkyCLIP, OWL-ViT, Gemini Flash, SegFormer
3. **Interactive Map** - Mapbox satellite + Planet imagery
4. **Animated UI** - Search bar centers, then slides to corner on submit
5. **Real-time Results** - Detections appear on map with telemetry
6. **Query History** - Track all your searches

## 🔑 API Keys Required

Edit `backend/.env` with your keys:
- Gemini API Key (Google AI Studio)
- Mapbox Access Token
- Planet Labs API Key

## 📊 Example Queries

- "Find all schools in Pune"
- "Show me water bodies near Kothrud"
- "Analyze urban growth in Hinjewadi"
- "Map green cover in Aundh"
- "Detect new construction in Baner"

## 🛠️ Tech Stack

**Backend:** FastAPI, Python 3.11+, Pydantic  
**Frontend:** React 18, TypeScript, Vite, Tailwind 4  
**AI Models:** SkyCLIP, OWL-ViT, Gemini Flash, SegFormer, OpenCLIP  
**Maps:** Mapbox GL JS, Planet Labs satellite imagery  
**State:** Zustand  
**Animations:** Framer Motion

## 📁 Project Structure

```
geoquery-pune/
├── backend/          # FastAPI backend
│   ├── app/         # API routes & AI models
│   └── .env         # Your API keys
└── frontend/        # React frontend
    ├── src/
    │   ├── components/ui/ai-chat-input.tsx  # Advanced search component
    │   ├── pages/QueryPage.tsx              # Main search page
    │   └── store/                           # Zustand stores
    └── package.json
```

## 🐛 Troubleshooting

**Port 8000 in use?**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Port 5173 in use?**
```powershell
npx kill-port 5173
```

**npm install fails?**
```powershell
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

- Check README.md for detailed documentation
- API docs at http://localhost:8000/docs
- Frontend dev tools for debugging

---

**Built for Pune Hackathon 2026** 🇮🇳
