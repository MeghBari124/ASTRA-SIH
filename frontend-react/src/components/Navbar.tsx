import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Radio, Activity, FileText, LayoutDashboard, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/health")
      .then((res) => {
        if (res.ok) setServerOnline(true);
        else setServerOnline(false);
      })
      .catch(() => setServerOnline(false));

    const interval = setInterval(() => {
      fetch("/health")
        .then((res) => setServerOnline(res.ok))
        .catch(() => setServerOnline(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: Shield },
    { path: "/citizen", label: "Citizen Report", icon: FileText },
    { path: "/security", label: "Security Feed", icon: Radio },
    { path: "/authority", label: "Authority Command", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black tracking-wider text-white">ASTRA</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">v2.4</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-tight font-sans">Multi-Signal Women's Safety Engine</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status / Quick Links */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 text-xs font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                serverOnline === true
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
                  : serverOnline === false
                  ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-slate-400 text-[11px]">
              {serverOnline === true ? "SYSTEM ONLINE" : serverOnline === false ? "OFFLINE" : "CONNECTING"}
            </span>
          </div>

          <Link
            to="/authority"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            Dashboard
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </header>
  );
};
