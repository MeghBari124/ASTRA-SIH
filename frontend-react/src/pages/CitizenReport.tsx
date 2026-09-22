import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, MapPin, Send, CheckCircle2, AlertCircle, Sparkles, LocateFixed, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { IncidentMap } from "@/components/IncidentMap";
import { api, IncidentCreateInput } from "@/lib/api";

export const CitizenReport: React.FC = () => {
  const [incidentType, setIncidentType] = useState<string>("harassment");
  const [description, setDescription] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [severity, setSeverity] = useState<number>(3);
  const [reporterType, setReporterType] = useState<string>("citizen");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const incidentCategories = [
    { id: "harassment", label: "Verbal Harassment / Catcalling", icon: "🗣️" },
    { id: "stalking", label: "Stalking / Following", icon: "👥" },
    { id: "poor_lighting", label: "Dark / Broken Streetlights", icon: "💡" },
    { id: "unsafe_gathering", label: "Suspicious / Intimidating Group", icon: "⚠️" },
    { id: "physical_assault", label: "Physical Assault / Threat", icon: "🚨" },
    { id: "isolated_area", label: "Isolated / Desolate Pathway", icon: "🚧" },
  ];

  const presets = [
    { label: "MG Road Metro", lat: 12.9756, lng: 77.6066 },
    { label: "Indiranagar 100ft Rd", lat: 12.9784, lng: 77.6408 },
    { label: "Koramangala 5th Block", lat: 12.9352, lng: 77.6245 },
    { label: "Majestic Bus Terminus", lat: 12.9774, lng: 77.5708 },
  ];

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
        },
        () => {
          setErrorMessage("Location access was denied. You can pick directly on the map.");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: IncidentCreateInput = {
      incident_type: incidentType,
      description: description.trim() || `${incidentType.replace('_', ' ')} observed at location.`,
      latitude: Number(latitude),
      longitude: Number(longitude),
      reporter_type: reporterType,
      source: "citizen_web",
      severity: Number(severity),
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await api.createIncident(payload);
      setSuccessResult(res);
      // Also trigger pattern recalculation in backend
      api.refreshPatterns().catch(() => {});
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="watch">CITIZEN SAFETY PORTAL</Badge>
          <span className="text-xs font-mono text-slate-500">256-bit Encrypted Transmission</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Report a Women Safety Incident or Unsafe Area
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your report directly feeds into ASTRA's real-time pattern clustering engine. Reports are anonymized to protect reporter privacy.
        </p>
      </div>

      {successResult ? (
        <Card className="border-emerald-500/40 bg-emerald-950/20 max-w-2xl mx-auto my-8">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <CardTitle className="text-emerald-300 text-xl font-bold">
              Incident Successfully Registered
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              Incident ID: <span className="font-mono text-white">{successResult.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-black/40 rounded-lg border border-white/10 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-white capitalize">{successResult.incident_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-white">{successResult.latitude}, {successResult.longitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Severity Level:</span>
                <span className="text-amber-400 font-bold">{successResult.severity} / 5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DBSCAN Cluster Assignment:</span>
                <span className="text-blue-400 font-bold">
                  {successResult.cluster_id !== null && successResult.cluster_id !== undefined
                    ? `Cluster #${successResult.cluster_id}`
                    : "Ingested for Cluster Evaluation"}
                </span>
              </div>
            </div>

            <Alert variant="info">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Live AI Pattern Updated</AlertTitle>
              <AlertDescription>
                ASTRA's 6-pillar composite risk engine has processed this signal and updated spatial-temporal hotspot zones for local patrols.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex gap-3 justify-center">
            <Button
              variant="default"
              onClick={() => {
                setSuccessResult(null);
                setDescription("");
              }}
            >
              Submit Another Report
            </Button>
            <Link to="/authority">
              <Button variant="cyber">
                View on Command Center
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="border-white/15 bg-slate-950/80">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-base text-white">Incident Details</CardTitle>
                  <CardDescription>
                    Select the safety concern category and describe the situation.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Submission Error</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {/* Incident Category Selector */}
                  <div>
                    <label className="text-xs font-mono text-slate-300 font-semibold mb-2 block">
                      Incident Category *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {incidentCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setIncidentType(cat.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all text-xs flex flex-col justify-between gap-1.5 cursor-pointer ${
                            incidentType === cat.id
                              ? "border-blue-500 bg-blue-950/60 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.25)]"
                              : "border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20 hover:bg-slate-900"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="font-medium text-[11px] leading-tight">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-mono text-slate-300 font-semibold mb-1.5 block">
                      Description / Behavior Markers
                    </label>
                    <Textarea
                      placeholder="e.g. Group of men following pedestrians along the dark footpath near metro exit..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Include details like number of individuals, recurring times, or specific behavior patterns.
                    </span>
                  </div>

                  {/* Severity Level */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-mono text-slate-300 font-semibold">
                        Threat / Severity Level (1 to 5)
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Level {severity} {severity >= 4 ? "(Urgent Danger)" : severity >= 3 ? "(Moderate Risk)" : "(Low Risk/Environmental)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSeverity(lvl)}
                          className={`flex-1 py-2 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer ${
                            severity === lvl
                              ? lvl >= 4
                                ? "bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                : lvl >= 3
                                ? "bg-amber-600 border-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                                : "bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                              : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coordinates & Quick Presets */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-mono text-slate-300 font-semibold">
                        Location Coordinates *
                      </label>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        <LocateFixed className="h-3 w-3" />
                        Use GPS Location
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">Latitude</span>
                        <Input
                          type="number"
                          step="0.0001"
                          value={latitude}
                          onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">Longitude</span>
                        <Input
                          type="number"
                          step="0.0001"
                          value={longitude}
                          onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-slate-500">Quick Hotspots:</span>
                      {presets.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setLatitude(p.lat);
                            setLongitude(p.lng);
                          }}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10 hover:border-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-white/5 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Ingesting and Clustering Incident...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Verified Incident Report
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right Map Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="h-full flex flex-col border-white/15 bg-slate-950/80">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Interactive Location Pin</span>
                  <Badge variant="outline" className="text-[10px]">Click map to set pin</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Click anywhere on the map to pinpoint exact location.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 min-h-[380px]">
                <IncidentMap
                  center={[latitude, longitude]}
                  zoom={14}
                  onLocationPick={(lat, lng) => {
                    setLatitude(parseFloat(lat.toFixed(5)));
                    setLongitude(parseFloat(lng.toFixed(5)));
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
