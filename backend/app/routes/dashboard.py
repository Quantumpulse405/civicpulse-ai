"""
Policymaker dashboard endpoints.
"""
from collections import Counter, defaultdict
from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Region, CitizenRequest, Recommendation
from app.schemas.dashboard import (
    DashboardSummary,
    RegionMapEntry,
    PriorityTableEntry,
    SectorDistributionEntry,
    RecommendationEntry,
    RegionDetail,
)

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    total_requests = db.query(CitizenRequest).count()

    high_priority_regions = (
        db.query(Recommendation.region_id)
        .filter(Recommendation.priority_band.in_(["Critical", "High"]))
        .distinct()
        .count()
    )

    # "Infrastructure gaps" = distinct region+sector combos with gap score >= 50
    infrastructure_gaps = (
        db.query(Recommendation)
        .filter(Recommendation.infrastructure_gap_score >= 50)
        .count()
    )

    recommended_projects = db.query(Recommendation).count()

    return DashboardSummary(
        total_requests=total_requests,
        high_priority_regions=high_priority_regions,
        infrastructure_gaps=infrastructure_gaps,
        recommended_projects=recommended_projects,
    )


@router.get("/dashboard/regions", response_model=list[RegionMapEntry])
def dashboard_regions(db: Session = Depends(get_db)):
    regions = db.query(Region).all()
    requests = db.query(CitizenRequest).filter(CitizenRequest.region_id.isnot(None)).all()
    recommendations = db.query(Recommendation).all()

    requests_by_region: dict[int, list[CitizenRequest]] = defaultdict(list)
    for r in requests:
        requests_by_region[r.region_id].append(r)

    top_rec_by_region: dict[int, Recommendation] = {}
    for rec in recommendations:
        current = top_rec_by_region.get(rec.region_id)
        if current is None or rec.priority_score > current.priority_score:
            top_rec_by_region[rec.region_id] = rec

    result = []
    for region in regions:
        region_requests = requests_by_region.get(region.id, [])
        dominant_sector = None
        if region_requests:
            sector_counts = Counter(r.sector for r in region_requests)
            dominant_sector = sector_counts.most_common(1)[0][0]

        top_rec = top_rec_by_region.get(region.id)

        result.append(RegionMapEntry(
            id=region.id,
            name=region.name,
            state=region.state,
            latitude=region.latitude,
            longitude=region.longitude,
            population=region.population,
            request_count=len(region_requests),
            dominant_sector=dominant_sector,
            top_priority_score=top_rec.priority_score if top_rec else None,
            top_priority_band=top_rec.priority_band if top_rec else None,
        ))

    return result


@router.get("/dashboard/priorities", response_model=list[PriorityTableEntry])
def dashboard_priorities(limit: int = 20, db: Session = Depends(get_db)):
    if limit < 1 or limit > 200:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 200")

    recs = (
        db.query(Recommendation)
        .order_by(Recommendation.priority_score.desc())
        .limit(limit)
        .all()
    )

    region_names = {r.id: r.name for r in db.query(Region).all()}

    result = []
    for i, rec in enumerate(recs, start=1):
        result.append(PriorityTableEntry(
            rank=i,
            region_id=rec.region_id,
            region_name=region_names.get(rec.region_id, "Unknown"),
            sector=rec.sector,
            citizen_demand_score=rec.citizen_demand_score,
            infrastructure_gap_score=rec.infrastructure_gap_score,
            population_impact_score=rec.population_impact_score,
            priority_score=rec.priority_score,
            priority_band=rec.priority_band,
            project_name=rec.project_name,
            request_count=rec.request_count,
        ))
    return result


@router.get("/dashboard/sectors", response_model=list[SectorDistributionEntry])
def dashboard_sectors(db: Session = Depends(get_db)):
    requests = db.query(CitizenRequest).all()
    counts = Counter(r.sector for r in requests)
    return [
        SectorDistributionEntry(sector=sector, request_count=count)
        for sector, count in counts.most_common()
    ]


@router.get("/recommendations", response_model=list[RecommendationEntry])
def list_recommendations(limit: int = 50, db: Session = Depends(get_db)):
    if limit < 1 or limit > 200:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 200")

    recs = (
        db.query(Recommendation)
        .order_by(Recommendation.priority_score.desc())
        .limit(limit)
        .all()
    )
    region_names = {r.id: r.name for r in db.query(Region).all()}

    result = []
    for rec in recs:
        result.append(RecommendationEntry(
            id=rec.id,
            region_id=rec.region_id,
            region_name=region_names.get(rec.region_id, "Unknown"),
            sector=rec.sector,
            project_name=rec.project_name,
            reasoning=rec.reasoning,
            estimated_beneficiaries=rec.estimated_beneficiaries,
            expected_impact=rec.expected_impact,
            priority_score=rec.priority_score,
            priority_band=rec.priority_band,
        ))
    return result


@router.get("/regions/{region_id}", response_model=RegionDetail)
def region_detail(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if region is None:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found")

    requests = (
        db.query(CitizenRequest)
        .filter(CitizenRequest.region_id == region_id)
        .all()
    )
    dominant_sector = None
    if requests:
        sector_counts = Counter(r.sector for r in requests)
        dominant_sector = sector_counts.most_common(1)[0][0]

    recs = (
        db.query(Recommendation)
        .filter(Recommendation.region_id == region_id)
        .order_by(Recommendation.priority_score.desc())
        .all()
    )
    rec_entries = [
        RecommendationEntry(
            id=r.id,
            region_id=r.region_id,
            region_name=region.name,
            sector=r.sector,
            project_name=r.project_name,
            reasoning=r.reasoning,
            estimated_beneficiaries=r.estimated_beneficiaries,
            expected_impact=r.expected_impact,
            priority_score=r.priority_score,
            priority_band=r.priority_band,
        )
        for r in recs
    ]

    return RegionDetail(
        id=region.id,
        name=region.name,
        state=region.state,
        country=region.country,
        latitude=region.latitude,
        longitude=region.longitude,
        population=region.population,
        request_count=len(requests),
        dominant_sector=dominant_sector,
        recommendations=rec_entries,
    )

@router.get("/dashboard/trend")
def dashboard_trend(days: int = 30, db: Session = Depends(get_db)):
    """Daily citizen request counts for the last N days, for the trend chart."""
    if days < 1 or days > 365:
        raise HTTPException(status_code=400, detail="days must be between 1 and 365")

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    requests = db.query(CitizenRequest).filter(CitizenRequest.created_at >= cutoff).all()

    counts_by_day: dict[str, int] = defaultdict(int)
    for r in requests:
        day_key = r.created_at.strftime("%Y-%m-%d")
        counts_by_day[day_key] += 1

    # Fill in every day in the range, even zero-count days, so the chart has no gaps
    result = []
    for i in range(days, -1, -1):
        day = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        result.append({"date": day, "request_count": counts_by_day.get(day, 0)})

    return result