import React from "react";
import { Pattern } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

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
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-amber-600";
    if (score >= 20) return "text-blue-600";
    return "text-emerald-600";
  };

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:border-slate-300 ${
        isSelected
          ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20 shadow-xs"
          : "hover:bg-slate-50/50"
      }`}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0 border-b-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={getBadgeVariant(pattern.pattern_level)}>
              {pattern.pattern_level}
            </Badge>
            <span className="text-[11px] font-mono text-slate-500">
              Cluster #{pattern.cluster_id ?? "0"}
            </span>
          </div>
          <CardTitle className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
            {pattern.title || "Safety Hotspot Pattern"}
          </CardTitle>
        </div>

        <div className="text-right">
          <div className={`text-xl font-bold font-mono leading-none ${getScoreColor(pattern.risk_score)}`}>
            {Math.round(pattern.risk_score)}
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-tight">Risk Index</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {pattern.explanation || "Coordinated multi-signal pattern detected requiring authority dispatch."}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-center text-xs">
          <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
            <div className="text-slate-500 text-[10px]">Signals</div>
            <div className="text-slate-800 font-semibold">{pattern.incident_count}</div>
          </div>
          <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
            <div className="text-slate-500 text-[10px]">Reporters</div>
            <div className="text-slate-800 font-semibold">{pattern.reporter_diversity}x</div>
          </div>
          <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
            <div className="text-slate-500 text-[10px]">Radius</div>
            <div className="text-slate-800 font-semibold">{Math.round(pattern.radius_meters || 150)}m</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
