import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
  EyeOff,
  UserCheck,
} from "lucide-react";
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
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const incidentCategories = [
    { id: "harassment", label: "Verbal Harassment / Catcalling" },
    { id: "stalking", label: "Stalking / Following" },
    { id: "poor_lighting", label: "Dark / Broken Streetlights" },
    { id: "unsafe_gathering", label: "Suspicious / Intimidating Group" },
    { id: "physical_assault", label: "Physical Assault / Threat" },
    { id: "isolated_area", label: "Isolated / Desolate Pathway" },
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
      description: description.trim() || `${incidentType.replace('_', ' ')} reported in area.`,
      latitude: Number(latitude),
      longitude: Number(longitude),
      reporter_type: isAnonymous ? "citizen_anonymous" : "citizen_verified",
      source: "citizen_web",
      severity: Number(severity),
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await api.createIncident(payload);
      setSuccessResult(res);
      api.refreshPatterns().catch(() => {});
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary">Citizen Reporting Portal</Badge>
          <span className="text-xs text-slate-500">Confidential & Encrypted</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Report an Unsafe Area or Incident
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your report immediately alerts civic authorities and updates real-time safety patterns for local patrols.
        </p>
      </div>

      {successResult ? (
        <Card className="max-w-2xl mx-auto my-8 border-emerald-200 bg-emerald-50/30">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-lg font-bold text-emerald-900">
              Report Successfully Registered
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Reference ID: <span className="font-mono text-slate-900 font-semibold">{successResult.id}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-900 font-medium capitalize">{successResult.incident_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Coordinates:</span>
                <span className="font-mono text-slate-800">{successResult.latitude}, {successResult.longitude}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Reported Severity:</span>
                <span className="font-semibold text-amber-600">Level {successResult.severity} / 5</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Cluster Status:</span>
                <span className="text-blue-600 font-medium">
                  {successResult.cluster_id !== null && successResult.cluster_id !== undefined
                    ? `Assigned to Hotspot #${successResult.cluster_id}`
                    : "Ingested for Cluster Evaluation"}
                </span>
              </div>
            </div>

            <Alert variant="info">
              <AlertTitle>Safety Pattern Updated</AlertTitle>
              <AlertDescription>
                This incident has been ingested into the spatio-temporal risk engine. Local patrol dispatches and monitoring units have been notified.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSuccessResult(null);
                setDescription("");
              }}
            >
              Submit Another Report
            </Button>
            <Link to="/authority">
              <Button>
                View Command Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader className="p-4 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold text-slate-900">Incident Details</CardTitle>
                  <CardDescription className="text-xs">
                    Please provide accurate location and incident description.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Submission Error</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {/* Incident Category */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">
                      Incident Category *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {incidentCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setIncidentType(cat.id)}
                          className={`p-2.5 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                            incidentType === cat.id
                              ? "border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-600"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Description & Details
                    </label>
                    <Textarea
                      placeholder="e.g. Group of individuals loitering near the poorly lit metro exit pathway..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Include notable details like recurring hours, specific location markers, or severity indicators.
                    </span>
                  </div>

                  {/* Severity Level */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Perceived Severity (1 to 5)
                      </label>
                      <span className="text-xs font-semibold text-amber-600">
                        Level {severity} {severity >= 4 ? "(Urgent / Threat)" : severity >= 3 ? "(Moderate Risk)" : "(Low Risk / Environmental)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSeverity(lvl)}
                          className={`flex-1 py-1.5 rounded-md font-mono text-xs font-semibold border transition-colors cursor-pointer ${
                            severity === lvl
                              ? lvl >= 4
                                ? "bg-red-600 border-red-600 text-white"
                                : lvl >= 3
                                ? "bg-amber-600 border-amber-600 text-white"
                                : "bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Privacy / Anonymous toggle */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Anonymous Submission
                      </div>
                      <div className="text-[11px] text-slate-500">
                        No personally identifiable metadata will be associated with this report.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isAnonymous ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ${
                          isAnonymous ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Coordinates & Presets */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Location Coordinates *
                      </label>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <LocateFixed className="h-3 w-3" />
                        Use My Current GPS
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <span className="text-[11px] text-slate-500">Latitude</span>
                        <Input
                          type="number"
                          step="0.0001"
                          value={latitude}
                          onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Longitude</span>
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
                      <span className="text-[11px] text-slate-500">Quick Presets:</span>
                      {presets.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setLatitude(p.lat);
                            setLongitude(p.lng);
                          }}
                          className="text-[11px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 text-sm font-medium"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Report...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Incident Report
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Map Preview (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="h-full flex flex-col">
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Location Pin Picker
                </CardTitle>
                <CardDescription className="text-xs">
                  Click directly on the map to set the exact incident position.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-[420px] relative">
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
