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
      <div className="flex items-center justify-center p-8 text-xs text-slate-500 font-mono">
        Loading authority action audit trail...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs font-mono border border-dashed border-white/10 rounded-xl">
        No authority interventions recorded yet. Actions taken will appear here in the tamper-evident audit ledger.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "DISPATCH":
        return <Send className="h-4 w-4 text-rose-400" />;
      case "MONITOR":
        return <Eye className="h-4 w-4 text-blue-400" />;
      case "FALSE_ALARM":
      case "CLOSE":
        return <XCircle className="h-4 w-4 text-slate-400" />;
      case "ESCALATE":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "DISPATCH":
        return <Badge variant="destructive">POLICE DISPATCHED</Badge>;
      case "MONITOR":
        return <Badge variant="watch">ACTIVE SURVEILLANCE</Badge>;
      case "FALSE_ALARM":
        return <Badge variant="secondary">FALSE POSITIVE</Badge>;
      case "ESCALATE":
        return <Badge variant="concerning">ESCALATED</Badge>;
      default:
        return <Badge variant="normal">{action}</Badge>;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
      {reviews.map((rev) => (
        <div key={rev.id} className="relative group">
          {/* Node */}
          <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center shadow-sm">
            {getActionIcon(rev.action)}
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-white/5 group-hover:border-white/15 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <div className="flex items-center gap-2">
                {getActionBadge(rev.action)}
                <span className="text-xs font-mono text-slate-300">
                  By: <b className="text-white">{rev.reviewed_by}</b>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Clock className="h-3 w-3" />
                {new Date(rev.created_at).toLocaleString()}
              </div>
            </div>

            {rev.notes && (
              <p className="text-xs text-slate-300 font-sans mt-1 bg-black/20 p-2 rounded border border-white/5">
                "{rev.notes}"
              </p>
            )}

            <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>Pattern ID: {rev.pattern_id.slice(0, 8)}...</span>
              <span>•</span>
              <span className="text-emerald-400">Ledger Verified</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
