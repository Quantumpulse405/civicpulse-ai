const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

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
  similar_count: number;
}

export interface ApiError {
  detail: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a lightweight health check ping to wake up the backend if sleeping on Render.
 */
export async function wakeUpBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function submitFeedback(
  payload: FeedbackPayload
): Promise<FeedbackResponse> {
  let res: Response | null = null;
  let lastError: any = null;

  // Retry up to 2 times to handle Render cold start wake-up delays
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      break;
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await sleep(1500);
      }
    }
  }

  if (!res) {
    throw new Error(
      "Unable to reach the server. Cloud services may be waking up (Render free tier). Please try again in a few seconds."
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
    const res = await fetch(`${API_BASE}/api/ai-status`, { cache: "no-store" });
    if (!res.ok) {
      return { ai_mode: "demo", label: "Demo AI Mode" };
    }
    return res.json();
  } catch {
    // Backend unreachable (sleeping, network issue, etc.)
    return { ai_mode: "unknown", label: "AI status connecting..." };
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
  citizen_demand_score: number;
  infrastructure_gap_score: number;
  population_impact_score: number;
  urgency_score: number;
  policy_alignment_score: number;
}

async function safeGet<T>(path: string, fallback: T, retries = 2): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // If error occurs, wait before retry if not last attempt
      if (attempt < retries) {
        await sleep(1500);
      }
    }
  }
  return fallback;
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

export async function getRegionDetail(id: string | number, retries = 2): Promise<RegionDetail | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/api/regions/${id}`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      if (attempt < retries) {
        await sleep(1500);
      }
    }
  }
  return null;
}