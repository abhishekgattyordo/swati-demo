/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import MarketingPage from "./components/MarketingPage";
import PortalHub from "./components/PortalHub";
import { StaffRole } from "./types";

export default function App() {
  const [activePortalRole, setActivePortalRole] = useState<StaffRole | null>(null);
  const [activeAppointmentsCount, setActiveAppointmentsCount] = useState(3);

  // Sync scheduled appointments count dynamically from the server status
  const fetchAppointmentsCount = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        if (data.appointments) {
          setActiveAppointmentsCount(data.appointments.filter((a: any) => a.status === "Scheduled").length);
        }
      }
    } catch (e) {
      console.error("Failed to sync metrics from active server backend, using fallback estimates", e);
    }
  };

  useEffect(() => {
    fetchAppointmentsCount();
  }, [activePortalRole]);

  // Handle direct appointment booking from public website
  const handleBookAppointment = async (payload: any) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Increment metrics counter instantly
        fetchAppointmentsCount();
        return true;
      }
    } catch (err) {
      console.error("Booking submission error:", err);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {activePortalRole ? (
        <PortalHub 
          initialRole={activePortalRole}
          onBackToWebsite={() => setActivePortalRole(null)} 
          onRefreshStats={fetchAppointmentsCount}
        />
      ) : (
        <MarketingPage 
          onLaunchPortal={(role: StaffRole) => setActivePortalRole(role)}
          onBookAppointment={handleBookAppointment}
          activeAppointmentsCount={activeAppointmentsCount}
        />
      )}
    </div>
  );
}
