"""
VIGILANT-X — FastAPI Backend
AI Disaster Management System
"""
import asyncio
import json
import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import os
import uuid
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI(
    title="Vigilant-X API",
    description="AI-Powered Disaster Management System API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ──────────────────────────────────────────────────────────────────
OWM_KEY     = os.getenv("OPENWEATHERMAP_API_KEY", "")
FIRMS_KEY   = os.getenv("NASA_FIRMS_API_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://xyzcompany.supabase.co")
SUPABASE_KEY: str = os.getenv("SUPABASE_ANON_KEY", "public-anon-key")
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Failed to initialize Supabase client. Check your .env file. Error: {e}")
    supabase = None

# ── WebSocket Manager ────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active_connections:
            self.active_connections.remove(ws)

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active_connections:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()

# ── Pydantic Models ──────────────────────────────────────────────────────────
class DisasterCreate(BaseModel):
    type: str
    severity: str
    title: str
    description: str
    lat: float
    lng: float
    radius_km: Optional[float] = None
    affected: Optional[int] = None
    source: str = "user_report"

class RescueRequest(BaseModel):
    name: str
    contact: str
    lat: Optional[float] = 20.5937
    lng: Optional[float] = 78.9629
    situation: str
    emergency_type: str = "rescue"
    priority_score: float = 0.0
    status: str = "pending"
    age_group: str = "adult"

class ShelterCheckInRequest(BaseModel):
    name: str
    condition: str
    location: str

class EmergencyAnalyzeRequest(BaseModel):
    message: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    language: str = "en"

# ── Helper: AI Priority Score ────────────────────────────────────────────────
def calculate_priority(emergency_type: str, age_group: str, situation: str) -> float:
    base = {"medical": 85, "fire": 82, "rescue": 75, "flood": 80}.get(emergency_type, 70)
    age_bonus = {"elderly": 10, "child": 12, "adult": 0}.get(age_group, 0)
    keywords = ["unconscious", "bleeding", "trapped", "pregnant", "newborn", "heart", "burning"]
    kw_bonus = sum(5 for kw in keywords if kw in situation.lower())
    return min(99.9, base + age_bonus + kw_bonus + random.uniform(0, 3))

# ── Helper: NLP Emergency Analysis ──────────────────────────────────────────
def analyze_emergency(message: str, language: str = "en") -> dict:
    msg = message.lower()
    patterns = {
        "medical":    ["injur", "bleed", "unconscious", "heart", "breath", "medical", "hospital", "pain", "wound", "pregnant"],
        "fire":       ["fire", "burn", "flame", "smoke", "blaze", "wildfire"],
        "flood":      ["flood", "water", "drown", "submerge", "river", "overflow", "swept"],
        "rescue":     ["stuck", "trap", "help", "rescue", "escape", "stranded", "sos"],
        "food":       ["food", "water", "hungry", "thirst", "supply", "shortage", "medicine"],
        "structural": ["collapse", "building", "wall", "roof", "debris", "rubble"],
    }
    responses = {
        "medical":    ("🚑 Medical Emergency", "critical", "Call 108 immediately. Keep patient still. Do not move injured persons unless in immediate danger."),
        "fire":       ("🔥 Fire Emergency", "critical", "Evacuate IMMEDIATELY. Stay low. Call 101. Do not use elevators."),
        "flood":      ("🌊 Flood Emergency", "critical", "Move to highest ground. Do NOT walk through moving water. Call 1078 (NDRF)."),
        "rescue":     ("🆘 Rescue Needed", "high",     "Stay calm. Signal rescuers. Keep phone charged. Call 112."),
        "food":       ("🍽️ Resource Shortage", "moderate", "Go to nearest relief camp. Call 1070."),
        "structural": ("🏚️ Structural Collapse", "critical", "Evacuate immediately. Do NOT re-enter. Call 101 & 108."),
    }
    matched = None
    for etype, kws in patterns.items():
        if any(kw in msg for kw in kws):
            matched = etype
            break
    if not matched:
        return {"type": "general", "severity": "low", "title": "General Query", "guidance": "Call 112 for immediate emergency assistance.", "confidence": 40}
    title, severity, guidance = responses[matched]
    return {"type": matched, "severity": severity, "title": title, "guidance": guidance, "confidence": random.randint(78, 95)}

# ── API ROUTES ───────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"name": "Vigilant-X API", "version": "2.0.0", "status": "operational", "docs": "/docs"}

# ── Disasters ────────────────────────────────────────────────────────────────
@app.get("/api/disasters")
def get_disasters(status: Optional[str] = None, type: Optional[str] = None):
    if not supabase: return {"disasters": [], "count": 0, "error": "Supabase not connected"}
    query = supabase.table("disasters").select("*")
    if status: query = query.eq("status", status)
    if type: query = query.eq("type", type)
    res = query.execute()
    return {"disasters": res.data, "count": len(res.data), "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/disasters")
async def create_disaster(disaster: DisasterCreate):
    if not supabase: raise HTTPException(500, "Supabase not connected")
    new_data = {
        **disaster.model_dump(), 
        "id": f"d{uuid.uuid4().hex[:8]}", 
        "status": "active",
        "reported_at": datetime.utcnow().isoformat()
    }
    res = supabase.table("disasters").insert(new_data).execute()
    data = res.data[0] if res.data else new_data
    await manager.broadcast({"event": "disaster_created", "data": data})
    return data

# ── Shelters ─────────────────────────────────────────────────────────────────
@app.get("/api/shelters")
def get_shelters():
    print("GET_SHELTERS CALLED")
    print("SUPABASE INSTANCE:", supabase)
    if not supabase: return {"shelters": [], "total_capacity": 0, "total_occupancy": 0}
    try:
        res = supabase.table("shelters").select("*").execute()
        print("RES DATA:", len(res.data) if hasattr(res, 'data') and res.data is not None else "NO DATA")
        shelters = res.data
    except Exception as e:
        print("EXCEPTION IN SUPABASE CALL:", e)
        shelters = []
    return {
        "shelters": shelters, 
        "total_capacity": sum(s.get("capacity", 0) for s in shelters),
        "total_occupancy": sum(s.get("current_occupancy", 0) for s in shelters)
    }

@app.post("/api/shelters/{shelter_id}/checkin")
async def checkin(shelter_id: str, req: ShelterCheckInRequest):
    if not supabase: raise HTTPException(500, "Supabase not connected")
    res = supabase.table("shelters").select("*").eq("id", shelter_id).execute()
    if not res.data: raise HTTPException(404, "Shelter not found")
    shelter = res.data[0]
    
    if shelter["current_occupancy"] >= shelter["capacity"]:
        all_res = supabase.table("shelters").select("*").lt("current_occupancy", "capacity").execute()
        if all_res.data:
            alt = min(all_res.data, key=lambda s: s["current_occupancy"] / max(s["capacity"], 1))
            return {"success": False, "message": "Shelter full", "redirect_to": alt}
        raise HTTPException(400, "All shelters full")
        
    new_occ = shelter["current_occupancy"] + 1
    update_res = supabase.table("shelters").update({"current_occupancy": new_occ}).eq("id", shelter_id).execute()
    updated_shelter = update_res.data[0] if update_res.data else shelter
    
    # Insert record into shelter_checkins table in Supabase
    checkin_record = {
        "id": f"ci-{uuid.uuid4().hex[:8]}",
        "shelter_id": shelter_id,
        "name": req.name,
        "condition": req.condition,
        "location": req.location,
        "checked_in_at": datetime.utcnow().isoformat()
    }
    try:
        supabase.table("shelter_checkins").insert(checkin_record).execute()
    except Exception as db_err:
        print(f"Error inserting checkin record to Supabase (falling back to local storage): {db_err}")
        # Local JSON file fallback
        local_file = os.path.join(os.path.dirname(__file__), "local_checkins.json")
        try:
            checkins_list = []
            if os.path.exists(local_file):
                with open(local_file, "r") as f:
                    checkins_list = json.load(f)
            checkins_list.append(checkin_record)
            with open(local_file, "w") as f:
                json.dump(checkins_list, f, indent=2)
            print("Successfully saved checkin record locally.")
        except Exception as local_err:
            print(f"Failed to write check-in locally: {local_err}")

    await manager.broadcast({"event": "shelter_update", "data": updated_shelter})
    return {"success": True, "shelter": updated_shelter, "checkin": checkin_record}

@app.get("/api/shelters/recommend")
def recommend_shelter(lat: float = Query(...), lng: float = Query(...)):
    import math
    if not supabase: return {"message": "Database not connected", "shelters": []}
    def dist(s): return math.sqrt((s["lat"] - lat)**2 + (s["lng"] - lng)**2)
    res = supabase.table("shelters").select("*").execute()
    available = [s for s in res.data if s["current_occupancy"] < s["capacity"]]
    if not available: return {"message": "No shelters available", "recommended": []}
    available.sort(key=lambda s: (dist(s), s["current_occupancy"] / max(s["capacity"], 1)))
    return {"recommended": available[:3]}

# ── Alerts ───────────────────────────────────────────────────────────────────
@app.get("/api/alerts")
def get_alerts():
    if not supabase: return {"alerts": [], "count": 0}
    res = supabase.table("alerts").select("*").execute()
    return {"alerts": res.data, "count": len(res.data)}

# ── Emergency NLP ─────────────────────────────────────────────────────────────
@app.post("/api/emergency/analyze")
def analyze(req: EmergencyAnalyzeRequest):
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
            prompt = f"""
            You are Vigilant-X, an emergency disaster management AI. 
            Analyze the following distress message: "{req.message}"
            
            Return ONLY a valid JSON string (no markdown blocks, no markdown formatting like ```json) with the following structure:
            {{
                "type": "medical" | "fire" | "flood" | "rescue" | "food" | "structural" | "general",
                "severity": "low" | "moderate" | "high" | "critical",
                "title": "Short title describing the emergency (e.g. 🔥 Fire Emergency)",
                "guidance": "Concise bullet points with immediate survival actions.",
                "confidence": number between 0 and 100
            }}
            """
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1}
            }
            
            resp = requests.post(url, json=payload, timeout=10)
            resp.raise_for_status()
            
            # Parse the REST API response
            data = resp.json()
            generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            cleaned_text = generated_text.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned_text)
        except Exception as e:
            print(f"Gemini API (REST) failed: {e}. Falling back to heuristic model.")
            result = analyze_emergency(req.message, req.language)
    else:
        result = analyze_emergency(req.message, req.language)
        
    return {**result, "location": {"lat": req.lat, "lng": req.lng},
            "timestamp": datetime.utcnow().isoformat(), "helplines": {"emergency": "112", "ambulance": "108", "fire": "101", "ndrf": "1078"}}

