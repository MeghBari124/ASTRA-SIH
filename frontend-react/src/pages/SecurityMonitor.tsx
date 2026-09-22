import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Video,
  Camera,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { api, Incident, IncidentCreateInput } from "@/lib/api";

export const SecurityMonitor: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [lastEmitted, setLastEmitted] = useState<string | null>(null);

  const fetchStream = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
    const interval = setInterval(fetchStream, 10000);
    return () => clearInterval(interval);
  }, []);

  const simulatedCameras = [
    { id: "CAM-01-IND", name: "Indiranagar 100ft Metro Junction", status: "ONLINE", zone: "East Sector" },
    { id: "CAM-04-MGR", name: "MG Road Promenade Alley 2", status: "ONLINE", zone: "Central Sector" },
    { id: "CAM-09-KOR", name: "Koramangala 80ft Bus Stop", status: "ONLINE", zone: "South Sector" },
    { id: "CAM-12-MAJ", name: "Majestic Underpass South Exit", status: "ANOMALY", zone: "North Sector" },
  ];

  const triggerVisionSignal = async (type: string, description: string, lat: number, lng: number, severity: number) => {
    setSimulating(true);
    try {
      const payload: IncidentCreateInput = {
        incident_type: type,
        description: `[Edge CV AI] ${description}`,
        latitude: lat,
        longitude: lng,
        reporter_type: "cctv_ai",
        source: "edge_camera_stream",
        severity: severity,
        timestamp: new Date().toISOString(),
      };
      await api.createIncident(payload);
      await api.refreshPatterns();
      setLastEmitted(`${type.replace('_', ' ')} event registered from Edge Camera`);
      await fetchStream();
    } catch (err) {
      console.error("Vision trigger failed", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">CCTV & Sensor Ingestion</Badge>
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              4 Feeds Online
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Security Feed & Automated Edge Vision
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated sensor stream monitoring distress indicators, loitering clusters, and optical anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStream}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Sync Feeds
          </Button>
          <Link to="/authority">
            <Button size="sm" className="text-xs">
              Command Center
            </Button>
          </Link>
        </div>
      </div>

      {lastEmitted && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Signal Ingested</AlertTitle>
          <AlertDescription>
            {lastEmitted} → Automatically evaluated by DBSCAN pattern engine.
          </AlertDescription>
        </Alert>
      )}

      {/* Grid of CCTV Feeds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {simulatedCameras.map((cam) => (
          <Card key={cam.id} className="overflow-hidden">
            <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center border-b border-slate-200 relative p-4 text-center">
              <Camera className="h-8 w-8 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500 font-medium">Video Feed Snapshot</span>

              <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-[10px] font-mono text-slate-700">
                {cam.id}
              </div>

              <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-[10px] font-mono text-slate-600">
                LIVE
              </div>
            </div>

            <div className="p-3">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-xs text-slate-900 truncate max-w-[140px]">{cam.name}</div>
                <Badge variant={cam.status === "ANOMALY" ? "destructive" : "normal"} className="text-[10px]">
                  {cam.status}
                </Badge>
              </div>
              <div className="text-[11px] text-slate-500">{cam.zone}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Anomaly Simulation Triggers */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Edge Computer Vision Anomaly Triggers
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Simulate neural network detections to test automated cluster formation and risk escalation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled={simulating}
              onClick={() =>
                triggerVisionSignal(
                  "stalking",
                  "YOLOv8 Pose Model: Subject trailing lone pedestrian for >120m across consecutive camera FOVs.",
                  12.9756,
                  77.6066,
                  4
                )
              }
              className="p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Stalking / Trailing Detected
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Person re-identification trajectory marker trigger (MG Road area).
              </div>
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={() =>
                triggerVisionSignal(
                  "unsafe_gathering",
                  "Edge Vision Anomaly: 6+ individuals loitering in unlit corridor near underpass exit.",
                  12.9774,
                  77.5708,
                  3
                )
              }
              className="p-3 rounded-lg border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/30 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Group Loitering in Dark Zone
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Spatial density threshold trigger in unlit path (Majestic transit area).
              </div>
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={() =>
                triggerVisionSignal(
                  "physical_assault",
                  "Action Recognition Model: Sudden acceleration, struggle vector, or physical distress pose.",
                  12.9352,
                  77.6245,
                  5
                )
              }
              className="p-3 rounded-lg border border-slate-200 bg-white hover:border-red-400 hover:bg-red-50/30 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Critical Distress Vector
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                High-threat physical struggle pose indicator (Koramangala sector).
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Stream Feed Table */}
      <Card>
        <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Live Ingested Signals Feed
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log of multi-source signals entering the ASTRA analytics pipeline.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {incidents.length} Total Records
          </Badge>
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
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-medium capitalize text-slate-900">
                    {inc.incident_type.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-sm truncate text-xs">
                    {inc.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={inc.reporter_type === "cctv_ai" ? "warning" : "secondary"}
                      className="text-[10px] uppercase font-mono"
                    >
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
                      {inc.severity} / 5
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
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
