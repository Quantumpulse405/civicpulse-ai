"""
Pydantic schemas for dashboard endpoints.
"""
from typing import Optional
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_requests: int
    high_priority_regions: int
    infrastructure_gaps: int
    recommended_projects: int


class RegionMapEntry(BaseModel):
    id: int
    name: str
    state: str
    latitude: float
    longitude: float
    population: int
    request_count: int
    dominant_sector: Optional[str] = None
    top_priority_score: Optional[float] = None
    top_priority_band: Optional[str] = None


class PriorityTableEntry(BaseModel):
    rank: int
    region_id: int
    region_name: str
    sector: str
    citizen_demand_score: float
    infrastructure_gap_score: float
    population_impact_score: float
    priority_score: float
    priority_band: str
    project_name: str
    request_count: int


class SectorDistributionEntry(BaseModel):
    sector: str
    request_count: int


class RecommendationEntry(BaseModel):
    id: int
    region_id: int
    region_name: str
    sector: str
    project_name: str
    reasoning: str
    estimated_beneficiaries: int
    expected_impact: str
    priority_score: float
    priority_band: str
    citizen_demand_score: float = 0
    infrastructure_gap_score: float = 0
    population_impact_score: float = 0
    urgency_score: float = 0
    policy_alignment_score: float = 0

    model_config = {"from_attributes": True}


class RegionDetail(BaseModel):
    id: int
    name: str
    state: str
    country: str
    latitude: float
    longitude: float
    population: int
    request_count: int
    dominant_sector: Optional[str]
    recommendations: list[RecommendationEntry]