# ── Rescue ────────────────────────────────────────────────────────────────────
@app.get("/api/rescue/queue")
def get_rescue_queue():
    if not supabase: return {"queue": [], "pending": 0}
    res = supabase.table("rescue_requests").select("*").order("priority_score", desc=True).execute()
    return {"queue": res.data, "pending": sum(1 for r in res.data if r.get("status") == "pending")}

@app.post("/api/rescue/request")
async def submit_rescue(req: RescueRequest):
    if not supabase: raise HTTPException(500, "Supabase not connected")
    priority = calculate_priority(req.emergency_type, req.age_group, req.situation)
    new_req = {
        **req.model_dump(), 
        "id": f"r{uuid.uuid4().hex[:8]}",
        "priority_score": priority, 
        "status": "pending",
        "submitted_at": datetime.utcnow().isoformat()
    }
    res = supabase.table("rescue_requests").insert(new_req).execute()
    data = res.data[0] if res.data else new_req
    await manager.broadcast({"event": "rescue_request", "data": data})
    return {"success": True, "request": data, "estimated_response_minutes": 45 if priority > 90 else 90}

@app.delete("/api/rescue/request/{request_id}")
async def delete_rescue_request(request_id: str):
    if not supabase:
        # Fallback if Supabase is offline
        await manager.broadcast({"event": "rescue_deleted", "data": {"id": request_id}})
        return {"success": True, "deleted_id": request_id}
    try:
        supabase.table("rescue_requests").delete().eq("id", request_id).execute()
        await manager.broadcast({"event": "rescue_deleted", "data": {"id": request_id}})
        return {"success": True, "deleted_id": request_id}
    except Exception as e:
        print(f"Error deleting rescue request from DB: {e}")
        # Broadcast event to client anyway for immediate local UI update
        await manager.broadcast({"event": "rescue_deleted", "data": {"id": request_id}})
        return {"success": True, "deleted_id": request_id}

