"""
Citizen feedback endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CitizenRequest, Region
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.analyzer import analyze_feedback

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    """Accept citizen feedback, run it through the analyzer, and store it."""
    analysis = analyze_feedback(
        text=payload.text,
        language=payload.language,
        hinted_sector=payload.sector,
    )

    # Try to match the district to an existing seeded Region (best-effort).
    region = (
        db.query(Region)
        .filter(Region.name.ilike(payload.district_name))
        .first()
    )

    request_row = CitizenRequest(
        raw_text=payload.text,
        input_language=analysis["detected_language"],
        submitted_via=payload.submitted_via,
        region_id=region.id if region else None,
        district_name=payload.district_name,
        state_name=payload.state_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        sector=analysis["sector"],
        problem_category=analysis["problem_category"],
        urgency_score=analysis["urgency_score"],
        sentiment=analysis["sentiment"],
        keywords=analysis["keywords"],
        ai_mode_used=analysis["ai_mode_used"],
    )

    db.add(request_row)
    db.commit()
    db.refresh(request_row)

    return request_row


@router.get("", response_model=List[FeedbackResponse])
def list_feedback(limit: int = 50, db: Session = Depends(get_db)):
    """Return the most recent citizen requests, newest first."""
    if limit < 1 or limit > 500:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 500")

    rows = (
        db.query(CitizenRequest)
        .order_by(CitizenRequest.created_at.desc())
        .limit(limit)
        .all()
    )
    return rows