"""
Recommendation engine for CivicPulse AI.

Takes the output of priority_engine.compute_priorities() and converts each
region+sector into a concrete, named project recommendation with human-
readable reasoning, estimated beneficiaries, and expected impact. Results
are persisted to the Recommendation table so the dashboard can query them
directly.
"""
from sqlalchemy.orm import Session

from app.models import Recommendation, Region
from app.services.priority_engine import compute_priorities

# Maps each sector to (project_name, expected_impact_label)
SECTOR_PROJECTS = {
    "Healthcare": ("Primary Healthcare Centre / Mobile Medical Unit", "Reduced travel time for emergency and routine care"),
    "Education": ("Government School Expansion / Digital Learning Centre", "Improved access to classrooms and digital learning tools"),
    "Transportation": ("Rural Bus Route Expansion", "Improved daily commute access for students and workers"),
    "Water & Sanitation": ("Water Supply Pipeline Improvement", "Reduced water shortage and improved sanitation"),
    "Roads": ("District Road Improvement Project", "Safer and more reliable road connectivity"),
    "Electricity": ("Rural Feeder Line Strengthening", "Reduced power outages for households and businesses"),
    "Digital Connectivity": ("Public Broadband / Digital Access Point", "Improved access to online services and education"),
    "Public Safety": ("Community Policing Outpost / Street Lighting", "Improved safety and faster emergency response"),
}


def _build_reasoning(entry: dict) -> str:
    c = entry["components"]
    return (
        f"{entry['request_count']} citizen request(s) reported {entry['sector'].lower()} issues in "
        f"{entry['region_name']}. Infrastructure gap score is {c['infrastructure_gap_score']}/100 "
        f"(higher = more under-served), average urgency is {c['urgency_score']}/100, and this sector "
        f"has a policy alignment score of {c['policy_alignment_score']}/100 "
        f"({'no recent investment recorded' if c['policy_alignment_score'] >= 80 else 'some recent investment recorded'})."
    )


def _estimate_beneficiaries(entry: dict, population: int) -> int:
    """Rough estimate: population scaled by how severe the infra gap is."""
    gap_fraction = entry["components"]["infrastructure_gap_score"] / 100
    # Assume the affected population is proportional to the gap severity,
    # bounded between 5% and 60% of total district population.
    fraction = max(0.05, min(gap_fraction * 0.6, 0.6))
    return int(population * fraction)


def generate_recommendations(db: Session, persist: bool = True) -> list[dict]:
    """
    Computes priorities and converts each into a recommendation dict.
    If persist=True, also writes/updates rows in the Recommendation table.
    """
    priorities = compute_priorities(db)
    regions = {r.id: r for r in db.query(Region).all()}

    recommendations = []
    for entry in priorities:
        region = regions.get(entry["region_id"])
        if region is None:
            continue

        project_name, expected_impact = SECTOR_PROJECTS.get(
            entry["sector"], ("General Infrastructure Improvement", "Improved local infrastructure")
        )
        reasoning = _build_reasoning(entry)
        beneficiaries = _estimate_beneficiaries(entry, region.population)

        rec_dict = {
            "region_id": entry["region_id"],
            "region_name": entry["region_name"],
            "sector": entry["sector"],
            "project_name": project_name,
            "reasoning": reasoning,
            "estimated_beneficiaries": beneficiaries,
            "expected_impact": expected_impact,
            "priority_score": entry["priority_score"],
            "citizen_demand_score": entry["components"]["citizen_demand_score"],
            "infrastructure_gap_score": entry["components"]["infrastructure_gap_score"],
            "population_impact_score": entry["components"]["population_impact_score"],
            "urgency_score": entry["components"]["urgency_score"],
            "policy_alignment_score": entry["components"]["policy_alignment_score"],
            "priority_band": entry["priority_band"],
            "request_count": entry["request_count"],
        }
        recommendations.append(rec_dict)

    if persist:
        _persist_recommendations(db, recommendations)

    return recommendations


def _persist_recommendations(db: Session, recommendations: list[dict]) -> None:
    """Clears old recommendations and writes the fresh set. Simple full-refresh strategy."""
    db.query(Recommendation).delete()
    for rec in recommendations:
        db.add(Recommendation(
            region_id=rec["region_id"],
            sector=rec["sector"],
            project_name=rec["project_name"],
            reasoning=rec["reasoning"],
            estimated_beneficiaries=rec["estimated_beneficiaries"],
            expected_impact=rec["expected_impact"],
            priority_score=rec["priority_score"],
            citizen_demand_score=rec["citizen_demand_score"],
            infrastructure_gap_score=rec["infrastructure_gap_score"],
            population_impact_score=rec["population_impact_score"],
            urgency_score=rec["urgency_score"],
            policy_alignment_score=rec["policy_alignment_score"],
            priority_band=rec["priority_band"],
            request_count=rec["request_count"],
        ))
    db.commit()