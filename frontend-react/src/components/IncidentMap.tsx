import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pattern, Incident } from "@/lib/api";

// Fix Leaflet's default marker icons in React/Vite builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface IncidentMapProps {
  patterns?: Pattern[];
  incidents?: Incident[];
  center?: [number, number];
  zoom?: number;
  selectedPatternId?: string | null;
  onSelectPattern?: (pattern: Pattern) => void;
  interactive?: boolean;
  onLocationPick?: (lat: number, lng: number) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  patterns = [],
  incidents = [],
  center = [12.9716, 77.5946], // Bangalore default
  zoom = 13,
  selectedPatternId,
  onSelectPattern,
  interactive = true,
  onLocationPick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: interactive,
      attributionControl: false,
    });

    // OpenStreetMap standard tiles (No API key required)
    L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Trigger invalidateSize to prevent partial tile rendering glitches
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    if (onLocationPick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationPick(lat, lng);

        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([lat, lng]);
        } else {
          pickerMarkerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              className: "custom-picker-pin",
              html: `<div style="background-color:#2563eb; width:14px; height:14px; border-radius:50%; border:2.5px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            }),
          }).addTo(map);
        }
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update patterns and incidents when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Render incidents
    incidents.forEach((inc) => {
      if (typeof inc.latitude === "number" && typeof inc.longitude === "number") {
        const marker = L.circleMarker([inc.latitude, inc.longitude], {
          radius: 5,
          fillColor: inc.severity >= 4 ? "#dc2626" : inc.severity >= 3 ? "#d97706" : "#2563eb",
          color: "#ffffff",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif; padding:4px; min-width:160px;">
            <div style="font-weight:600; font-size:12px; text-transform:capitalize; color:#0f172a; margin-bottom:2px;">
              ${inc.incident_type.replace('_', ' ')} (Sev: ${inc.severity}/5)
            </div>
            <div style="font-size:11px; color:#475569; margin-bottom:4px;">${inc.description || "No description"}</div>
            <div style="font-size:10px; color:#64748b; font-family:monospace;">
              Source: ${inc.reporter_type} • ${new Date(inc.timestamp || inc.created_at).toLocaleTimeString()}
            </div>
          </div>
        `);

        layerGroup.addLayer(marker);
        bounds.push([inc.latitude, inc.longitude]);
      }
    });

    // Render pattern clusters
    patterns.forEach((pat) => {
      if (typeof pat.latitude === "number" && typeof pat.longitude === "number") {
        const isSelected = selectedPatternId === pat.id;
        const color =
          pat.pattern_level === "CRITICAL"
            ? "#dc2626"
            : pat.pattern_level === "ESCALATING"
            ? "#ea580c"
            : pat.pattern_level === "CONCERNING"
            ? "#d97706"
            : "#2563eb";

        const circle = L.circle([pat.latitude, pat.longitude], {
          radius: pat.radius_meters || 150,
          color: color,
          weight: isSelected ? 2.5 : 1.5,
          fillColor: color,
          fillOpacity: isSelected ? 0.25 : 0.12,
          dashArray: pat.pattern_level === "CRITICAL" ? "4, 4" : undefined,
        });

        circle.on("click", () => {
          if (onSelectPattern) onSelectPattern(pat);
        });

        circle.bindPopup(`
          <div style="font-family:sans-serif; padding:6px; min-width:180px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight:600; font-size:12px; color:#0f172a;">${pat.title || `Cluster #${pat.cluster_id || 'Active'}`}</span>
              <span style="font-size:10px; font-weight:600; padding:1px 5px; border-radius:4px; background:${color}15; color:${color}; border:1px solid ${color}30;">
                ${pat.pattern_level}
              </span>
            </div>
            <div style="font-size:11px; color:#334155; margin-bottom:4px;">
              Risk Index: <b>${Math.round(pat.risk_score)}</b> / 100 • ${pat.incident_count} reports
            </div>
            <div style="font-size:10px; color:#64748b; line-height:1.3;">
              ${pat.explanation || "Multi-signal risk detected in this spatial envelope."}
            </div>
          </div>
        `);

        layerGroup.addLayer(circle);
        bounds.push([pat.latitude, pat.longitude]);
      }
    });

    if (bounds.length > 0 && patterns.length > 0) {
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 15 });
      } catch {
        // ignore bounds calculation error
      }
    }
  }, [patterns, incidents, selectedPatternId]);

  return (
    <div className="relative isolate w-full h-full min-h-[300px] rounded-lg overflow-hidden border border-slate-200 z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[10] flex flex-col gap-1 bg-white/95 backdrop-blur-xs p-2.5 rounded-md border border-slate-200 shadow-xs text-[10px] text-slate-600 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-600" />
          <span>Critical Hotspot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Concerning Hotspot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span>Individual Incident</span>
        </div>
      </div>
    </div>
  );
};
