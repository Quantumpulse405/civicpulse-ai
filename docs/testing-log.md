\# CivicPulse AI — Testing Log



Date: <fill in>



\## Backend

\- \[ ] `python -c "import app.main"` succeeds with no errors

\- \[ ] `requirements.txt` regenerated and contains all dependencies

\- \[ ] `uvicorn app.main:app --port 8000` (no --reload) starts cleanly



\## Frontend

\- \[ ] `npm run build` completes successfully, all 4 routes listed

\- \[ ] `npm run start` (production mode) — all 4 pages load correctly



\## Multilingual scenarios (via UI, not curl)

\- \[ ] English healthcare scenario → Sector: Healthcare

\- \[ ] Tamil transportation scenario → Detected Language: TA, Sector: Transportation

\- \[ ] Hindi water scenario → Detected Language: HI, Sector: Water \& Sanitation



\## Mobile responsiveness (DevTools device emulation)

\- \[ ] Landing page (`/`) — no overflow, buttons usable

\- \[ ] Citizen portal (`/citizen`) — form usable, no overflow

\- \[ ] Dashboard (`/dashboard`) — table scrolls horizontally, map resizes

\- \[ ] Region detail (`/region/\[id]`) — cards stack cleanly



\## Environment / security

\- \[ ] `.env` has real Gemini key, `.env.example` has placeholders only

\- \[ ] `.env` confirmed NOT present in git history

\- \[ ] CORS allows localhost:3000 correctly



\## Known issues / limitations found during this pass

\- <fill in anything you noticed, even minor>

