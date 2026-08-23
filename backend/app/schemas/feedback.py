"""
Pydantic schemas for the citizen feedback endpoints.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class FeedbackCreate(BaseModel):
    """What the citizen portal sends when submitting feedback."""
    text: str = Field(..., min_length=3, max_length=2000)
    language: str = Field(default="en", description="en | ta | hi")
    submitted_via: str = Field(default="text", description="text | voice")

    district_name: str
    state_name: str = Field(default="Tamil Nadu")
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Optional: citizen can pre-select a sector, but AI can override/confirm it
    sector: Optional[str] = None

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Feedback text cannot be blank or whitespace only.")
        return v.strip()

    @field_validator("language")
    @classmethod
    def language_must_be_supported(cls, v: str) -> str:
        allowed = {"en", "ta", "hi"}
        if v not in allowed:
            raise ValueError(f"language must be one of {allowed}")
        return v


class FeedbackResponse(BaseModel):
    """What we return after analysing + storing a citizen request."""
    id: int
    raw_text: str
    input_language: str
    submitted_via: str

    district_name: str
    state_name: str
    latitude: Optional[float]
    longitude: Optional[float]

    sector: str
    problem_category: str
    urgency_score: float
    sentiment: str
    keywords: str

    ai_mode_used: str
    created_at: datetime

    model_config = {"from_attributes": True}