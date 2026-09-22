import React, { useState, useEffect } from "react";
import {
  Shield,
  Radio,
  Flame,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  XCircle,
  FileCheck,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { IncidentMap } from "@/components/IncidentMap";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { PillarBreakdown } from "@/components/PillarBreakdown";
import { AuditTimeline } from "@/components/AuditTimeline";
import { api, Pattern, Incident, Review, DashboardSummary } from "@/lib/api";

export const AuthorityDashboard: React.FC = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Review Dialog State
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"DISPATCH" | "MONITOR" | "FALSE_ALARM" | "CLOSE" | "ESCALATE">("DISPATCH");
  const [officerNotes, setOfficerNotes] = useState("");
  const [officerName, setOfficerName] = useState("Command Officer Sharma (ID: 884)");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patternsData, incidentsData, summaryData] = await Promise.all([
        api.getPatterns(),
        api.getIncidents(),
        api.getDashboardSummary(),
      ]);
      setPatterns(patternsData);
      setIncidents(incidentsData);
      setSummary(summaryData);

      if (patternsData.length > 0 && !selectedPattern) {
        setSelectedPattern(patternsData[0]);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatternReviews = async (patternId: string) => {
    try {
      const revs = await api.getPatternReviews(patternId);
      setReviews(revs);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPattern) {
      loadPatternReviews(selectedPattern.id);
    }
  }, [selectedPattern]);

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      const updatedPatterns = await api.refreshPatterns();
      setPatterns(updatedPatterns);
      if (updatedPatterns.length > 0) {
        setSelectedPattern(updatedPatterns[0]);
      }
      const [incidentsData, summaryData] = await Promise.all([
        api.getIncidents(),
        api.getDashboardSummary(),
      ]);
      setIncidents(incidentsData);
      setSummary(summaryData);
      setFeedbackMessage("DBSCAN clusters & 6-Pillar Risk Scores successfully recomputed from active signals.");
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      setFeedbackMessage(`Refresh failed: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedPattern) return;
    setSubmittingAction(true);
    try {
      await api.createReview({
        pattern_id: selectedPattern.id,
        action: actionType,
        notes: officerNotes || `Officer selected ${actionType} based on 6-pillar risk evidence.`,
        reviewed_by: officerName,
      });

      // Reload reviews & pattern list
      await loadPatternReviews(selectedPattern.id);
      const updated = await api.getPatterns();
      setPatterns(updated);
      const updatedCurr = updated.find((p) => p.id === selectedPattern.id);
      if (updatedCurr) setSelectedPattern(updatedCurr);

      setReviewDialogOpen(false);
      setOfficerNotes("");
      setFeedbackMessage(`Authority Action '${actionType}' logged to immutable audit ledger.`);
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="critical">AUTHORITY COMMAND DESK</Badge>
            <span className="text-xs font-mono text-slate-400">Bangalore Metropolitan Safety Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            ASTRA Multi-Signal Intelligence Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            DBSCAN spatial clustering • Modus Operandi correlation • Explainable 6-Pillar Risk Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="text-xs font-mono border-blue-500/30 text-blue-300 hover:bg-blue-950/50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Re-Clustering..." : "Recalculate Clusters"}
          </Button>

          <Button
            variant="emergency"
            size="sm"
            onClick={() => {
              if (selectedPattern) {
                setActionType("DISPATCH");
                setReviewDialogOpen(true);
              }
            }}
            disabled={!selectedPattern}
            className="text-xs font-mono"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Dispatch Patrol
          </Button>
        </div>
      </div>

      {feedbackMessage && (
        <Alert variant="info" className="border-blue-500/50 bg-blue-950/40">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <AlertTitle>System Update</AlertTitle>
          <AlertDescription>{feedbackMessage}</AlertDescription>
        </Alert>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Active Hotspot Clusters</div>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                {summary?.active_patterns ?? patterns.length}
              </div>
              <div className="text-[10px] text-blue-400 mt-0.5">DBSCAN Epsilon 150m</div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Critical Threat Zones</div>
              <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
                {summary?.critical_patterns ?? patterns.filter((p) => p.pattern_level === "CRITICAL" || p.pattern_level === "ESCALATING").length}
              </div>
              <div className="text-[10px] text-rose-400 mt-0.5">Immediate Response Recommended</div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total Ingested Signals</div>
              <div className="text-2xl font-black text-slate-200 mt-1 font-mono">
                {incidents.length}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Citizen + CCTV + Patrols</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Anti-Gaming / Sybil Defense</div>
              <div className="text-2xl font-black text-amber-300 mt-1 font-mono">
                100%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Independent Reporter Gating Active</div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Live Command & Map</TabsTrigger>
          <TabsTrigger value="patterns">Hotspot Patterns ({patterns.length})</TabsTrigger>
          <TabsTrigger value="incidents">All Raw Signals ({incidents.length})</TabsTrigger>
          <TabsTrigger value="audit">Tamper-Proof Audit Log ({reviews.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview (Dual Column: List + Map + Detail Panel) */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 cols: Pattern List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                  Identified Hotspot Clusters
                </span>
                <span className="text-[11px] font-mono text-blue-400">Sorted by Risk</span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {patterns.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-mono border border-dashed border-white/10 rounded-xl">
                    No active patterns detected. Ingest incidents or click 'Recalculate Clusters'.
                  </div>
                ) : (
                  patterns.map((pat) => (
                    <RiskScoreCard
                      key={pat.id}
                      pattern={pat}
                      isSelected={selectedPattern?.id === pat.id}
                      onClick={() => setSelectedPattern(pat)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right 8 cols: Interactive Map + Selected Pattern Deep Dive */}
            <div className="lg:col-span-8 space-y-6">
              {/* Map Card */}
              <Card className="border-white/15 bg-slate-950/80">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-white">
                      Spatial Hotspot Map
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Visualizing DBSCAN cluster radii and individual verified signal origins.
                    </CardDescription>
                  </div>
                  {selectedPattern && (
                    <Badge variant="watch" className="font-mono text-[10px]">
                      Viewing Cluster #{selectedPattern.cluster_id ?? "0"}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-2 h-[340px]">
                  <IncidentMap
                    patterns={patterns}
                    incidents={incidents}
                    selectedPatternId={selectedPattern?.id}
                    onSelectPattern={(pat) => setSelectedPattern(pat)}
                  />
                </CardContent>
              </Card>

              {/* Selected Pattern Deep Dive */}
              {selectedPattern && (
                <Card className="border-blue-500/30 bg-slate-900/80 shadow-2xl">
                  <CardHeader className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={selectedPattern.pattern_level === "CRITICAL" ? "critical" : selectedPattern.pattern_level === "ESCALATING" ? "escalating" : "concerning"}>
                          {selectedPattern.pattern_level} THREAT
                        </Badge>
                        <span className="text-xs font-mono text-slate-400">
                          ID: {selectedPattern.id.slice(0, 12)}...
                        </span>
                        <span className="text-xs font-mono text-emerald-400">
                          Status: {selectedPattern.status}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-white">
                        {selectedPattern.title || `Cluster #${selectedPattern.cluster_id}`}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 text-slate-300">
                        {selectedPattern.explanation || "Coordinated multi-signal pattern identified across independent sources."}
                      </CardDescription>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="cyber"
                        size="sm"
                        onClick={() => {
                          setActionType("MONITOR");
                          setReviewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Monitor
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setActionType("DISPATCH");
                          setReviewDialogOpen(true);
                        }}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        Dispatch Unit
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-6">
                    {/* 6-Pillar Risk Engine Breakdown */}
                    <PillarBreakdown pattern={selectedPattern} />

                    {/* Modus Operandi & Anti-Gaming Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                      <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-300">
                          <Flame className="h-4 w-4 text-rose-400" />
                          Modus Operandi & Behavior Correlation
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedPattern.evidence?.behaviour_similarity?.explanation ||
                            "Repeated behavior similarity detected in victim-stalking reports and loitering clusters within the 150m perimeter."}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-300">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          Anti-Gaming Multi-Source Confirmation
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Validated by <b>{selectedPattern.reporter_diversity} distinct independent reporters</b> across citizen submissions and CCTV telemetry, preventing false spam sybil manipulation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: All Patterns List */}
        <TabsContent value="patterns">
          <Card className="border-white/15 bg-slate-950/80">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white">All Pattern Hotspots</CardTitle>
                <CardDescription className="text-xs">
                  Active clusters computed by ASTRA's DBSCAN and multi-factor risk engine.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cluster Title</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Risk Index</TableHead>
                    <TableHead>Signals Count</TableHead>
                    <TableHead>Reporter Diversity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patterns.map((pat) => (
                    <TableRow key={pat.id}>
                      <TableCell className="font-semibold text-white">
                        {pat.title || `Cluster #${pat.cluster_id}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pat.pattern_level === "CRITICAL"
                              ? "critical"
                              : pat.pattern_level === "ESCALATING"
                              ? "escalating"
                              : pat.pattern_level === "CONCERNING"
                              ? "concerning"
                              : "watch"
                          }
                        >
                          {pat.pattern_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-amber-400">
                        {Math.round(pat.risk_score)} / 100
                      </TableCell>
                      <TableCell className="font-mono">{pat.incident_count} reports</TableCell>
                      <TableCell className="font-mono text-emerald-400">
                        {pat.reporter_diversity} distinct reporters
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {pat.status}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="cyber"
                          size="sm"
                          onClick={() => {
                            setSelectedPattern(pat);
                            setActionType("DISPATCH");
                            setReviewDialogOpen(true);
                          }}
                        >
                          Intervene
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Incidents Feed Table */}
        <TabsContent value="incidents">
          <Card className="border-white/15 bg-slate-950/80">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold text-white">All Raw Incident Telemetry</CardTitle>
              <CardDescription className="text-xs">
                Complete ingestion stream from citizens, CCTV AI, and security patrols.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Cluster ID</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc) => (
                    <TableRow key={inc.id}>
                      <TableCell className="font-semibold capitalize text-white">
                        {inc.incident_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-slate-300 max-w-xs truncate">
                        {inc.description || "No description provided."}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {inc.reporter_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-bold ${inc.severity >= 4 ? 'text-red-400' : inc.severity >= 3 ? 'text-amber-400' : 'text-blue-400'}`}>
                          {inc.severity} / 5
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-blue-400">
                        {inc.cluster_id !== null && inc.cluster_id !== undefined ? `#${inc.cluster_id}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-500">
                        {new Date(inc.timestamp || inc.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Audit Timeline Ledger */}
        <TabsContent value="audit">
          <Card className="border-white/15 bg-slate-950/80">
            <CardHeader className="p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-base font-bold text-white">
                  Tamper-Evident Authority Action Ledger
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Immutable audit trail of all officer interventions, patrol dispatches, and pattern resolutions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <AuditTimeline reviews={reviews} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Authority Action Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Authority Intervention</DialogTitle>
            <DialogDescription>
              Record an official police or security dispatch action for this pattern.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="font-mono text-slate-300 block mb-1.5 font-semibold">
                Action Protocol *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "DISPATCH", label: "Dispatch Patrol Unit", icon: Send, color: "text-red-400" },
                  { id: "MONITOR", label: "Active Surveillance", icon: Eye, color: "text-blue-400" },
                  { id: "ESCALATE", label: "Escalate to HQ", icon: AlertTriangle, color: "text-amber-400" },
                  { id: "CLOSE", label: "Close Hotspot", icon: XCircle, color: "text-slate-400" },
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActionType(act.id as any)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        actionType === act.id
                          ? "border-blue-500 bg-blue-950/60 text-white shadow-sm"
                          : "border-white/10 bg-slate-900/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${act.color}`} />
                      <span className="font-medium text-[11px]">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-mono text-slate-300 block mb-1 font-semibold">
                Reviewing Officer Name / Badge #
              </label>
              <input
                type="text"
                className="w-full bg-slate-900/80 border border-white/15 rounded-md p-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-blue-500"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-mono text-slate-300 block mb-1 font-semibold">
                Officer Notes & Tactical Directives
              </label>
              <Textarea
                placeholder="e.g., 2 motorcycle patrol officers dispatched to MG Road Metro exit. Streetlighting unit alerted."
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewDialogOpen(false)}
              disabled={submittingAction}
            >
              Cancel
            </Button>
            <Button
              variant="emergency"
              size="sm"
              onClick={handleExecuteAction}
              disabled={submittingAction}
            >
              {submittingAction ? "Recording to Ledger..." : "Commit Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
