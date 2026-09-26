# CivicPulse AI

> **Turning citizen voices into smarter development priorities.**

A multilingual, AI-powered civic intelligence platform that collects citizen development requests through text and voice, analyses them using Google Gemini, identifies infrastructure demand hotspots, calculates transparent priority scores, and recommends high-impact development projects to policymakers.

**Built for the India pilot — architected to scale across BRICS nations.**

---

## The Problem

Governments struggle to consolidate citizen feedback and align it with national infrastructure priorities. Development requests are fragmented across different channels, causing:

- Misaligned public spending
- Unaddressed infrastructure gaps
- Difficulty identifying demand hotspots
- Lack of measurable impact from public investment

## Our Solution

CivicPulse AI is a **Digital Public Good** that aggregates citizen development requests via voice and text across diverse linguistic regions, analyses them using AI, and surfaces demand hotspots and recommended projects to national policymakers.

```
Citizen Voice (EN/TA/HI)
        ↓
Multilingual AI (Google Gemini)
        ↓
Civic Need Extraction
        ↓
Geographic Aggregation
        ↓
Infrastructure Gap Analysis
        ↓
Transparent Priority Scoring
        ↓
Development Recommendation
        ↓
Policymaker Dashboard
```

---

## Live Demo

| Component | URL |
|---|---|
| Frontend | https://civicpulse-ai.vercel.app |
| Backend API | https://civicpulse-ai-5gqq.onrender.com |
| API Docs | https://civicpulse-ai-5gqq.onrender.com/docs |

> ⚠️ The backend runs on Render's free tier and may take ~30 seconds to wake up after inactivity.

---

## Key Features

- **Multilingual AI** — English, Tamil (தமிழ்), Hindi (हिंदी) via Google Gemini 
- **Voice input** — Browser Web Speech API support for rural accessibility
- **Demo mode** — Fully functional offline fallback (no API key required)
- **Transparent scoring** — 5-component priority formula, not a black-box AI number
- **Interactive map** — Leaflet + OpenStreetMap hotspot visualization
- **Explainable recommendations** — Every recommendation shows its reasoning
- **Real-time dashboard** — Sector distribution, trend charts, priority table

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Maps | Leaflet, OpenStreetMap |
| Charts | Recharts |
| Backend | Python, FastAPI |
| Database | SQLite (MVP), SQLAlchemy ORM |
| AI | Google Gemini (via google-genai SDK) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Priority Scoring Formula

The priority score is a **transparent, deterministic formula** — not a black-box AI number:

```
Priority Score =
    Citizen Demand Score      × 0.30
  + Infrastructure Gap Score  × 0.25
  + Population Impact Score   × 0.20
  + Urgency Score             × 0.15
  + Policy Alignment Score    × 0.10
```

Each component is 0–100. The final score is 0–100. All components are visible to policymakers in the dashboard.

---

## Demo Workflow (3–5 minutes)

1. Open **Citizen Portal** → select Tamil → load sample → submit
2. See AI extract: language, sector, urgency, sentiment, keywords
3. See "similar requests" count from the same district
4. Open **Policymaker Dashboard** → observe KPI cards update
5. View **Hotspot Map** → click a district marker → see popup
6. Open **Region Detail** (e.g., Vellore) → see all recommendations
7. See **score breakdown**: Citizen Demand / Infra Gap / Population / Urgency / Policy Alignment
8. Return to dashboard → view sector chart, trend chart, priority table

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)

```
AI_MODE=demo              # or "gemini" for real AI
GEMINI_API_KEY=           # required when AI_MODE=gemini
DATABASE_URL=sqlite:///./civicpulse.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Demo Mode

`AI_MODE=demo` uses a deterministic, rule-based multilingual NLP pipeline that requires no API key and works fully offline. It detects Tamil/Hindi script using Unicode ranges and classifies sectors using weighted keyword matching.

`AI_MODE=gemini` uses Google Gemini (`gemini-3.6-flash`) for genuine multilingual understanding. If the Gemini call fails for any reason, the system automatically falls back to demo mode — the platform never crashes during a live demo.

---

## Data Disclosure

> ⚠️ This MVP uses **synthetic/demonstration data** for a 10-district Tamil Nadu pilot.
> This is NOT official Government of India data.
> The data was generated using `backend/seed.py` with `random.seed(42)` for reproducibility.
> All synthetic values are clearly labeled as prototype demonstration data.

The architecture is designed to integrate real datasets from sources such as:
- data.gov.in district-level infrastructure indices
- Census demographic data
- PMGSY road connectivity data
- National Health Mission facility data

---

## BRICS Scalability

The data model includes a `country` field on all geographic entities from day one. To extend to another BRICS nation:
1. Add country-specific regions to the `Region` table
2. Add sector-specific `InfrastructureMetric` rows
3. Add the country's language(s) to the Gemini prompt and demo-mode keyword sets
4. Configure country-specific `DevelopmentProject` data

No schema migration required. No code architecture changes required.

---

## Limitations

- SQLite is used for the MVP — production would use PostgreSQL
- The Render free tier spins down after inactivity (~30s cold start)
- Voice input requires Chrome/Edge (Firefox has limited Web Speech API support)
- All data is synthetic — real government data integration is future work

---

## Future Scope

- WhatsApp Business API integration for citizen input
- Real government dataset integration (data.gov.in, Census, NHM)
- Multi-country support (Brazil, Russia, China, South Africa)
- SMS/IVR fallback for feature phone users
- Automated retraining on real citizen feedback patterns
- Role-based policymaker authentication

---

## Team

> Add your team details here.

---

*Built for the hackathon. Prototype data only. Not affiliated with any government agency.*