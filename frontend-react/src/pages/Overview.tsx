import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Layers,
  ShieldAlert,
  Radio,
  Bell,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Send,
  MapPin,
  Clock,
  Filter,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IncidentMap } from "@/components/IncidentMap";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { api, Pattern, Incident, Alert as AlertType, DashboardSummary } from "@/lib/api";

export const Overview: React.FC = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [pData, iData, aData, sData] = await Promise.all([
        api.getPatterns().catch(() => []),
        api.getIncidents().catch(() => []),
        api.getAlerts().catch(() => []),
        api.getDashboardSummary().catch(() => null),
      ]);
      setPatterns(pData);
      setIncidents(iData);
      setAlerts(aData);
      setSummary(sData);
      if (pData.length > 0 && !selectedPattern) {
        setSelectedPattern(pData[0]);
      }
    } catch (err) {
      console.error("Overview data load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRecalculate = async () => {
    try {
      setRefreshing(true);
      const updatedPatterns = await api.refreshPatterns();
      setPatterns(updatedPatterns);
      const [iData, aData, sData] = await Promise.all([
        api.getIncidents(),
        api.getAlerts(),
        api.getDashboardSummary(),
      ]);
      setIncidents(iData);
      setAlerts(aData);
      setSummary(sData);
    } catch (err) {
      console.error("Recalculate failed", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.updateAlertStatus(alertId, "ACKNOWLEDGED");
      const updated = await api.getAlerts();
      setAlerts(updated);
    } catch (err) {
      console.error("Failed to acknowledge alert", err);
    }
  };

  const criticalCount = summary?.critical_patterns ?? patterns.filter(
    (p) => p.pattern_level === "CRITICAL" || p.pattern_level === "ESCALATING"
  ).length;

  const activeAlerts = alerts.filter(
    (a) => a.status === "ACTIVE" || a.status === "NEW"
  );

  return (
    <div className="space-y-6">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Safety Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time surveillance & incident clustering • Bangalore Metropolitan Division
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Re-clustering..." : "Re-evaluate DBSCAN"}
          </Button>

          <Link to="/authority">
            <Button size="sm" className="text-xs">
              Authority Command Desk
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Hotspots</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {patterns.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">DBSCAN Clusters</div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Critical Zones</span>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-red-600 font-mono">
              {criticalCount}
            </div>
            <div className="text-[11px] text-red-600 font-medium mt-0.5">
              Requires Response
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ingested Signals</span>
            <Radio className="h-4 w-4 text-slate-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {incidents.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Multi-source feeds</div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Open Alerts</span>
            <Bell className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-600 font-mono">
              {activeAlerts.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pending Review</div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Patrol Response</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              4 Active
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Ground units online</div>
          </div>
        </Card>
      </div>

      {/* Main 2-Column: Map (7 cols) + Priority Alerts & Hotspot Quick Look (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="flex flex-col h-[480px]">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Spatial Operations Grid
                </CardTitle>
                <CardDescription className="text-xs">
                  Live spatial incident density and automated cluster envelopes.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {patterns.length} Active Hotspots
              </Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <IncidentMap
                patterns={patterns}
                incidents={incidents}
                selectedPatternId={selectedPattern?.id}
                onSelectPattern={(pat) => setSelectedPattern(pat)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Priority Alerts Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="flex flex-col h-[480px]">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Priority Alerts & Action Desk
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated risk threshold triggers requiring officer confirmation.
                </CardDescription>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all ({alerts.length})
              </Link>
            </CardHeader>

            <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg">
                  No alerts triggered. System operating within normal thresholds.
                </div>
              ) : (
                alerts.slice(0, 5).map((al) => (
                  <div
                    key={al.id}
                    className="p-3 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            al.level === "CRITICAL"
                              ? "bg-red-600"
                              : al.level === "HIGH" || al.level === "ESCALATING"
                              ? "bg-orange-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span className="text-xs font-semibold text-slate-900">
                          {al.title}
                        </span>
                      </div>
                      <Badge
                        variant={
                          al.status === "RESOLVED"
                            ? "success"
                            : al.status === "ACKNOWLEDGED"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-[10px] px-1.5 py-0 font-mono"
                      >
                        {al.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {al.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="font-mono">
                        {new Date(al.created_at).toLocaleTimeString()}
                      </span>
                      {al.status === "ACTIVE" || al.status === "NEW" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => handleAcknowledgeAlert(al.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                          Acknowledge
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Logged</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: Recent Incidents Table */}
      <Card>
        <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Recent Raw Signal Telemetry
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log of multi-source reports processed by the ingestion engine.
            </CardDescription>
          </div>
          <Link to="/citizen">
            <Button variant="outline" size="sm" className="text-xs">
              Submit Incident Report
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.slice(0, 8).map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-medium capitalize text-slate-900">
                    {inc.incident_type.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-sm truncate text-xs">
                    {inc.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {inc.reporter_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold text-xs ${
                        inc.severity >= 4
                          ? "text-red-600"
                          : inc.severity >= 3
                          ? "text-amber-600"
                          : "text-blue-600"
                      }`}
                    >
                      Level {inc.severity} / 5
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-600 font-medium">
                    {inc.cluster_id !== null && inc.cluster_id !== undefined
                      ? `#${inc.cluster_id}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-500">
                    {new Date(inc.timestamp || inc.created_at).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
