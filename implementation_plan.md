# Vigilant-X: AI Disaster Management System — Implementation Plan

## Overview

Vigilant-X is a **software-only**, AI-powered disaster management platform providing real-time disaster monitoring, predictive analytics, autonomous shelter allocation, context-aware emergency assistance, and smart evacuation routing. The system is designed for smart-city deployment and future expansion.

This plan details the full-stack implementation using React.js + Vite (frontend), FastAPI (backend), Supabase (database), and Leaflet.js with OpenStreetMap for geospatial visualization — all runnable with free-tier services.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VIGILANT-X PLATFORM                       │
├──────────────────┬──────────────────┬───────────────────────────┤
│   REACT FRONTEND │  FASTAPI BACKEND  │     EXTERNAL SERVICES      │
│   (Vite + Tailwind│  (Python)        │                           │
│    + Leaflet.js) │                  │  • NASA FIRMS API          │
│                  │  • REST API       │  • OpenWeatherMap API      │
│  • Dashboard     │  • WebSocket      │  • Nominatim Geocoding     │
│  • Live Map      │  • AI/ML Models   │  • GDACS Disaster Feed     │
│  • Shelter UI    │  • NLP Engine     │  • OpenStreetMap Tiles     │
│  • Chat Bot      │  • Routing Engine │  • USGS Earthquake API     │
│  • Alerts Panel  │  • Scheduler      │                           │
├──────────────────┴──────────────────┴───────────────────────────┤
│                     SUPABASE (PostgreSQL)                         │
│  • disasters | shelters | alerts | rescue_requests | users        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Diaster Management/
├── frontend/                        # React + Vite + Tailwind
│   ├── public/
│   │   ├── offline.html             # Offline fallback page
│   │   └── manifest.json            # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── DisasterMap.jsx       # Main Leaflet map
│   │   │   │   ├── HeatmapLayer.jsx      # Disaster heatmap overlay
│   │   │   │   ├── EvacuationRoutes.jsx  # Smart route overlay
│   │   │   │   ├── ShelterMarkers.jsx    # Shelter pins
│   │   │   │   └── DisasterMarkers.jsx   # Live event markers
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardLayout.jsx   # Authority dashboard
│   │   │   │   ├── StatsCards.jsx        # KPI cards
│   │   │   │   ├── AlertsFeed.jsx        # Live alert stream
│   │   │   │   ├── ShelterOccupancy.jsx  # Occupancy charts
│   │   │   │   ├── RescueQueue.jsx       # Prioritized rescue list
│   │   │   │   └── ResourceTracker.jsx   # Resource distribution
│   │   │   ├── Emergency/
│   │   │   │   ├── EmergencyBot.jsx      # NLP chat assistant
│   │   │   │   ├── VoiceInput.jsx        # Voice command handler
│   │   │   │   └── AlertBanner.jsx       # Critical alert display
│   │   │   ├── Shelter/
│   │   │   │   ├── ShelterList.jsx       # Shelter directory
│   │   │   │   ├── ShelterCard.jsx       # Individual shelter info
│   │   │   │   └── OccupancyGauge.jsx    # Visual capacity meter
│   │   │   ├── Prediction/
│   │   │   │   ├── PredictionPanel.jsx   # AI forecast display
│   │   │   │   └── RiskZoneOverlay.jsx   # Risk zone visualization
│   │   │   └── common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── LanguageSelector.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing + live status
│   │   │   ├── Dashboard.jsx        # Authority dashboard
│   │   │   ├── Map.jsx              # Full-screen map view
│   │   │   ├── Shelters.jsx         # Shelter management
│   │   │   ├── Emergency.jsx        # Emergency assistance
│   │   │   ├── Predictions.jsx      # AI prediction center
│   │   │   └── Reports.jsx          # Disaster reports
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js      # Real-time data hook
│   │   │   ├── useGeolocation.js    # User location
│   │   │   └── useOfflineSync.js    # Offline sync logic
│   │   ├── services/
│   │   │   ├── api.js               # API client (axios)
│   │   │   ├── supabase.js          # Supabase client
│   │   │   └── i18n.js              # Multi-language setup
│   │   ├── store/
│   │   │   └── index.js             # Zustand state store
│   │   ├── utils/
│   │   │   └── disasterUtils.js     # Helpers for severity calc
│   │   ├── locales/                 # i18n translation files
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   ├── bn.json
│   │   │   └── te.json
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                         # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── config.py                # Environment config
│   │   ├── database.py              # Supabase/DB connection
│   │   ├── models/
│   │   │   ├── disaster.py          # Disaster data models
│   │   │   ├── shelter.py           # Shelter models
│   │   │   ├── alert.py             # Alert models
│   │   │   └── rescue.py            # Rescue request models
│   │   ├── routers/
│   │   │   ├── disasters.py         # Disaster CRUD + live feed
│   │   │   ├── shelters.py          # Shelter allocation API
│   │   │   ├── alerts.py            # Alert management
│   │   │   ├── emergency.py         # NLP emergency analysis
│   │   │   ├── predictions.py       # AI prediction endpoints
│   │   │   ├── routing.py           # Smart evacuation routing
│   │   │   └── rescue.py            # Rescue prioritization
│   │   ├── services/
│   │   │   ├── nasa_firms.py        # NASA FIRMS wildfire data
│   │   │   ├── weather_service.py   # OpenWeatherMap integration
│   │   │   ├── earthquake_service.py# USGS earthquake feed
│   │   │   ├── gdacs_service.py     # GDACS disaster alerts
│   │   │   ├── nlp_service.py       # HuggingFace NLP engine
│   │   │   ├── prediction_engine.py # ML prediction models
│   │   │   ├── shelter_agent.py     # Agentic shelter allocator
│   │   │   ├── routing_engine.py    # Smart evacuation router
│   │   │   └── rescue_scorer.py     # AI rescue prioritizer
│   │   └── websocket/
│   │       └── manager.py           # WebSocket connection manager
│   ├── ml_models/
│   │   ├── flood_predictor.py       # Flood expansion model
│   │   ├── wildfire_predictor.py    # Wildfire spread model
│   │   └── risk_zone_classifier.py  # Zone risk classifier
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## Proposed Changes

