from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from app.database import Base


class Recommendation(Base):
    """A generated, scored recommendation for a region+sector combination."""
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    sector = Column(String, nullable=False, index=True)

    project_name = Column(String, nullable=False)
    reasoning = Column(Text, nullable=False)
    estimated_beneficiaries = Column(Integer, nullable=False)
    expected_impact = Column(String, nullable=False)

    priority_score = Column(Float, nullable=False)
    citizen_demand_score = Column(Float, nullable=False)
    infrastructure_gap_score = Column(Float, nullable=False)
    population_impact_score = Column(Float, nullable=False)
    urgency_score = Column(Float, nullable=False)
    policy_alignment_score = Column(Float, nullable=False)

    priority_band = Column(String, nullable=False)  # Critical|High|Medium|Low
    request_count = Column(Integer, nullable=False, default=0)

    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))