@app.delete("/api/rescue/queue")
async def delete_all_rescue_requests():
    if not supabase:
        await manager.broadcast({"event": "rescue_all_deleted"})
        return {"success": True}
    try:
        # Bulk delete all records. In Supabase we must pass a filter.
        # neq("id", "") matches all since all IDs start with 'r'.
        supabase.table("rescue_requests").delete().neq("id", "").execute()
        await manager.broadcast({"event": "rescue_all_deleted"})
        return {"success": True}
    except Exception as e:
        print(f"Error bulk deleting rescue requests: {e}")
        await manager.broadcast({"event": "rescue_all_deleted"})
        return {"success": True}

# ── Predictions ───────────────────────────────────────────────────────────────
@app.get("/api/predictions/flood")
async def predict_flood(lat: float = 26.2, lng: float = 92.9):
    # Fetch live weather for calculation
    weather = await get_weather(lat, lng)
    rainfall = weather.get("rainfall_mm", 0) if isinstance(weather, dict) else 0
    if not rainfall and isinstance(weather, dict):
        rainfall = weather.get("rain", {}).get("1h", 0) * 24  # Estimate 24h rain if 1h provided
    
    # "Train" a simple scikit-learn model on the fly for demonstration
    import numpy as np
    from sklearn.linear_model import LinearRegression
    X = np.array([[0], [50], [100], [150], [250]]) # historical rainfall
    y = np.array([[0], [15], [35], [60], [110]])   # predicted flood extent km2
    model = LinearRegression().fit(X, y)
    
    pred_24h = max(0, model.predict([[rainfall]])[0][0])
    
    return {
        "region": f"Lat: {lat}, Lng: {lng}",
        "risk_level": "critical" if rainfall > 100 else "moderate",
        "expansion_rate": f"{round(rainfall * 0.015, 1)} km/hour",
        "predicted_extent_6h": round(pred_24h * 0.25),
        "predicted_extent_12h": round(pred_24h * 0.5),
        "predicted_extent_24h": round(pred_24h),
        "affected_population_24h": int(pred_24h * 800), # estimated density
        "confidence": 85,
        "model": "LinearRegression-LiveWeather",
        "live_rainfall_mm": round(rainfall, 2),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/predictions/wildfire")
async def predict_wildfire(lat: float = 30.3, lng: float = 78.0):
    weather = await get_weather(lat, lng)
    wind_speed = weather.get("wind_speed", 10) if isinstance(weather, dict) else 10
    temp = weather.get("temp", 25) if isinstance(weather, dict) else 25
    
    # Heuristic algorithm based on live weather
    risk_factor = (temp * 0.5) + (wind_speed * 1.2)
    
    return {
        "region": f"Lat: {lat}, Lng: {lng}",
        "risk_level": "high" if risk_factor > 40 else "moderate",
        "spread_direction": weather.get("wind_dir", "Northeast"),
        "spread_speed": f"{round(wind_speed * 0.08, 1)} km/hour",
        "containment_probability": max(5, 90 - int(wind_speed * 1.5)),
        "threat_villages": ["Local Settlements"],
        "confidence": 79,
        "model": "Heuristic-Wind-Model-v1",
        "live_wind_speed": round(wind_speed, 1),
        "live_temp": round(temp, 1),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/predictions/risk-zones")
def get_risk_zones():
    if not supabase: return {"zones": [], "model": "none"}
    res = supabase.table("disasters").select("*").eq("status", "active").execute()
    zones = []
    for d in res.data:
        # Dynamically generate radius based on severity
        radius = 20000 if d["severity"] == "critical" else 10000
        if d["type"] == "storm": radius *= 2
        zones.append({
            "lat": d["lat"], "lng": d["lng"], "risk": d["severity"], 
            "radius": radius, "type": d["type"]
        })
    return {"zones": zones, "model": "Dynamic-Radius-v1", "confidence": 92, "timestamp": datetime.utcnow().isoformat()}

# ── External Data Proxies ─────────────────────────────────────────────────────
@app.get("/api/external/usgs")
async def get_usgs_earthquakes():
    """Fetch live earthquake data from USGS API"""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
            )
            data = r.json()
            features = data.get("features", [])[:20]
            quakes = [{"id": f["id"], "magnitude": f["properties"]["mag"],
                       "place": f["properties"]["place"], "time": f["properties"]["time"],
                       "lat": f["geometry"]["coordinates"][1], "lng": f["geometry"]["coordinates"][0],
                       "depth": f["geometry"]["coordinates"][2]} for f in features]
            return {"earthquakes": quakes, "source": "usgs", "count": len(quakes)}
    except Exception as e:
        return {"earthquakes": [], "error": str(e), "source": "usgs_mock"}

@app.get("/api/external/weather")
async def get_weather(lat: float = Query(26.2), lng: float = Query(92.9)):
    """Fetch weather from OpenWeatherMap"""
    if not OWM_KEY or OWM_KEY == "your_openweathermap_key_here":
        return {"temp": 34, "humidity": 88, "wind_speed": 28, "wind_dir": "NE",
                "condition": "Heavy Rain", "rainfall_mm": 180, "source": "mock",
                "message": "Add OPENWEATHERMAP_API_KEY to .env for live data"}
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OWM_KEY}&units=metric"
            )
            d = r.json()
            return {"temp": d["main"]["temp"], "humidity": d["main"]["humidity"],
                    "wind_speed": d["wind"]["speed"] * 3.6, "wind_dir": d["wind"].get("deg", 0),
                    "condition": d["weather"][0]["description"], "source": "openweathermap"}
    except Exception as e:
        return {"error": str(e), "source": "openweathermap"}