### 1. Frontend — React + Vite + Tailwind

#### [NEW] `frontend/` — Full React application

**Key pages & components:**

| Page | Description |
|------|-------------|
| `Home.jsx` | Landing page with system status, active disaster count, live stats |
| `Dashboard.jsx` | Authority-only control center with all analytics |
| `Map.jsx` | Full-screen disaster map with all overlays |
| `Emergency.jsx` | Public-facing emergency assistant + rescue request form |
| `Shelters.jsx` | Real-time shelter occupancy and directions |
| `Predictions.jsx` | AI model outputs, risk heatmaps, forecast timelines |

**Map Features (Leaflet.js):**
- Base tiles: OpenStreetMap via Leaflet
- Heatmap layer: `leaflet.heat` plugin for disaster intensity
- Disaster event markers with severity icons (flood, fire, quake, storm)
- Live evacuation route overlays (color-coded: safe/caution/danger)
- Shelter pins with occupancy color coding (green/yellow/red)
- NASA FIRMS wildfire data plotted as fire markers

**State Management:** Zustand (lightweight, no boilerplate)

**Real-time:** WebSocket connection to FastAPI backend for live updates

**Offline support:**
- Service Worker caching map tiles and last-known data
- IndexedDB for storing rescue requests offline
- Sync on reconnect

**i18n:** react-i18next with 4 locales (EN, HI, BN, TE)

---

### 2. Backend — FastAPI (Python)

#### [NEW] `backend/app/main.py` — API + WebSocket server

**REST API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/disasters` | All active disasters |
| POST | `/api/disasters` | Report new disaster |
| GET | `/api/shelters` | All shelters + occupancy |
| POST | `/api/shelters/{id}/checkin` | Check civilian in |
| GET | `/api/alerts` | Active emergency alerts |
| POST | `/api/emergency/analyze` | NLP distress analysis |
| GET | `/api/predictions/flood` | Flood expansion forecast |
| GET | `/api/predictions/wildfire` | Wildfire spread forecast |
| GET | `/api/predictions/risk-zones` | AI risk zone map |
| POST | `/api/rescue/request` | Submit rescue request |
| GET | `/api/rescue/queue` | Prioritized rescue queue |
| GET | `/api/routing/evacuate` | Smart evacuation route |
| WS | `/ws/live` | WebSocket live event stream |

**External API Integrations:**

| Service | Data | Free Tier |
|---------|------|-----------|
| NASA FIRMS | Active wildfire hotspots | ✅ Free |
| USGS Earthquake | Live earthquake feed | ✅ Free |
| OpenWeatherMap | Weather + storm data | ✅ Free (1000 calls/day) |
| GDACS | Global disaster alerts | ✅ Free RSS/JSON |
| Nominatim | Geocoding/reverse geocoding | ✅ Free |
| OpenRouteService | Routing engine | ✅ Free (2000 req/day) |

---

### 3. AI/ML Services

#### Flood Prediction
- **Input:** Weather API rain data, historical flood records, terrain elevation (SRTM)
- **Model:** Gradient Boosting (scikit-learn) + rule-based expansion simulation
- **Output:** GeoJSON polygon of predicted flood extent in 6/12/24hr windows

#### Wildfire Spread Prediction
- **Input:** NASA FIRMS hotspot data, wind speed/direction (OpenWeatherMap), vegetation density
- **Model:** Cellular automata simulation + ML fire behavior model
- **Output:** Spread direction, risk radius, time-to-reach predictions

#### Risk Zone Classification
- **Input:** Active disaster locations, terrain, road density, population density
- **Model:** Random Forest classifier (scikit-learn)
- **Output:** Grid-based risk map (safe/moderate/high/critical)

#### NLP Emergency Analysis
- **Model:** HuggingFace `facebook/bart-large-mnli` (zero-shot classification)
- **Categories:** Medical Emergency, Fire Incident, Flood Danger, Rescue Request, Food/Water Shortage, Structural Collapse
- **Output:** Category, severity score, recommended actions, nearest resource

#### AI Rescue Prioritization
- **Scoring Factors:** Age group (elderly/child), injury status, location risk level, time since report, proximity to responders
- **Algorithm:** Weighted priority scoring → sorted rescue queue

#### Autonomous Shelter Agent
- **Logic:** Monitor occupancy % → predict overflow → pre-redirect incoming civilians
- **Algorithm:** Greedy nearest-available-capacity with fallback chain

---

### 4. Database — Supabase (PostgreSQL)

**Tables:**

```sql
-- disasters: live and historical disaster events
CREATE TABLE disasters (
  id UUID PRIMARY KEY,
  type TEXT,              -- flood|wildfire|earthquake|storm|landslide
  severity TEXT,          -- low|moderate|high|critical
  lat FLOAT, lng FLOAT,
  radius_km FLOAT,
  status TEXT,            -- active|contained|resolved
  reported_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  source TEXT             -- nasa_firms|usgs|user_report|gdacs
);

