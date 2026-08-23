const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface FeedbackPayload {
  text: string;
  language: "en" | "ta" | "hi";
  submitted_via: "text" | "voice";
  district_name: string;
  state_name: string;
  sector?: string;
}

export interface FeedbackResponse {
  id: number;
  raw_text: string;
  input_language: string;
  submitted_via: string;
  district_name: string;
  state_name: string;
  latitude: number | null;
  longitude: number | null;
  sector: string;
  problem_category: string;
  urgency_score: number;
  sentiment: string;
  keywords: string;
  ai_mode_used: string;
  created_at: string;
}

export interface ApiError {
  detail: string;
}

export async function submitFeedback(
  payload: FeedbackPayload
): Promise<FeedbackResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    let detail = "Something went wrong submitting your feedback.";
    try {
      const errBody = await res.json();
      if (typeof errBody.detail === "string") {
        detail = errBody.detail;
      } else if (Array.isArray(errBody.detail)) {
        detail = errBody.detail.map((d: any) => d.msg).join(", ");
      }
    } catch {
      // ignore JSON parse failure, use default message
    }
    throw new Error(detail);
  }

  return res.json();
}

export async function getAiStatus(): Promise<{ ai_mode: string; label: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/ai-status`);
    if (!res.ok) {
      return { ai_mode: "demo", label: "Demo AI Mode" };
    }
    return res.json();
  } catch {
    // Backend unreachable (not running, network issue, CORS block, etc.)
    return { ai_mode: "unknown", label: "AI status unavailable" };
  }
}

export interface DashboardSummary {
  total_requests: number;
  high_priority_regions: number;
  infrastructure_gaps: number;
  recommended_projects: number;
}

export interface PriorityTableEntry {
  rank: number;
  region_id: number;
  region_name: string;
  sector: string;
  citizen_demand_score: number;
  infrastructure_gap_score: number;
  population_impact_score: number;
  priority_score: number;
  priority_band: string;
  project_name: string;
  request_count: number;
}

export interface RegionMapEntry {
  id: number;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  request_count: number;
  dominant_sector: string | null;
  top_priority_score: number | null;
  top_priority_band: string | null;
}

export interface SectorDistributionEntry {
  sector: string;
  request_count: number;
}

export interface RecommendationEntry {
  id: number;
  region_id: number;
  region_name: string;
  sector: string;
  project_name: string;
  reasoning: string;
  estimated_beneficiaries: number;
  expected_impact: string;
  priority_score: number;
  priority_band: string;
}

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return safeGet("/api/dashboard/summary", {
    total_requests: 0,
    high_priority_regions: 0,
    infrastructure_gaps: 0,
    recommended_projects: 0,
  });
}

export function getDashboardPriorities(limit = 20): Promise<PriorityTableEntry[]> {
  return safeGet(`/api/dashboard/priorities?limit=${limit}`, []);
}

export function getDashboardRegions(): Promise<RegionMapEntry[]> {
  return safeGet("/api/dashboard/regions", []);
}

export function getDashboardSectors(): Promise<SectorDistributionEntry[]> {
  return safeGet("/api/dashboard/sectors", []);
}

export function getRecommendations(limit = 20): Promise<RecommendationEntry[]> {
  return safeGet(`/api/recommendations?limit=${limit}`, []);
}

export interface TrendEntry {
  date: string;
  request_count: number;
}

export function getDashboardTrend(days = 30): Promise<TrendEntry[]> {
  return safeGet(`/api/dashboard/trend?days=${days}`, []);
}

export interface RegionDetail {
  id: number;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  population: number;
  request_count: number;
  dominant_sector: string | null;
  recommendations: RecommendationEntry[];
}

export async function getRegionDetail(id: string | number): Promise<RegionDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/regions/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}