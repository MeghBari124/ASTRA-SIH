// API Client for ASTRA Backend

export interface Incident {
  id: string;
  incident_type: string;
  description?: string;
  latitude: number;
  longitude: number;
  reporter_type: string;
  source: string;
  severity: number;
  timestamp: string;
  reporter_id?: string;
  status: string;
  duplicate_candidate: boolean;
  cluster_id?: number;
  created_at: string;
}

export interface IncidentCreateInput {
  incident_type: string;
  description?: string;
  latitude: number;
  longitude: number;
  reporter_type?: string;
  source?: string;
  severity?: number;
  timestamp?: string;
}

export interface PillarEvidence {
  pillars?: {
    spatial?: {
      score: number;
      radius_m: number;
      weight: number;
    };
    temporal?: {
      score: number;
      window: string;
      weight: number;
    };
    frequency?: {
      score: number;
      incident_count: number;
      weight: number;
    };
    trend?: {
      score: number;
      delta_pct: number;
      weight: number;
    };
    reporter_diversity?: {
      score: number;
      distinct_reporters: number;
      weight: number;
    };
    behaviour_similarity?: {
      score: number;
      dominant_type?: string;
      weight: number;
    };
  };

  behaviour_similarity?: {
    score: number;
    dominant_type?: string;
    explanation?: string;
  };

  reporter_diversity_breakdown?: {
    distinct_reporters: number;
    source_counts?: Record<string, number>;
  };

  confidence?: number;

  [key: string]: any;
}

export interface Pattern {
  id: string;
  cluster_id?: number;
  title?: string;
  incident_count: number;
  incident_types?: string[];
  incident_ids?: string[];
  first_seen?: string;
  last_seen?: string;
  latitude?: number;
  longitude?: number;
  radius_meters: number;
  time_window?: string;
  reporter_diversity: number;
  trend_score: number;
  risk_score: number;

  pattern_level:
    | "NORMAL"
    | "WATCH"
    | "CONCERNING"
    | "ESCALATING"
    | "CRITICAL";

  status:
    | "NEW"
    | "UNDER_REVIEW"
    | "DISPATCHED"
    | "RESOLVED"
    | "CLOSED";

  explanation?: string;
  evidence?: PillarEvidence;
  created_at: string;
}

export interface Alert {
  id: string;
  pattern_id?: string;
  level: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface ReviewCreateInput {
  pattern_id: string;

  action:
    | "DISPATCH"
    | "MONITOR"
    | "FALSE_ALARM"
    | "CLOSE"
    | "ESCALATE";

  notes?: string;
  reviewed_by: string;
}

export interface Review {
  id: string;
  pattern_id: string;
  action: string;
  notes?: string;
  reviewed_by: string;
  created_at: string;
}

export interface DashboardSummary {
  total_incidents: number;
  active_patterns: number;
  critical_patterns: number;
  unresolved_alerts: number;

  risk_distribution: {
    normal: number;
    watch: number;
    concerning: number;
    escalating: number;
    critical: number;
  };
}

/*
 * Backend configuration
 *
 * Local development:
 * VITE_API_URL=http://localhost:8000
 *
 * Production:
 * VITE_API_URL=https://astra-sih-b3h9.onrender.com
 */

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const API_BASE = `${API_URL.replace(/\/$/, "")}/api`;


/**
 * Handle API responses
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status} ${res.statusText}`;

    try {
      const err = await res.json();

      if (err.detail) {
        errorDetail =
          typeof err.detail === "string"
            ? err.detail
            : JSON.stringify(err.detail);
      }
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(errorDetail);
  }

  return res.json();
}


/**
 * ASTRA API
 */
export const api = {
  // =========================================================
  // Health
  // =========================================================

  async health(): Promise<any> {
    const res = await fetch(`${API_URL}/health`);

    return handleResponse<any>(res);
  },


  // =========================================================
  // Incidents
  // =========================================================

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE}/incidents/`);

    return handleResponse<Incident[]>(res);
  },


  async createIncident(
    input: IncidentCreateInput
  ): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(input),
    });

    return handleResponse<Incident>(res);
  },


  // =========================================================
  // Patterns
  // =========================================================

  async getPatterns(): Promise<Pattern[]> {
    const res = await fetch(`${API_BASE}/patterns/`);

    return handleResponse<Pattern[]>(res);
  },


  async refreshPatterns(): Promise<Pattern[]> {
    const res = await fetch(`${API_BASE}/patterns/refresh`, {
      method: "POST",
    });

    return handleResponse<Pattern[]>(res);
  },


  // =========================================================
  // Alerts
  // =========================================================

  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/alerts/`);

    return handleResponse<Alert[]>(res);
  },


  async updateAlertStatus(
    alertId: string,
    status: string
  ): Promise<Alert> {
    const res = await fetch(
      `${API_BASE}/alerts/${alertId}?status=${encodeURIComponent(
        status
      )}`,
      {
        method: "PATCH",
      }
    );

    return handleResponse<Alert>(res);
  },


  // =========================================================
  // Reviews
  // =========================================================

  async createReview(
    input: ReviewCreateInput
  ): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews/`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(input),
    });

    return handleResponse<Review>(res);
  },


  async getPatternReviews(
    patternId: string
  ): Promise<Review[]> {
    const res = await fetch(
      `${API_BASE}/reviews/pattern/${patternId}`
    );

    return handleResponse<Review[]>(res);
  },


  // =========================================================
  // Dashboard Summary
  // =========================================================

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await fetch(
        `${API_BASE}/dashboard/summary`
      );

      return await handleResponse<DashboardSummary>(res);

    } catch {
      /*
       * Fallback:
       * If dashboard summary endpoint is unavailable,
       * derive the summary from existing API data.
       */

      const [
        patterns,
        incidents,
        alerts,
      ] = await Promise.all([
        api.getPatterns().catch(() => []),
        api.getIncidents().catch(() => []),
        api.getAlerts().catch(() => []),
      ]);

      return {
        total_incidents: incidents.length,

        active_patterns: patterns.length,

        critical_patterns: patterns.filter(
          (p) =>
            p.pattern_level === "ESCALATING" ||
            p.pattern_level === "CRITICAL"
        ).length,

        unresolved_alerts: alerts.filter(
          (a) =>
            a.status === "ACTIVE" ||
            a.status === "NEW"
        ).length,

        risk_distribution: {
          normal: patterns.filter(
            (p) => p.pattern_level === "NORMAL"
          ).length,

          watch: patterns.filter(
            (p) => p.pattern_level === "WATCH"
          ).length,

          concerning: patterns.filter(
            (p) => p.pattern_level === "CONCERNING"
          ).length,

          escalating: patterns.filter(
            (p) => p.pattern_level === "ESCALATING"
          ).length,

          critical: patterns.filter(
            (p) => p.pattern_level === "CRITICAL"
          ).length,
        },
      };
    }
  },
};
