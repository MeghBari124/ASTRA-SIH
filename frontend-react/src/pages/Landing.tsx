import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Radio, LayoutDashboard, FileText, ArrowRight, Activity, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, DashboardSummary } from "@/lib/api";

export const Landing: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardSummary()
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const portals = [
    {
      title: "Citizen Incident Portal",
      subtitle: "Instant & Anonymous Safety Reporting",
      description: "Empowers citizens to rapidly file verified geolocation-tagged harassment or unsafe condition reports with zero latency.",
      icon: FileText,
      path: "/citizen",
      cta: "Submit Report",
      color: "from-blue-600 to-indigo-600",
      accent: "border-blue-500/30 hover:border-blue-500/60",
      badge: "Public Access",
      badgeVariant: "watch" as const,
    },
    {
      title: "Security & CCTV Stream",
      subtitle: "Live Automated Vision Ingestion",
      description: "Real-time automated edge CV feed ingesting spatial CCTV anomaly signals, distress pose flags, and patrol telemetry.",
      icon: Radio,
      path: "/security",
      cta: "Open Vision Feed",
      color: "from-amber-600 to-orange-600",
      accent: "border-amber-500/30 hover:border-amber-500/60",
      badge: "Edge / Patrols",
      badgeVariant: "concerning" as const,
    },
    {
      title: "Authority Command Center",
      subtitle: "Explainable 6-Pillar Risk Engine",
      description: "Executive operations dashboard featuring DBSCAN spatial clustering, Modus Operandi behavior correlation, and patrol dispatch.",
      icon: LayoutDashboard,
      path: "/authority",
      cta: "Launch Command Desk",
      color: "from-red-600 to-rose-600",
      accent: "border-red-500/30 hover:border-red-500/60",
      badge: "Law Enforcement",
      badgeVariant: "critical" as const,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-mono mb-2">
          <Cpu className="h-3.5 w-3.5 text-blue-400 animate-spin" />
          <span>ASTRA INTELLIGENCE CORE v2.4</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
          Multi-Signal Women Safety <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
            Pattern Detection Engine
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Proactive surveillance combining Citizen Reports, Edge CCTV AI, and Security Telemetry into an explainable 6-pillar risk scoring and spatial clustering platform.
        </p>

        {/* Live Metric Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400">Total Ingested Signals:</span>
            <span className="font-bold text-white">{loading ? "..." : summary?.total_incidents ?? 14}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-slate-400">Active Hotspot Clusters:</span>
            <span className="font-bold text-white">{loading ? "..." : summary?.active_patterns ?? 3}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-slate-400">Critical Priority Alerts:</span>
            <span className="font-bold text-rose-400">{loading ? "..." : summary?.critical_patterns ?? 1}</span>
          </div>
        </div>
      </div>

      {/* 3 Main Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <Card
              key={portal.path}
              className={`flex flex-col justify-between border ${portal.accent} bg-[#0c0f17]/80 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 hover:translate-y-[-4px]`}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${portal.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant={portal.badgeVariant}>{portal.badge}</Badge>
                </div>

                <div>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {portal.title}
                  </CardTitle>
                  <div className="text-xs font-mono text-blue-400/90 mt-0.5">
                    {portal.subtitle}
                  </div>
                </div>

                <CardDescription className="text-slate-400 text-xs leading-relaxed pt-1">
                  {portal.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Link to={portal.path} className="w-full">
                  <Button
                    variant="cyber"
                    className="w-full justify-between group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all font-semibold"
                  >
                    {portal.cta}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Pillars Footer */}
      <div className="border-t border-white/10 pt-8 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div className="text-xs font-mono text-blue-400 font-bold mb-1">DBSCAN CLUSTERING</div>
            <p className="text-[11px] text-slate-400">Adaptive spatial-temporal multi-source grouping</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div className="text-xs font-mono text-indigo-400 font-bold mb-1">ANTI-GAMING DEFENSE</div>
            <p className="text-[11px] text-slate-400">Sybil attack detection & reporter diversity gating</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div className="text-xs font-mono text-amber-400 font-bold mb-1">MO SIMILARITY</div>
            <p className="text-[11px] text-slate-400">Modus Operandi semantic & behavior correlation</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div className="text-xs font-mono text-rose-400 font-bold mb-1">AUDIT LEDGER</div>
            <p className="text-[11px] text-slate-400">Tamper-evident log of all dispatch decisions</p>
          </div>
        </div>
      </div>
    </div>
  );
};
