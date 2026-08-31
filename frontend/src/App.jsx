import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { ClipboardList, UserCircle2, Smartphone, Radio, LogOut } from "lucide-react";
import { getCurrentUser, logout as apiLogout, getMyRequests, getOpenRequests, getMyDeliveries } from "./api/client.js";
import LoginPage from "./pages/auth/LoginPage.jsx";
import NewRequestPage from "./pages/retailer/NewRequestPage.jsx";
import AssignPage from "./pages/dispatcher/AssignPage.jsx";
import MyDeliveriesPage from "./pages/rider/MyDeliveriesPage.jsx";
import DeliveryDetailPage from "./pages/rider/DeliveryDetailPage.jsx";

// Maps each backend role to the route it should land on after login.
const ROLE_HOME = {
  retailer_staff: "/retailer",
  dispatcher: "/dispatcher",
  rider: "/rider",
};

const ROLES = [
  { path: "/retailer", label: "Retailer Staff", icon: ClipboardList, role: "retailer_staff" },
  { path: "/dispatcher", label: "Dispatcher", icon: UserCircle2, role: "dispatcher" },
  { path: "/rider", label: "Rider", icon: Smartphone, role: "rider" },
];

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [requests, setRequests] = useState([]);
  const [loadError, setLoadError] = useState(null);

  // Loads whatever list is relevant to the logged-in user's role.
  // NOTE: this is a simple "refetch after every action" approach, not
  // real-time sync via Socket.IO yet — see README for that swap-in step.
  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setLoadError(null);
      if (user.role === "retailer_staff") {
        setRequests(await getMyRequests());
      } else if (user.role === "dispatcher") {
        setRequests(await getOpenRequests());
      } else if (user.role === "rider") {
        setRequests(await getMyDeliveries());
      }
    } catch (err) {
      setLoadError(err.message);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setRequests([]);
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const homePath = ROLE_HOME[user.role] || "/retailer";

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
                  {user.name} · {user.role}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
                {ROLES.filter((r) => r.role === user.role).map((r) => {
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
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-800 p-2 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </header>

          {loadError && (
            <div className="mb-4 text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-md px-3 py-2">
              Couldn't load data: {loadError} — is the backend running on the URL in .env?
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to={homePath} replace />} />
            <Route
              path="/retailer"
              element={
                user.role === "retailer_staff" ? (
                  <NewRequestPage requests={requests} onCreated={refresh} />
                ) : (
                  <Navigate to={homePath} replace />
                )
              }
            />
            <Route
              path="/dispatcher"
              element={
                user.role === "dispatcher" ? (
                  <AssignPage requests={requests} onAssigned={refresh} />
                ) : (
                  <Navigate to={homePath} replace />
                )
              }
            />
            <Route
              path="/rider"
              element={
                user.role === "rider" ? (
                  <MyDeliveriesPage requests={requests} />
                ) : (
                  <Navigate to={homePath} replace />
                )
              }
            />
            <Route
              path="/rider/:requestId"
              element={
                user.role === "rider" ? (
                  <DeliveryDetailPage requests={requests} onUpdated={refresh} />
                ) : (
                  <Navigate to={homePath} replace />
                )
              }
            />
          </Routes>

          <footer className="mt-10 pt-4 border-t border-slate-900 text-[10px] font-mono text-slate-700">
            Connected to backend at {import.meta.env.VITE_API_URL || "http://localhost:4000/api"}
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}
