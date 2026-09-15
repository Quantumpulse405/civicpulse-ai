"""
CivicPulse AI backend entry point.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database import Base, engine
from app.routes import feedback, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicPulse AI API",
    description="Turning citizen voices into smarter development priorities.",
    version="0.1.0",
)

raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router)
app.include_router(dashboard.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/ai-status")
def ai_status():
    mode = os.getenv("AI_MODE", "demo")
    return {
        "ai_mode": mode,
        "label": "Gemini AI Mode" if mode == "gemini" else "Demo AI Mode",
    }