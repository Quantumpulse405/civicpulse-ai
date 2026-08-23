"""
Seed script for CivicPulse AI.

Populates the SQLite database with clearly SYNTHETIC / DEMO data for a
10-district Tamil Nadu pilot. This is NOT official government data --
see README.md and docs/demo.md for the disclosure.

Run with:  python seed.py
"""
import random
from datetime import datetime, timedelta, timezone

from app.database import Base, engine, SessionLocal
from app.models import (
    Region,
    InfrastructureMetric,
    CitizenRequest,
    DevelopmentProject,
)

random.seed(42)  # reproducible synthetic data

SECTORS = [
    "Healthcare",
    "Education",
    "Transportation",
    "Water & Sanitation",
    "Roads",
    "Electricity",
    "Digital Connectivity",
    "Public Safety",
]

# name, state, lat, lon, population
DISTRICTS = [
    ("Chennai", "Tamil Nadu", 13.0827, 80.2707, 7_100_000),
    ("Coimbatore", "Tamil Nadu", 11.0168, 76.9558, 3_500_000),
    ("Madurai", "Tamil Nadu", 9.9252, 78.1198, 3_000_000),
    ("Salem", "Tamil Nadu", 11.6643, 78.1460, 2_200_000),
    ("Namakkal", "Tamil Nadu", 11.2189, 78.1677, 1_700_000),
    ("Erode", "Tamil Nadu", 11.3410, 77.7172, 2_250_000),
    ("Tiruchirappalli", "Tamil Nadu", 10.7905, 78.7047, 2_700_000),
    ("Tirunelveli", "Tamil Nadu", 8.7139, 77.7567, 1_650_000),
    ("Vellore", "Tamil Nadu", 12.9165, 79.1325, 1_600_000),
    ("Thanjavur", "Tamil Nadu", 10.7870, 79.1378, 2_400_000),
]

SAMPLE_TEXTS = {
    "Healthcare": [
        "Our village has no nearby hospital. The nearest hospital is more than 20 km away.",
        "There is no primary health centre in this area, people struggle during emergencies.",
        "We need a mobile medical unit, the closest clinic is too far for elderly patients.",
    ],
    "Transportation": [
        "There is no good bus service in our area. Students find it very difficult to reach college.",
        "Auto fares are too high because there is no direct bus route to the town.",
        "We need more frequent buses connecting our village to the district headquarters.",
    ],
    "Water & Sanitation": [
        "We have a drinking water problem and there is a severe shortage during summer.",
        "The water supply pipeline is old and frequently contaminated in our locality.",
        "There is no proper drainage system, sewage overflows during rains.",
    ],
    "Roads": [
        "The road connecting our village to the highway is badly damaged and unsafe.",
        "There are no streetlights and the internal roads are full of potholes.",
    ],
    "Education": [
        "Our school does not have enough classrooms for the number of students.",
        "There is no digital learning centre nearby for children in this village.",
    ],
    "Electricity": [
        "Power cuts are very frequent in our area, affecting small businesses.",
        "Several streets still don't have proper electricity connections.",
    ],
    "Digital Connectivity": [
        "Mobile network coverage is very poor here, we cannot access online services.",
        "There is no broadband access point in our village for students to study online.",
    ],
    "Public Safety": [
        "There is no police outpost nearby and response times are very slow.",
        "Street lighting is poor which makes the area unsafe at night.",
    ],
}

MULTILINGUAL_SAMPLES = [
    {
        "text": "எங்கள் பகுதியில் நல்ல பேருந்து வசதி இல்லை. மாணவர்கள் கல்லூரிக்கு செல்ல மிகவும் சிரமப்படுகிறார்கள்.",
        "language": "ta",
        "sector": "Transportation",
    },
    {
        "text": "हमारे क्षेत्र में पीने के पानी की समस्या है और गर्मियों में पानी की बहुत कमी होती है।",
        "language": "hi",
        "sector": "Water & Sanitation",
    },
]


