from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class DevelopmentProject(Base):
    """
    Existing/planned public investment projects, used for 'policy alignment'
    scoring. SYNTHETIC/DEMO data.
    """
    __tablename__ = "development_projects"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    status = Column(String, nullable=False, default="planned")  # planned|ongoing|completed
    year = Column(Integer, nullable=False)
    budget_crore_inr = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    region = relationship("Region", back_populates="development_projects")