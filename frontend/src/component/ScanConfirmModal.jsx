import React, { useState } from "react";
import { ScanLine, Radio, X, AlertTriangle, RotateCcw, Flag } from "lucide-react";

/**
 * Handles the pickup/delivery scan confirmation flow, including a
 * failed-scan path.
 *
 * NOTE: the failed-scan → escalate flow below is a placeholder best
 * guess, not a confirmed design. Whether a failed scan should
 * auto-retry, require a manual override code, or notify the
 * dispatcher a specific way is properly Mark's call as part of
 * docs/edge-cases.md — flag this component for his review before
 * treating it as final.
 */
export default function ScanConfirmModal({ open, mode, itemLabel, onConfirm, onEscalate, onClose }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | failed
  const [simulateFailure, setSimulateFailure] = useState(false);

  if (!open) return null;

  const label = mode === "pickup" ? "pickup" : "delivery";

  function runScan() {
    setPhase("scanning");
    setTimeout(() => {
      if (simulateFailure) {
        setPhase("failed");
      } else {
        onConfirm();
      }
    }, 700);
  }

  function retry() {
    setSimulateFailure(false);
    setPhase("idle");
  }

  function escalate() {
    onEscalate();
    setPhase("idle");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400/80 mb-1">
              Confirm {label}
            </div>
            <div className="text-sm text-slate-300">{itemLabel}</div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        {phase === "idle" && (
          <>
            <div className="rounded-md border border-dashed border-slate-700 py-10 text-center text-slate-600 mb-4">
              <ScanLine size={28} className="mx-auto mb-2" />
              <div className="text-xs">Point the scanner at the barcode</div>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-500 mb-4">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
              />
              Simulate a failed scan (demo only)
            </label>
            <button
              onClick={runScan}
              className="w-full rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-900 text-sm font-medium py-2.5 transition-colors"
            >
              Scan
            </button>
          </>
        )}

        {phase === "scanning" && (
          <div className="py-10 text-center text-slate-400">
            <Radio size={28} className="mx-auto mb-2 animate-pulse text-cyan-400" />
            <div className="text-xs">Scanning…</div>
          </div>
        )}

        {phase === "failed" && (
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-sm mb-3">
              <AlertTriangle size={16} /> Scan didn't go through
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Placeholder escalation path — confirm the real retry/backoff and
              dispatcher-notification behavior against docs/edge-cases.md.
            </p>
            <div className="flex gap-2">
              <button
                onClick={retry}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-700 hover:border-cyan-400 text-slate-300 text-xs font-medium py-2 transition-colors"
              >
                <RotateCcw size={13} /> Retry scan
              </button>
              <button
                onClick={escalate}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-medium py-2 transition-colors"
              >
                <Flag size={13} /> Flag to dispatcher
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
