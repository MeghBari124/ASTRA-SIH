import React from "react";
import { Review } from "@/lib/api";
import { ShieldCheck, Send, Eye, XCircle, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

interface AuditTimelineProps {
  reviews: Review[];
  isLoading?: boolean;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ reviews, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-slate-500">
        Loading authority action audit trail...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
        No authority interventions recorded yet. Actions taken will appear here in the verified audit log.
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "DISPATCH":
        return <Badge variant="destructive">PATROL DISPATCHED</Badge>;
      case "MONITOR":
        return <Badge variant="watch">SURVEILLANCE ACTIVE</Badge>;
      case "FALSE_ALARM":
        return <Badge variant="secondary">FALSE ALARM</Badge>;
      case "ESCALATE":
        return <Badge variant="concerning">ESCALATED TO HQ</Badge>;
      case "CLOSE":
        return <Badge variant="normal">HOTSPOT RESOLVED</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {reviews.map((rev) => (
        <div key={rev.id} className="relative">
          {/* Timeline Node */}
          <div className="absolute -left-6 top-1.5 h-4 w-4 rounded-full bg-white border-2 border-blue-600 shadow-xs" />

          <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {getActionBadge(rev.action)}
                <span className="text-xs text-slate-700">
                  By: <strong className="font-semibold text-slate-900">{rev.reviewed_by}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Clock className="h-3 w-3" />
                {new Date(rev.created_at).toLocaleString()}
              </div>
            </div>

            {rev.notes && (
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200/60 leading-relaxed">
                "{rev.notes}"
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="font-mono">Pattern ID: {rev.pattern_id.slice(0, 10)}...</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified Action Logged
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
