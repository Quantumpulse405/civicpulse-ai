"""
Demo-mode AI analysis engine for CivicPulse AI.

This is a deterministic, rule-based multilingual NLP pipeline. It requires
no external API and no API key -- it is the fallback that guarantees the
platform works even with zero connectivity, per the hackathon's demo-mode
requirement.

Step 6B adds `analyze_feedback_gemini()` alongside this, and a router
function `analyze_feedback()` that picks between them based on AI_MODE.
"""
import os
import re

# ---------------------------------------------------------------------------
# Sector keyword sets -- multilingual (English / Tamil / Hindi transliteration
# is avoided; we match actual Tamil/Devanagari script plus English loanwords
# that citizens commonly mix in).
# ---------------------------------------------------------------------------
SECTOR_KEYWORDS = {
    "Healthcare": [
        "hospital", "clinic", "doctor", "medical", "health", "healthcare",
        "ambulance", "medicine", "மருத்துவமனை", "अस्पताल", "स्वास्थ्य",
    ],
    "Transportation": [
        "bus", "transport", "auto", "route", "connectivity", "vehicle",
        "பேருந்து", "बस", "परिवहन",
    ],
    "Water & Sanitation": [
        "water", "drainage", "sewage", "pipeline", "supply", "drinking",
        "தண்ணீர்", "पानी", "पीने", "जल",
    ],
    "Roads": [
        "road", "pothole", "highway", "street", "bridge",
        "சாலை", "सड़क", "राजमार्ग",
    ],
    "Education": [
        "school", "classroom", "college", "student", "teacher", "education",
        "கல்லூரி", "பள்ளி", "स्कूल", "शिक्षा", "कॉलेज",
    ],
    "Electricity": [
        "power", "electricity", "outage", "current", "transformer",
        "மின்சாரம்", "बिजली", "विद्युत",
    ],
    "Digital Connectivity": [
        "network", "mobile", "broadband", "internet", "signal", "wifi",
        "இணையம்", "इंटरनेट", "नेटवर्क",
    ],
    "Public Safety": [
        "police", "safety", "crime", "lighting", "security", "harassment",
        "பாதுகாப்பு", "पुलिस", "सुरक्षा",
    ],
}

# Words/phrases that signal high urgency across languages.
URGENCY_SIGNALS_HIGH = [
    "no ", "not ", "never", "severe", "emergency", "urgent", "immediately",
    "20 km", "far away", "no access", "cannot", "unsafe", "danger",
    "இல்லை", "மிகவும்", "नहीं", "बहुत", "कमी", "समस्या",
]
URGENCY_SIGNALS_MEDIUM = [
    "difficult", "struggle", "problem", "poor", "frequent", "shortage",
    "சிரமப்படு", "कठिनाई", "कमी",
]

NEGATIVE_SENTIMENT_SIGNALS = [
    "no ", "not ", "never", "problem", "difficult", "struggle", "unsafe",
    "poor", "shortage", "lack", "damaged", "unable",
    "இல்லை", "சிரம", "नहीं", "समस्या", "कमी",
]

# Tamil Unicode block: U+0B80–U+0BFF, Devanagari: U+0900–U+097F
TAMIL_PATTERN = re.compile(r"[\u0B80-\u0BFF]")
DEVANAGARI_PATTERN = re.compile(r"[\u0900-\u097F]")

STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "our", "we", "in", "on",
    "of", "to", "and", "for", "has", "have", "this", "that", "there", "very",
    "more", "than", "no", "not",
}


def detect_language(text: str) -> str:
    """Detect language from actual script, ignoring whatever the client claims."""
    if TAMIL_PATTERN.search(text):
        return "ta"
    if DEVANAGARI_PATTERN.search(text):
        return "hi"
    return "en"


def classify_sector(text: str, hinted_sector: str | None) -> str:
    """Weighted keyword match across all sectors; citizen's own hint wins ties."""
    lower_text = text.lower()
    scores = {sector: 0 for sector in SECTOR_KEYWORDS}
    for sector, keywords in SECTOR_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in lower_text:
                scores[sector] += 1

    best_sector = max(scores, key=scores.get)
    if scores[best_sector] == 0:
        # No keyword matched at all -- trust the citizen's own selection if given
        return hinted_sector or "Public Safety"

    # If the citizen's hint matches the text reasonably, prefer it on a near-tie
    if hinted_sector and scores.get(hinted_sector, 0) >= scores[best_sector] - 1:
        return hinted_sector

    return best_sector


def compute_urgency(text: str) -> float:
    """0-100 urgency score based on presence of urgency-signal phrases."""
    lower_text = text.lower()
    score = 40.0  # baseline: any complaint has some urgency
    for phrase in URGENCY_SIGNALS_HIGH:
        if phrase.lower() in lower_text:
            score += 12
    for phrase in URGENCY_SIGNALS_MEDIUM:
        if phrase.lower() in lower_text:
            score += 6
    return round(min(score, 98.0), 1)


def compute_sentiment(text: str) -> str:
    """negative | neutral | positive, based on negative-signal phrase density."""
    lower_text = text.lower()
    hits = sum(1 for phrase in NEGATIVE_SENTIMENT_SIGNALS if phrase.lower() in lower_text)
    if hits >= 2:
        return "negative"
    if hits == 1:
        return "negative"
    return "neutral"


def extract_keywords(text: str, limit: int = 6) -> str:
    """Extract meaningful keywords: strip stopwords/punctuation, keep order."""
    words = re.findall(r"[\w\u0B80-\u0BFF\u0900-\u097F]+", text.lower())
    meaningful = [w for w in words if w not in STOPWORDS and len(w) > 2]
    # de-duplicate while preserving order
    seen = set()
    result = []
    for w in meaningful:
        if w not in seen:
            seen.add(w)
            result.append(w)
        if len(result) >= limit:
            break
    return ",".join(result) if result else "general"


def analyze_feedback_demo(text: str, hinted_sector: str | None = None) -> dict:
    """
    Full demo-mode analysis pipeline. Deterministic, offline, no API key.
    """
    language = detect_language(text)
    sector = classify_sector(text, hinted_sector)
    urgency = compute_urgency(text)
    sentiment = compute_sentiment(text)
    keywords = extract_keywords(text)

    return {
        "detected_language": language,
        "sector": sector,
        "problem_category": f"{sector} accessibility",
        "urgency_score": urgency,
        "sentiment": sentiment,
        "keywords": keywords,
        "ai_mode_used": "demo",
    }


def analyze_feedback(text: str, language: str, hinted_sector: str | None = None) -> dict:
    """
    Router: uses Gemini when AI_MODE=gemini, with automatic fallback to the
    demo engine if the Gemini call fails for any reason (missing/invalid key,
    quota exceeded, network error). This guarantees the platform never
    hard-crashes during a live demo.
    """
    ai_mode = os.getenv("AI_MODE", "demo")

    if ai_mode == "gemini":
        try:
            from app.services.gemini_analyzer import analyze_feedback_gemini
            return analyze_feedback_gemini(text, hinted_sector)
        except Exception as exc:
            print(f"[CivicPulse] Gemini analysis failed, falling back to demo mode: {exc}")
            result = analyze_feedback_demo(text, hinted_sector)
            result["ai_mode_used"] = "demo (gemini fallback)"
            return result

    result = analyze_feedback_demo(text, hinted_sector)
    result["ai_mode_used"] = "demo"
    return result