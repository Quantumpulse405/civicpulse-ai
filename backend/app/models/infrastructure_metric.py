from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class InfrastructureMetric(Base):
    """
    Per-region, per-sector infrastructure adequacy data.
    infra_score: 0-100, where 100 = fully adequate, 0 = severe gap.
    SYNTHETIC/DEMO data for the prototype.
    """
    __tablename__ = "infrastructure_metrics"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    sector = Column(String, nullable=False, index=True)
    infra_score = Column(Float, nullable=False)
    existing_facilities = Column(Integer, nullable=False, default=0)
    last_investment_year = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    region = relationship("Region", back_populates="infrastructure_metrics")