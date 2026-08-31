import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScanLine, Phone, MapPin, Hash, ArrowLeft, AlertTriangle } from "lucide-react";
import StatusBadge from "../../components/StatusBadge.jsx";
import PulseRail from "../../components/PulseRail.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ScanConfirmModal from "../../components/ScanConfirmModal.jsx";
import { markPickedUp, confirmDelivery, escalateScan } from "../../api/client.js";

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

export default function DeliveryDetailPage({ requests, onUpdated }) {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [modalMode, setModalMode] = useState(null); // null | 'pickup' | 'delivery'
  const [banner, setBanner] = useState(null); // { type: 'error'|'info', text }
  const [busy, setBusy] = useState(false);

  const active = requests.find((r) => String(r.id) === requestId);

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

  async function handleConfirm() {
    setBusy(true);
    setBanner(null);
    try {
      if (modalMode === "pickup") {
        await markPickedUp(active.id);
      } else {
        // Real scan value would come from a barcode scanner integration —
        // using the request's own serial_number here to simulate a
        // successful scan for demo purposes.
        await confirmDelivery(active.id, active.serial_number);
      }
      setModalMode(null);
      await onUpdated();
    } catch (err) {
      // A mismatched/failed scan is a deliberate backend behavior (409),
      // not an unexpected error — surface it plainly rather than crashing.
      setBanner({ type: "error", text: err.message });
      setModalMode(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleEscalate(note) {
    setBusy(true);
    try {
      await escalateScan(active.id, note || "Scan did not match — flagged by rider");
      setBanner({ type: "info", text: "Escalated to dispatcher for manual review." });
      setModalMode(null);
    } catch (err) {
      setBanner({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
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

        {banner && (
          <div
            className={
              "flex items-start gap-2 text-xs rounded-md px-3 py-2 mb-4 " +
              (banner.type === "error"
                ? "text-rose-300 bg-rose-400/10 border border-rose-400/20"
                : "text-amber-300 bg-amber-400/10 border border-amber-400/20")
            }
          >
            <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {banner.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {active.status === "Assigned" && (
            <button
              onClick={() => setModalMode("pickup")}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-900 transition-colors"
            >
              <ScanLine size={16} /> Scan to confirm pickup
            </button>
          )}
          {active.status === "Picked Up" && (
            <button
              onClick={() => setModalMode("delivery")}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-900 transition-colors"
            >
              <ScanLine size={16} /> Scan to confirm delivery
            </button>
          )}
        </div>
      </div>

      <ScanConfirmModal
        open={modalMode !== null}
        mode={modalMode}
        itemLabel={active.item_description}
        onConfirm={handleConfirm}
        onEscalate={() => handleEscalate()}
        onClose={() => setModalMode(null)}
      />
    </div>
  );
}
