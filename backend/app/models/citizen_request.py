from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class CitizenRequest(Base):
    """A single piece of citizen feedback, raw + AI-extracted attributes."""
    __tablename__ = "citizen_requests"

    id = Column(Integer, primary_key=True, index=True)
    raw_text = Column(Text, nullable=False)
    input_language = Column(String, nullable=False, default="en")  # en, ta, hi
    submitted_via = Column(String, nullable=False, default="text")  # text | voice

    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    district_name = Column(String, nullable=False)
    state_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    sector = Column(String, nullable=False, index=True)
    problem_category = Column(String, nullable=False)
    urgency_score = Column(Float, nullable=False)
    sentiment = Column(String, nullable=False)
    keywords = Column(String, nullable=False, default="")

    ai_mode_used = Column(String, nullable=False, default="demo")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    region = relationship("Region", back_populates="citizen_requests")