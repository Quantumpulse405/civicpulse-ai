"""
Transparent priority scoring engine for CivicPulse AI.

Priority Score = Citizen Demand x 0.30
               + Infrastructure Gap x 0.25
               + Population Impact x 0.20
               + Urgency x 0.15
               + Policy Alignment x 0.10

All five components are 0-100 and returned alongside the final score so the
dashboard can show policymakers exactly why a region+sector was ranked the
way it was. This is a deterministic formula -- NOT an AI-generated number.
"""
from collections import defaultdict
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models import CitizenRequest, InfrastructureMetric, Region, DevelopmentProject

WEIGHTS = {
    "citizen_demand": 0.30,
    "infrastructure_gap": 0.25,
    "population_impact": 0.20,
    "urgency": 0.15,
    "policy_alignment": 0.10,
}


def _band_for_score(score: float) -> str:
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"


def compute_priorities(db: Session) -> list[dict]:
    """
    Computes a priority score for every (region, sector) combination that has
    at least one citizen request. Returns a list of dicts, one per
    region+sector, sorted by priority_score descending.
    """
    regions = {r.id: r for r in db.query(Region).all()}
    if not regions:
        return []

    all_requests = db.query(CitizenRequest).filter(CitizenRequest.region_id.isnot(None)).all()
    all_infra = db.query(InfrastructureMetric).all()
    all_projects = db.query(DevelopmentProject).all()

    requests_by_key: dict[tuple[int, str], list[CitizenRequest]] = defaultdict(list)
    for req in all_requests:
        requests_by_key[(req.region_id, req.sector)].append(req)

    if not requests_by_key:
        return []

    infra_lookup = {(m.region_id, m.sector): m.infra_score for m in all_infra}

    project_lookup: dict[tuple[int, str], int] = {}
    for p in all_projects:
        key = (p.region_id, p.sector)
        if key not in project_lookup or p.year > project_lookup[key]:
            project_lookup[key] = p.year

    max_requests = max(len(reqs) for reqs in requests_by_key.values())
    max_population = max(r.population for r in regions.values())
    current_year = datetime.now(timezone.utc).year

    results = []
    for (region_id, sector), reqs in requests_by_key.items():
        region = regions.get(region_id)
        if region is None:
            continue

        citizen_demand = (len(reqs) / max_requests) * 100 if max_requests else 0

        infra_score = infra_lookup.get((region_id, sector), 50.0)
        infrastructure_gap = 100 - infra_score

        population_impact = (region.population / max_population) * 100 if max_population else 0

        urgency = sum(r.urgency_score for r in reqs) / len(reqs)

        last_year = project_lookup.get((region_id, sector))
        if last_year is None:
            policy_alignment = 100
        else:
            years_since = max(current_year - last_year, 0)
            policy_alignment = min(years_since * 20, 100)

        final_score = round(
            citizen_demand * WEIGHTS["citizen_demand"]
            + infrastructure_gap * WEIGHTS["infrastructure_gap"]
            + population_impact * WEIGHTS["population_impact"]
            + urgency * WEIGHTS["urgency"]
            + policy_alignment * WEIGHTS["policy_alignment"],
            1,
        )

        results.append({
            "region_id": region_id,
            "region_name": region.name,
            "state": region.state,
            "sector": sector,
            "request_count": len(reqs),
            "priority_score": final_score,
            "priority_band": _band_for_score(final_score),
            "components": {
                "citizen_demand_score": round(citizen_demand, 1),
                "infrastructure_gap_score": round(infrastructure_gap, 1),
                "population_impact_score": round(population_impact, 1),
                "urgency_score": round(urgency, 1),
                "policy_alignment_score": round(policy_alignment, 1),
            },
        })

    results.sort(key=lambda r: r["priority_score"], reverse=True)
    return results