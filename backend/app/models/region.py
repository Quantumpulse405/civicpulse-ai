from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Region(Base):
    """
    A district-level region. `country` is included from day one so this
    can extend to other BRICS nations later without a schema change.
    """
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False)
    country = Column(String, nullable=False, default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    citizen_requests = relationship("CitizenRequest", back_populates="region")
    infrastructure_metrics = relationship("InfrastructureMetric", back_populates="region")
    development_projects = relationship("DevelopmentProject", back_populates="region")