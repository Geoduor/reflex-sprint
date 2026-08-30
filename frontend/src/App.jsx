import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { ClipboardList, UserCircle2, Smartphone, Radio } from "lucide-react";
import { seedRequests } from "./data/seed.js";
import { createDeliveryRequest, assignRider, logStatusEvent } from "./api/client.js";
import NewRequestPage from "./pages/retailer/NewRequestPage.jsx";
import AssignPage from "./pages/dispatcher/AssignPage.jsx";
import MyDeliveriesPage from "./pages/rider/MyDeliveriesPage.jsx";
import DeliveryDetailPage from "./pages/rider/DeliveryDetailPage.jsx";

const ROLES = [
  { path: "/retailer", label: "Retailer Staff", icon: ClipboardList },
  { path: "/dispatcher", label: "Dispatcher", icon: UserCircle2 },
  { path: "/rider", label: "Rider", icon: Smartphone },
];

export default function App() {
  const [requests, setRequests] = useState(seedRequests);
  const [riderId, setRiderId] = useState("rider-2");
  const [smsLog, setSmsLog] = useState([
    "→ +254 712 334 556: Your Samsung Galaxy S24 has been picked up and is on its way.",
  ]);

  function handleCreate(data) {
    setRequests((list) => createDeliveryRequest(list, data));
  }

  function handleAssign(requestId, riderId) {
    setRequests((list) => assignRider(list, requestId, riderId));
  }

  function handleScan(requestId, status, riderName) {
    setRequests((list) => logStatusEvent(list, requestId, status, riderName));
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      const msg =
        status === "Picked Up"
          ? `→ ${req.customer_phone}: Your ${req.item_description} has been picked up and is on its way.`
          : `→ ${req.customer_phone}: Your ${req.item_description} has been delivered. Thank you for shopping with us.`;
      setSmsLog((log) => [...log, msg]);
    }
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
        <div className="max-w-5xl mx-auto px-5 py-6">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-cyan-400 flex items-center justify-center">
                <Radio size={16} className="text-slate-900" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-slate-100">Reflex</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                  Delivery coordination — prototype
                </div>
              </div>
            </div>
            <nav className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <NavLink
                    key={r.path}
                    to={r.path}
                    className={({ isActive }) =>
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors " +
                      (isActive ? "bg-cyan-400 text-slate-900" : "text-slate-400 hover:text-slate-200")
                    }
                  >
                    <Icon size={13} /> {r.label}
                  </NavLink>
                );
              })}
            </nav>
          </header>

          <Routes>
            <Route path="/" element={<Navigate to="/retailer" replace />} />
            <Route path="/retailer" element={<NewRequestPage requests={requests} onCreate={handleCreate} />} />
            <Route path="/dispatcher" element={<AssignPage requests={requests} onAssign={handleAssign} />} />
            <Route
              path="/rider"
              element={<MyDeliveriesPage requests={requests} riderId={riderId} setRiderId={setRiderId} />}
            />
            <Route
              path="/rider/:requestId"
              element={<DeliveryDetailPage requests={requests} riderId={riderId} onScan={handleScan} smsLog={smsLog} />}
            />
          </Routes>

          <footer className="mt-10 pt-4 border-t border-slate-900 text-[10px] font-mono text-slate-700">
            Mock data layer — see src/api/client.js for the API swap points.
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}
