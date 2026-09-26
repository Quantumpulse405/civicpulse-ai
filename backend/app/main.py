"""
CivicPulse AI backend entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import feedback, dashboard

# Ensure all tables exist (safe no-op if seed.py already created them)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicPulse AI API",
    description="Turning citizen voices into smarter development priorities.",
    version="0.1.0",
)

import os

# Default origins + any dynamically configured in CORS_ORIGINS env var
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://civicpulse-ai.vercel.app",
    "https://civicpulse-ai-blue.vercel.app",
    "https://civicpulse-ai-git-main-audace-shift.vercel.app",
    "https://civicpulse-givbt40lh-audace-shift.vercel.app",
]
env_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
allow_origins = list(dict.fromkeys(default_origins + env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "CivicPulse AI API",
        "docs": "/docs",
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/ai-status")
def ai_status():
    """Reports which AI mode is currently active, for the frontend badge."""
    import os
    mode = os.getenv("AI_MODE", "demo")
    return {
        "ai_mode": mode,
        "label": "Gemini AI Mode" if mode == "gemini" else "Demo AI Mode",
    }