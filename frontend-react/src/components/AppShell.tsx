import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onRefresh={onRefresh} isRefreshing={isRefreshing} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
