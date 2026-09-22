import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  RefreshCw,
  Plus,
  MapPin,
  Clock,
  User,
  Shield,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { api, DashboardSummary } from "@/lib/api";

interface TopBarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onRefresh, isRefreshing = false }) => {
  const [time, setTime] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Safety Operations Overview";
      case "/authority":
        return "Authority Command & Risk Intelligence";
      case "/security":
        return "Security & CCTV Stream";
      case "/citizen":
        return "Citizen Incident Reporting";
      case "/alerts":
        return "Operational Alerts Center";
      case "/analytics":
        return "Analytics & Risk Trends";
      default:
        return "Safety Operations Desk";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Location & Page context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 leading-tight">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span>Bangalore Metro Division</span>
            <span>•</span>
            <span className="font-mono text-slate-400">{time}</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 text-xs font-medium text-slate-700"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 text-slate-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        )}

        <Link to="/citizen">
          <Button size="sm" className="h-8 text-xs font-medium">
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Report
          </Button>
        </Link>

        {/* User Profile / Shift info */}
        <div className="pl-3 border-l border-slate-200 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
            CO
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">
              Duty Officer
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-none">
              Command Shift #1
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
