import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Filter,
  Clock,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { api, Alert as AlertType } from "@/lib/api";

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED">("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      await api.updateAlertStatus(alertId, newStatus);
      setMessage(`Alert status updated to ${newStatus}`);
      setTimeout(() => setMessage(null), 3000);
      await loadAlerts();
    } catch (err: any) {
      setMessage(`Failed: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter((al) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return al.status === "ACTIVE" || al.status === "NEW";
    return al.status === filter;
  });

  const activeCount = alerts.filter((a) => a.status === "ACTIVE" || a.status === "NEW").length;
  const acknowledgedCount = alerts.filter((a) => a.status === "ACKNOWLEDGED").length;
  const resolvedCount = alerts.filter((a) => a.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning">ALERT MONITORING</Badge>
            <span className="text-xs text-slate-500 font-medium">Automated Threshold System</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Operational Alerts Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System generated incident threshold notifications, escalating risks, and response tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Alerts
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant="info">
          <AlertTitle>Status Updated</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase">Active / Unresolved</div>
            <div className="text-2xl font-bold text-red-600 font-mono mt-1">{activeCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Requires immediate action</div>
          </div>
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase">Acknowledged</div>
            <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{acknowledgedCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">In progress by dispatch</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase">Resolved Today</div>
            <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">{resolvedCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Closed & verified</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Table */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md">
            {[
              { id: "ALL", label: `All (${alerts.length})` },
              { id: "ACTIVE", label: `Active (${activeCount})` },
              { id: "ACKNOWLEDGED", label: `Acknowledged (${acknowledgedCount})` },
              { id: "RESOLVED", label: `Resolved (${resolvedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filter === tab.id
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredAlerts.length} records
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    No alerts matching the selected filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((al) => (
                  <TableRow key={al.id}>
                    <TableCell>
                      <Badge
                        variant={
                          al.level === "CRITICAL"
                            ? "critical"
                            : al.level === "HIGH" || al.level === "ESCALATING"
                            ? "escalating"
                            : "concerning"
                        }
                        className="text-[10px]"
                      >
                        {al.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      {al.title}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-md text-xs leading-relaxed">
                      {al.message}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          al.status === "RESOLVED"
                            ? "success"
                            : al.status === "ACKNOWLEDGED"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-[10px] font-mono"
                      >
                        {al.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {new Date(al.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {al.status !== "ACKNOWLEDGED" && al.status !== "RESOLVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleUpdateStatus(al.id, "ACKNOWLEDGED")}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {al.status !== "RESOLVED" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleUpdateStatus(al.id, "RESOLVED")}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
