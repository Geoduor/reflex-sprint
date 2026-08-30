import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScanLine, MessageSquareText, Phone, MapPin, Hash, ArrowLeft, AlertTriangle } from "lucide-react";
import { RIDERS } from "../../data/seed.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import PulseRail from "../../components/PulseRail.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ScanConfirmModal from "../../components/ScanConfirmModal.jsx";

function InfoRow({ icon, label, value, mono, highlight }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-600 mt-0.5">{icon}</span>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-slate-600">{label}</div>
        <div className={(mono ? "font-mono " : "") + (highlight ? "text-cyan-300" : "text-slate-300") + " text-sm"}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function DeliveryDetailPage({ requests, riderId, onScan, smsLog }) {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [modalMode, setModalMode] = useState(null); // null | 'pickup' | 'delivery'
  const [escalations, setEscalations] = useState([]);

  const active = requests.find((r) => r.id === requestId);
  const currentRider = RIDERS.find((r) => r.id === riderId);

  const backLink = (
    <button
      onClick={() => navigate("/rider")}
      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
    >
      <ArrowLeft size={13} /> Back to my deliveries
    </button>
  );

  if (!active) {
    return (
      <div className="space-y-4">
        {backLink}
        <EmptyState text="Delivery not found." />
      </div>
    );
  }

  function confirmScan() {
    const nextStatus = modalMode === "pickup" ? "Picked Up" : "Delivered";
    onScan(active.id, nextStatus, currentRider?.name ?? "Rider");
    setModalMode(null);
  }

  function escalateScan() {
    setEscalations((log) => [
      ...log,
      `Scan failed at ${modalMode} — flagged to dispatcher for manual review (${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}).`,
    ]);
    setModalMode(null);
  }

  return (
    <div className="space-y-6">
      {backLink}

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-base font-medium text-slate-100">{active.customer_name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{active.item_description}</div>
          </div>
          <StatusBadge status={active.status} />
        </div>

        <div className="mb-5">
          <PulseRail status={active.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-sm">
          <InfoRow icon={<Phone size={14} />} label="Phone" value={active.customer_phone} />
          <InfoRow icon={<MapPin size={14} />} label="Address" value={active.address} />
          {active.serial_number && (
            <InfoRow icon={<Hash size={14} />} label="Serial / IMEI" value={active.serial_number} mono highlight />
          )}
        </div>

        {active.serial_number && active.status !== "Delivered" && (
          <div className="text-[11px] text-slate-500 bg-slate-950/60 border border-slate-800 rounded-md px-3 py-2 mb-5">
            Check this serial/IMEI against the physical unit before confirming — this is a manual visual
            check, the scan below confirms the delivery event, not the serial itself.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {active.status === "Assigned" && (
            <button
              onClick={() => setModalMode("pickup")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium bg-cyan-400 hover:bg-cyan-300 text-slate-900 transition-colors"
            >
              <ScanLine size={16} /> Scan to confirm pickup
            </button>
          )}
          {active.status === "Picked Up" && (
            <button
              onClick={() => setModalMode("delivery")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium bg-emerald-400 hover:bg-emerald-300 text-slate-900 transition-colors"
            >
              <ScanLine size={16} /> Scan to confirm delivery
            </button>
          )}
        </div>

        {escalations.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {escalations.map((e, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2"
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {e}
              </div>
            ))}
          </div>
        )}

        {active.events.length > 0 && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="text-[11px] font-mono uppercase tracking-wide text-slate-600 mb-2">
              Status events (audit trail)
            </div>
            <div className="space-y-1.5">
              {active.events.map((ev, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-slate-600">{ev.timestamp}</span>
                  <span className="text-slate-300">{ev.status}</span>
                  <span className="text-slate-600">— {ev.changed_by}</span>
                  {ev.confirmation_scan && <ScanLine size={12} className="text-cyan-400" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {smsLog.length > 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide text-slate-500 mb-2">
            <MessageSquareText size={13} /> Simulated customer SMS (Africa's Talking)
          </div>
          <div className="space-y-1">
            {smsLog
              .slice(-4)
              .reverse()
              .map((s, i) => (
                <div key={i} className="text-xs text-slate-400 font-mono">
                  {s}
                </div>
              ))}
          </div>
        </div>
      )}

      <ScanConfirmModal
        open={modalMode !== null}
        mode={modalMode}
        itemLabel={active.item_description}
        onConfirm={confirmScan}
        onEscalate={escalateScan}
        onClose={() => setModalMode(null)}
      />
    </div>
  );
}
