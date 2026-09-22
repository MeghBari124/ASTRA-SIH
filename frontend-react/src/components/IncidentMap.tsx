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

    // Dark carto tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

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
              html: `<div style="background-color:#3b82f6; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px #3b82f6;"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
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
          fillColor: inc.severity >= 4 ? "#ef4444" : inc.severity >= 3 ? "#f59e0b" : "#3b82f6",
          color: "#ffffff",
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8,
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <div style="font-weight:bold; font-size:12px; text-transform:uppercase; color:#f8fafc; margin-bottom:2px;">
              ${inc.incident_type} (Sev: ${inc.severity}/5)
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">${inc.description || "No description"}</div>
            <div style="font-size:10px; color:#64748b; font-family:monospace;">
              Source: ${inc.reporter_type} | ${new Date(inc.timestamp || inc.created_at).toLocaleTimeString()}
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
            ? "#ef4444"
            : pat.pattern_level === "ESCALATING"
            ? "#f43f5e"
            : pat.pattern_level === "CONCERNING"
            ? "#f59e0b"
            : "#3b82f6";

        const circle = L.circle([pat.latitude, pat.longitude], {
          radius: pat.radius_meters || 150,
          color: color,
          weight: isSelected ? 3 : 1.5,
          fillColor: color,
          fillOpacity: isSelected ? 0.35 : 0.18,
          dashArray: pat.pattern_level === "CRITICAL" ? "4, 4" : undefined,
        });

        circle.on("click", () => {
          if (onSelectPattern) onSelectPattern(pat);
        });

        circle.bindPopup(`
          <div style="font-family:sans-serif; padding:6px; min-width:180px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight:bold; font-size:12px; color:#f8fafc;">${pat.title || `Cluster #${pat.cluster_id || 'Active'}`}</span>
              <span style="font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; background:${color}33; color:${color}; border:1px solid ${color}66;">
                ${pat.pattern_level}
              </span>
            </div>
            <div style="font-size:11px; color:#cbd5e1; margin-bottom:6px;">
              Risk Score: <b>${Math.round(pat.risk_score)}</b>/100 | ${pat.incident_count} reports
            </div>
            <div style="font-size:10px; color:#94a3b8; line-height:1.3;">
              ${pat.explanation || "Multi-signal risk detected in this spatial-temporal envelope."}
            </div>
          </div>
        `);

        layerGroup.addLayer(circle);
        bounds.push([pat.latitude, pat.longitude]);
      }
    });

    if (bounds.length > 0 && patterns.length > 0) {
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
      } catch {
        // ignore bounds calculation error
      }
    }
  }, [patterns, incidents, selectedPatternId]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-white/10 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-white/10 text-[10px] font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
          <span>Critical Pattern</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
          <span>Concerning Pattern</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
          <span>Single Incident</span>
        </div>
      </div>
    </div>
  );
};
