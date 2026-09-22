import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Radio, Video, Camera, AlertTriangle, ShieldCheck, Play, RefreshCw, Zap, Bell, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
    { id: "CAM-01-IND", name: "Indiranagar 100ft Metro Junction", status: "ONLINE", fps: 30, zone: "East Corridor" },
    { id: "CAM-04-MGR", name: "MG Road Promenade Alley 2", status: "ONLINE", fps: 28, zone: "Central Corridor" },
    { id: "CAM-09-KOR", name: "Koramangala 80ft Bus Stop", status: "ONLINE", fps: 30, zone: "South Corridor" },
    { id: "CAM-12-MAJ", name: "Majestic Underpass South Exit", status: "ANOMALY", fps: 25, zone: "North Transit" },
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
      setLastEmitted(`${type} signal registered from Edge Camera`);
      await fetchStream();
    } catch (err) {
      console.error("Vision trigger failed", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="concerning">EDGE VISION & PATROL STREAM</Badge>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              4 Feeds Synchronized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Security & CCTV AI Real-Time Ingestion
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulated automated Computer Vision edge stream transmitting distress pose detections, group loitering, and security guard signals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStream}
            disabled={loading}
            className="text-xs font-mono"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Sync Stream
          </Button>
          <Link to="/authority">
            <Button variant="cyber" size="sm" className="text-xs font-mono">
              View Patterns Desk
            </Button>
          </Link>
        </div>
      </div>

      {lastEmitted && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Edge Signal Transmitted</AlertTitle>
          <AlertDescription>
            {lastEmitted} → Automatically ingested into DBSCAN spatio-temporal cluster engine.
          </AlertDescription>
        </Alert>
      )}

      {/* Grid of Simulated CCTV Edge Feeds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {simulatedCameras.map((cam) => (
          <Card key={cam.id} className="border-white/10 bg-[#0a0d14] overflow-hidden">
            <div className="relative aspect-video bg-black/60 flex items-center justify-center border-b border-white/10 group">
              {/* Fake Scanline */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent bg-[length:100%_4px] pointer-events-none" />
              
              <Camera className="h-8 w-8 text-slate-600 group-hover:text-blue-400 transition-colors" />

              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] font-mono text-slate-300">
                <span className={`h-1.5 w-1.5 rounded-full ${cam.status === "ANOMALY" ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
                {cam.id}
              </div>

              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-400">
                {cam.fps} FPS • LIVE
              </div>
            </div>

            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-1">
                <div className="font-semibold text-xs text-white truncate max-w-[150px]">{cam.name}</div>
                <Badge variant={cam.status === "ANOMALY" ? "destructive" : "normal"} className="text-[9px] px-1.5 py-0">
                  {cam.status}
                </Badge>
              </div>
              <div className="text-[11px] font-mono text-slate-400">{cam.zone}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Signal Injectors */}
      <Card className="border-blue-500/30 bg-blue-950/20 mb-8">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-sm font-mono text-blue-200">
              Edge Computer Vision Anomaly Injection Triggers
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Trigger simulated Computer Vision edge neural network signals to test ASTRA's real-time pattern clustering and risk elevation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              disabled={simulating}
              onClick={() =>
                triggerVisionSignal(
                  "stalking",
                  "YOLOv8 Pose Engine: Subject trailing lone pedestrian for >120m across consecutive camera FOVs.",
                  12.9756,
                  77.6066,
                  4
                )
              }
              className="text-xs justify-start h-auto p-3 border-white/10 hover:border-blue-500/50 hover:bg-blue-900/30 text-left cursor-pointer"
            >
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-0.5">
                  <span className="text-rose-400">●</span> Stalking / Trailing Detected
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Simulate YOLO multi-camera person re-identification trailing marker (MG Road).
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
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
              className="text-xs justify-start h-auto p-3 border-white/10 hover:border-amber-500/50 hover:bg-amber-900/30 text-left cursor-pointer"
            >
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-0.5">
                  <span className="text-amber-400">●</span> Group Loitering in Dark Zone
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Simulate spatial density threshold trigger in unlit path (Majestic).
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
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
              className="text-xs justify-start h-auto p-3 border-white/10 hover:border-red-500/50 hover:bg-red-900/30 text-left cursor-pointer"
            >
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-0.5">
                  <span className="text-red-500">●</span> Critical Distress Vector
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Simulate high-threat struggle pose model trigger (Koramangala).
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Stream Table */}
      <Card className="border-white/15 bg-slate-950/80">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-white">Live Ingested Signals Feed</CardTitle>
            <CardDescription className="text-xs">
              Chronological log of all signals entering the ASTRA analytics ingestion pipeline.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{incidents.length} Total Records</Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <ScrollArea className="h-[340px] w-full rounded-lg border border-white/10">
            <div className="divide-y divide-white/5 font-sans">
              {incidents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No signals ingested yet. Trigger an edge anomaly or submit a citizen report.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="p-3 hover:bg-white/[0.02] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={inc.reporter_type === "cctv_ai" ? "concerning" : "watch"}
                        className="text-[10px] uppercase font-mono shrink-0"
                      >
                        {inc.reporter_type}
                      </Badge>
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span className="capitalize">{inc.incident_type.replace('_', ' ')}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            (Sev: {inc.severity}/5)
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1">{inc.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono text-[10px] text-slate-400">
                      <div>{inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}</div>
                      <div className="text-slate-500">{new Date(inc.timestamp || inc.created_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
