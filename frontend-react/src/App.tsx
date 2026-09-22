import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Overview } from "@/pages/Overview";
import { AuthorityDashboard } from "@/pages/AuthorityDashboard";
import { SecurityMonitor } from "@/pages/SecurityMonitor";
import { CitizenReport } from "@/pages/CitizenReport";
import { Alerts } from "@/pages/Alerts";
import { Analytics } from "@/pages/Analytics";

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/authority" element={<AuthorityDashboard />} />
          <Route path="/security" element={<SecurityMonitor />} />
          <Route path="/citizen" element={<CitizenReport />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Overview />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
