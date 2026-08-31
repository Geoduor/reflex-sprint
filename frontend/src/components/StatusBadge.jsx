import React from "react";
import { Circle } from "lucide-react";

export default function StatusBadge({ status }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide text-amber-300">
        <Circle size={8} className="fill-amber-400 text-amber-400" /> Unassigned
      </span>
    );
  }
  const styles = {
    Assigned: "border-slate-400/30 bg-slate-400/10 text-slate-300",
    "Picked Up": "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    Delivered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  };
  return (
    <span className={"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide " + styles[status]}>
      <Circle size={8} className="fill-current" /> {status}
    </span>
  );
}