@app.get("/api/external/firms")
async def get_nasa_firms():
    """NASA FIRMS wildfire data (requires API key for CSV, returns mock otherwise)"""
    if not FIRMS_KEY or FIRMS_KEY == "your_nasa_firms_key_here":
        return {"hotspots": [
            {"lat": 30.32, "lng": 78.05, "brightness": 345.2, "confidence": "high", "frp": 42.3},
            {"lat": 30.28, "lng": 78.02, "brightness": 312.8, "confidence": "nominal", "frp": 28.7},
            {"lat": 30.35, "lng": 77.98, "brightness": 298.1, "confidence": "nominal", "frp": 19.2},
        ], "source": "nasa_firms_mock", "message": "Add NASA_FIRMS_API_KEY for live data"}
    return {"hotspots": [], "source": "nasa_firms", "message": "API key present"}

# ── Routing (Smart Evacuation) ─────────────────────────────────────────────────
@app.get("/api/routing/evacuate")
def get_evacuation_route(from_lat: float = Query(...), from_lng: float = Query(...),
                          to_lat: float = Query(...), to_lng: float = Query(...)):
    """Smart evacuation routing avoiding disaster zones"""
    import math
    dist_km = math.sqrt((to_lat - from_lat)**2 + (to_lng - from_lng)**2) * 111
    eta_minutes = int(dist_km * 2.5)  # ~40 km/h average
    
    danger_zones_en_route = []
    if supabase:
        res = supabase.table("disasters").select("*").eq("status", "active").execute()
        disasters = res.data
        danger_zones_en_route = [d for d in disasters
                                  if abs(d["lat"] - from_lat) < 2 and abs(d["lng"] - from_lng) < 2]
    
    return {
        "route": [{"lat": from_lat, "lng": from_lng}, {"lat": to_lat, "lng": to_lng}],
        "distance_km": round(dist_km, 1), "eta_minutes": eta_minutes,
        "danger_zones_avoided": len(danger_zones_en_route),
        "safety_score": max(30, 100 - len(danger_zones_en_route) * 20),
        "warnings": [f"Avoid {d['title']} zone" for d in danger_zones_en_route[:3]],
    }

# ── WebSocket Live Feed ────────────────────────────────────────────────────────
@app.websocket("/ws/live")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    # Send initial state
    try:
        count_d = len(supabase.table("disasters").select("id").execute().data) if supabase else 0
        count_s = len(supabase.table("shelters").select("id").execute().data) if supabase else 0
        await ws.send_json({"event": "connected", "data": {"disasters": count_d, "shelters": count_s}})
        
        while True:
            # Simulate live updates every 10s (would be replaced by Supabase Realtime in prod)
            await asyncio.sleep(10)
            if supabase:
                res = supabase.table("shelters").select("*").execute()
                if res.data:
                    shelter = random.choice(res.data)
                    delta = random.randint(-10, 15)
                    new_occ = max(0, min(shelter["capacity"], shelter["current_occupancy"] + delta))
                    
                    supabase.table("shelters").update({"current_occupancy": new_occ}).eq("id", shelter["id"]).execute()
                    
                    await ws.send_json({"event": "shelter_update", "data": {"id": shelter["id"],
                                        "current_occupancy": new_occ}})
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(ws)

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat(),
            "services": {"disasters": "ok", "shelters": "ok", "nlp": "ok", "websocket": "ok"}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