-- shelters: emergency shelter locations and capacity
CREATE TABLE shelters (
  id UUID PRIMARY KEY,
  name TEXT, address TEXT,
  lat FLOAT, lng FLOAT,
  capacity INT,
  current_occupancy INT,
  status TEXT,            -- open|full|closed
  facilities TEXT[],      -- medical|food|water|power
  last_updated TIMESTAMPTZ
);

-- alerts: emergency broadcast alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  disaster_id UUID REFERENCES disasters(id),
  severity TEXT,
  title TEXT, message TEXT,
  affected_area JSONB,    -- GeoJSON polygon
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- rescue_requests: civilian rescue submissions
CREATE TABLE rescue_requests (
  id UUID PRIMARY KEY,
  name TEXT, contact TEXT,
  lat FLOAT, lng FLOAT,
  situation TEXT,
  emergency_type TEXT,
  priority_score FLOAT,
  status TEXT,            -- pending|assigned|resolved
  submitted_at TIMESTAMPTZ
);
```

**Supabase Realtime:** Enable realtime on `disasters`, `alerts`, `shelters` for live frontend updates.

---

### 5. Security

- **Auth:** Supabase Auth (JWT-based) — public users vs. authority roles
- **Row-Level Security (RLS):** Authority-only write access to disasters and shelters
- **HTTPS:** Enforced on Vercel (frontend) + Render (backend)
- **Rate Limiting:** FastAPI `slowapi` middleware on emergency endpoints
- **Input Validation:** Pydantic models on all API inputs
- **CORS:** Restricted to deployed frontend domain

---

### 6. Offline / PWA Support

- Service Worker (Workbox) caching map tiles and static assets
- IndexedDB via `localforage` for offline rescue request queue
- Background sync when connection restored
- Offline alert display from cached data
- `manifest.json` for installable PWA

---

## Verification Plan

### Automated / Dev Testing
- `npm run dev` — Vite dev server confirms frontend loads with all pages
- `uvicorn app.main:app --reload` — FastAPI server with all routes active
- Browser WebSocket connection test to `/ws/live`
- API endpoint smoke tests via FastAPI `/docs` (Swagger UI)
- Supabase table inserts/queries via dashboard

### Visual / UI Verification (Browser Tool)
- Disaster map renders with OpenStreetMap tiles
- Heatmap overlay displays correctly
- Shelter markers appear with occupancy color coding
- Emergency bot responds to test messages
- Dashboard KPIs populate from API
- Mobile responsiveness across breakpoints

### Integration Tests
- NASA FIRMS wildfire data fetched and plotted on map
- OpenWeatherMap weather data displayed on dashboard
- USGS earthquake feed parsed and markers rendered
- WebSocket live events pushed and received by frontend

---

## Open Questions

> [!IMPORTANT]
> **Q1: Supabase Credentials** — Do you have an existing Supabase project? If yes, please provide the `SUPABASE_URL` and `SUPABASE_ANON_KEY`. If not, I can set up the app to work with a mock/local data layer so you can plug in credentials later.

> [!IMPORTANT]
> **Q2: OpenWeatherMap API Key** — Do you have an OpenWeatherMap API key? (Free tier available at openweathermap.org). I'll make the app fully functional with mock data as fallback if not.

> [!NOTE]
> **Q3: Focus Region** — Is there a specific geographic region (e.g., India, Southeast Asia) to center the map and demonstrations on? I'll default to **India** given the language support requirements (Hindi, Bengali, Telugu).

> [!NOTE]
> **Q4: Deployment** — Should I include deployment configuration files for Vercel + Render, or focus on the local development experience first?

---

## Build Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project scaffolding + design system + routing | Pending |
| 2 | Disaster Map (Leaflet + OSM + live markers) | Pending |
| 3 | Dashboard with KPIs, alerts feed, shelter occupancy | Pending |
| 4 | External API integrations (NASA FIRMS, USGS, OWM) | Pending |
| 5 | AI/ML prediction engine + risk zone heatmap | Pending |
| 6 | NLP Emergency Bot + rescue prioritization | Pending |
| 7 | Smart evacuation routing | Pending |
| 8 | Offline/PWA support + i18n | Pending |
| 9 | Security + auth + deployment config | Pending |
