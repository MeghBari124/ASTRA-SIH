import React from "react";
import { Pattern } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, ArrowUpRight, CheckCircle2, Flame, MapPin } from "lucide-react";

interface RiskScoreCardProps {
  pattern: Pattern;
  onClick?: () => void;
  isSelected?: boolean;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  pattern,
  onClick,
  isSelected,
}) => {
  const getBadgeVariant = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "critical" as const;
      case "ESCALATING":
        return "escalating" as const;
      case "CONCERNING":
        return "concerning" as const;
      case "WATCH":
        return "watch" as const;
      default:
        return "normal" as const;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-rose-400";
    if (score >= 40) return "text-amber-400";
    if (score >= 20) return "text-blue-400";
    return "text-emerald-400";
  };

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:translate-y-[-2px] hover:border-white/20 ${
        isSelected
          ? "border-blue-500/60 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          : ""
      }`}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={getBadgeVariant(pattern.pattern_level)}>
              {pattern.pattern_level}
            </Badge>
            <span className="text-[11px] font-mono text-slate-400">
              Cluster #{pattern.cluster_id ?? "0"}
            </span>
          </div>
          <CardTitle className="text-sm font-semibold text-white truncate max-w-[220px]">
            {pattern.title || "Multi-signal Safety Anomaly"}
          </CardTitle>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-black font-mono leading-none ${getScoreColor(pattern.risk_score)}`}>
            {Math.round(pattern.risk_score)}
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Risk Index</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {pattern.explanation || "Coordinated multi-signal pattern detected requiring authority dispatch."}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs font-mono">
          <div className="bg-slate-900/40 p-1.5 rounded">
            <div className="text-slate-400 text-[10px]">Incidents</div>
            <div className="text-slate-200 font-bold">{pattern.incident_count}</div>
          </div>
          <div className="bg-slate-900/40 p-1.5 rounded">
            <div className="text-slate-400 text-[10px]">Diversity</div>
            <div className="text-emerald-400 font-bold">{pattern.reporter_diversity}x</div>
          </div>
          <div className="bg-slate-900/40 p-1.5 rounded">
            <div className="text-slate-400 text-[10px]">Radius</div>
            <div className="text-blue-400 font-bold">{Math.round(pattern.radius_meters || 150)}m</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
