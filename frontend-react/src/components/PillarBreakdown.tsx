import React from "react";
import { MapPin, Clock, Flame, TrendingUp, Users, ShieldAlert } from "lucide-react";
import { Progress } from "./ui/progress";
import { Pattern } from "@/lib/api";

interface PillarBreakdownProps {
  pattern: Pattern;
}

export const PillarBreakdown: React.FC<PillarBreakdownProps> = ({ pattern }) => {
  const p = pattern.evidence?.pillars || {};

  const getScore = (val: any) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === "number") return val <= 1.0 ? Math.round(val * 100) : Math.round(val);
    if (typeof val?.score === "number") {
      return val.score <= 1.0 ? Math.round(val.score * 100) : Math.round(val.score);
    }
    return 0;
  };

  const pillars = [
    {
      id: "spatial",
      name: "Spatial Concentration",
      icon: MapPin,
      score: getScore(p.spatial) || (pattern.radius_meters <= 100 ? 90 : 70),
      weight: "20%",
      detail: `${pattern.radius_meters ? Math.round(pattern.radius_meters) : 150}m radius envelope`,
      color: "bg-blue-600",
      textColor: "text-blue-600",
      description: "Density of incidents mapped within immediate spatial proximity radius.",
    },
    {
      id: "temporal",
      name: "Temporal Window",
      icon: Clock,
      score: getScore(p.temporal) || 75,
      weight: "15%",
      detail: pattern.time_window || "19:00 - 23:00 Evening Peak",
      color: "bg-indigo-600",
      textColor: "text-indigo-600",
      description: "Clustering of reports in recurring specific time slots or night intervals.",
    },
    {
      id: "frequency",
      name: "Frequency & Volume",
      icon: Flame,
      score: getScore(p.frequency) || Math.min(pattern.incident_count * 18, 100),
      weight: "20%",
      detail: `${pattern.incident_count} reports registered`,
      color: "bg-amber-600",
      textColor: "text-amber-600",
      description: "Recurrence frequency and volume of incoming signal reports in this hotspot.",
    },
    {
      id: "trend",
      name: "Trend Acceleration",
      icon: TrendingUp,
      score: getScore(p.trend) || Math.round(pattern.trend_score * 100),
      weight: "15%",
      detail: `${Math.round(pattern.trend_score * 100)}% velocity increase`,
      color: "bg-orange-600",
      textColor: "text-orange-600",
      description: "Velocity change comparing current 24h window against baseline history.",
    },
    {
      id: "diversity",
      name: "Reporter Diversity",
      icon: Users,
      score: getScore(p.reporter_diversity) || Math.min(pattern.reporter_diversity * 33, 100),
      weight: "15%",
      detail: `${pattern.reporter_diversity} distinct independent reporters`,
      color: "bg-emerald-600",
      textColor: "text-emerald-600",
      description: "Anti-sybil diversity: signals validated by independent cross-source contributors.",
    },
    {
      id: "behaviour",
      name: "Behavior & MO Similarity",
      icon: ShieldAlert,
      score: getScore(p.behaviour_similarity) || getScore(pattern.evidence?.behaviour_similarity) || 68,
      weight: "15%",
      detail: pattern.evidence?.behaviour_similarity?.dominant_type || (pattern.incident_types ? pattern.incident_types.join(", ") : "Coordinated Stalking / Group loitering"),
      color: "bg-rose-600",
      textColor: "text-rose-600",
      description: "Modus Operandi correlation matching pattern descriptions and behavior markers.",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Risk Factor Analysis (6 Pillars)
        </h4>
        <span className="text-[11px] text-slate-500">Weights total 100%</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800">{pillar.name}</span>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200/60 text-slate-600">
                        {pillar.weight}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{pillar.detail}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${pillar.textColor}`}>
                    {pillar.score}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Progress value={pillar.score} indicatorClassName={pillar.color} className="h-1.5 bg-slate-200/60" />
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-1">{pillar.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
