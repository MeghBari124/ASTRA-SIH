import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Landing } from "@/pages/Landing";
import { CitizenReport } from "@/pages/CitizenReport";
import { SecurityMonitor } from "@/pages/SecurityMonitor";
import { AuthorityDashboard } from "@/pages/AuthorityDashboard";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/citizen" element={<CitizenReport />} />
            <Route path="/security" element={<SecurityMonitor />} />
            <Route path="/authority" element={<AuthorityDashboard />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
