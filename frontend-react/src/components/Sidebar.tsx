import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Video,
  FileText,
  Bell,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Radio,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { api } from "@/lib/api";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [alertCount, setAlertCount] = useState<number>(0);

const checkHealth = () => {
  fetch(`${import.meta.env.VITE_API_URL}/health`)
    .then((res) => setServerOnline(res.ok))
    .catch(() => setServerOnline(false));

      api.getAlerts()
        .then((alerts) => {
          const active = alerts.filter(
            (a) => a.status === "ACTIVE" || a.status === "NEW"
          ).length;
          setAlertCount(active);
        })
        .catch(() => {});
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/authority", label: "Authority Command", icon: Shield },
    { path: "/security", label: "Security & CCTV", icon: Video },
    { path: "/citizen", label: "Citizen Reports", icon: FileText },
    {
      path: "/alerts",
      label: "Live Alerts",
      icon: Bell,
      badge: alertCount > 0 ? alertCount : undefined,
    },
    { path: "/analytics", label: "Analytics & Trends", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                ASTRA
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                OPS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
              Safety Intelligence
            </p>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Operations Desk
          </span>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <Badge
                    variant="destructive"
                    className="h-4 min-w-4 px-1 text-[10px] flex items-center justify-center font-mono"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status & Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-slate-400" />
            Backend Grid
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                serverOnline === true
                  ? "bg-emerald-500"
                  : serverOnline === false
                  ? "bg-red-500"
                  : "bg-amber-500"
              }`}
            />
            <span className="text-[11px] font-medium text-slate-700">
              {serverOnline === true
                ? "Operational"
                : serverOnline === false
                ? "Offline"
                : "Connecting"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
          <span>Bangalore Metropolitan</span>
          <span className="font-mono text-[10px]">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
