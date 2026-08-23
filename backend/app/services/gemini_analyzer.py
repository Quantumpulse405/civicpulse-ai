"""
Gemini-mode AI analysis engine for CivicPulse AI.

Uses the current `google-genai` SDK (NOT the deprecated
`google.generativeai` package). Requires GEMINI_API_KEY in the environment.

If the Gemini call fails for any reason (bad key, quota, network issue),
we fall back to the demo engine so the platform never hard-crashes during
a live demo -- see analyze_feedback() in analyzer.py for the fallback wiring.
"""
import os
import json
import re

from google import genai

_client = None


def _get_client():
    """Lazily create the Gemini client so import doesn't fail without a key."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(api_key=api_key)
    return _client


ANALYSIS_PROMPT_TEMPLATE = """You are a civic-infrastructure analyst for an Indian government platform.
Analyse the following citizen development request and respond with ONLY a
single JSON object, no markdown fences, no preamble, no explanation.

Citizen feedback text:
\"\"\"{text}\"\"\"

Required JSON fields:
- "detected_language": one of "en", "ta", "hi" (based on the actual script/language used in the text)
- "sector": one of "Healthcare", "Education", "Transportation", "Water & Sanitation", "Roads", "Electricity", "Digital Connectivity", "Public Safety"
- "problem_category": a short (3-6 word) description of the specific problem
- "urgency_score": a number 0-100, how urgent this issue is for public safety/wellbeing
- "sentiment": one of "negative", "neutral", "positive"
- "keywords": an array of 3-6 short lowercase keywords from the text (in its original language)

Respond with ONLY the JSON object."""


def _extract_json(raw_text: str) -> dict:
    """Gemini sometimes wraps JSON in ```json fences despite instructions; strip them."""
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    return json.loads(cleaned)


def analyze_feedback_gemini(text: str, hinted_sector: str | None = None) -> dict:
    """
    Calls Gemini to analyse citizen feedback. Raises on any failure so the
    caller (analyzer.py) can decide how to fall back.
    """
    client = _get_client()
    prompt = ANALYSIS_PROMPT_TEMPLATE.format(text=text)

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    parsed = _extract_json(response.text)

    sector = parsed.get("sector") or hinted_sector or "Public Safety"
    keywords = parsed.get("keywords", [])
    if isinstance(keywords, list):
        keywords_str = ",".join(str(k) for k in keywords[:6])
    else:
        keywords_str = str(keywords)

    return {
        "detected_language": parsed.get("detected_language", "en"),
        "sector": sector,
        "problem_category": parsed.get("problem_category", f"{sector} accessibility"),
        "urgency_score": float(parsed.get("urgency_score", 60.0)),
        "sentiment": parsed.get("sentiment", "neutral"),
        "keywords": keywords_str or "general",
        "ai_mode_used": "gemini",
    }