def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Region).count()
        if existing > 0:
            print(f"Database already has {existing} regions. Skipping seed.")
            print("Delete civicpulse.db and rerun this script if you want a fresh seed.")
            return

        print("Seeding regions...")
        region_objs = []
        for name, state, lat, lon, pop in DISTRICTS:
            region = Region(
                name=name, state=state, country="India",
                latitude=lat, longitude=lon, population=pop,
            )
            db.add(region)
            region_objs.append(region)
        db.commit()
        for r in region_objs:
            db.refresh(r)

        print("Seeding infrastructure metrics...")
        for region in region_objs:
            for sector in SECTORS:
                # Bias scores so some districts clearly look under-served
                base = random.uniform(20, 90)
                db.add(InfrastructureMetric(
                    region_id=region.id,
                    sector=sector,
                    infra_score=round(base, 1),
                    existing_facilities=random.randint(0, 15),
                    last_investment_year=random.choice([None, 2018, 2019, 2020, 2021, 2022, 2023]),
                ))
        db.commit()

        print("Seeding development projects...")
        project_name_map = {
            "Healthcare": "Primary Healthcare Centre Upgrade",
            "Transportation": "Rural Bus Route Expansion",
            "Water & Sanitation": "Water Pipeline Modernisation",
            "Roads": "District Road Improvement Project",
            "Education": "Government School Digital Lab",
            "Electricity": "Rural Feeder Line Strengthening",
            "Digital Connectivity": "Public Broadband Access Point",
            "Public Safety": "Community Policing Outpost",
        }
        for region in region_objs:
            num_projects = random.randint(1, 4)
            chosen_sectors = random.sample(SECTORS, num_projects)
            for sector in chosen_sectors:
                db.add(DevelopmentProject(
                    region_id=region.id,
                    name=project_name_map[sector],
                    sector=sector,
                    status=random.choice(["planned", "ongoing", "completed"]),
                    year=random.choice([2019, 2020, 2021, 2022, 2023, 2024]),
                    budget_crore_inr=round(random.uniform(2, 80), 1),
                ))
        db.commit()

        print("Seeding citizen requests...")
        now = datetime.now(timezone.utc)
        count = 0
        for region in region_objs:
            num_requests = random.randint(4, 8)
            for _ in range(num_requests):
                sector = random.choice(SECTORS)
                text = random.choice(SAMPLE_TEXTS[sector])
                urgency = round(random.uniform(35, 95), 1)
                sentiment = random.choice(["negative", "negative", "neutral"])
                days_ago = random.randint(0, 120)
                db.add(CitizenRequest(
                    raw_text=text,
                    input_language="en",
                    submitted_via=random.choice(["text", "voice"]),
                    region_id=region.id,
                    district_name=region.name,
                    state_name=region.state,
                    latitude=region.latitude + random.uniform(-0.05, 0.05),
                    longitude=region.longitude + random.uniform(-0.05, 0.05),
                    sector=sector,
                    problem_category=f"{sector} accessibility",
                    urgency_score=urgency,
                    sentiment=sentiment,
                    keywords=",".join(text.lower().split()[:5]),
                    ai_mode_used="demo",
                    created_at=now - timedelta(days=days_ago),
                ))
                count += 1

        # Sprinkle in the two multilingual showcase scenarios in Chennai + Madurai
        showcase_regions = [region_objs[0], region_objs[2]]
        for region, sample in zip(showcase_regions, MULTILINGUAL_SAMPLES):
            db.add(CitizenRequest(
                raw_text=sample["text"],
                input_language=sample["language"],
                submitted_via="voice",
                region_id=region.id,
                district_name=region.name,
                state_name=region.state,
                latitude=region.latitude,
                longitude=region.longitude,
                sector=sample["sector"],
                problem_category=f"{sample['sector']} accessibility",
                urgency_score=round(random.uniform(60, 90), 1),
                sentiment="negative",
                keywords=sample["sector"].lower(),
                ai_mode_used="demo",
                created_at=now - timedelta(days=random.randint(0, 30)),
            ))
            count += 1

        db.commit()
        print(f"Seeded {len(region_objs)} regions and {count} citizen requests.")
        print("Done. This is SYNTHETIC/DEMO data -- not official government data.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()