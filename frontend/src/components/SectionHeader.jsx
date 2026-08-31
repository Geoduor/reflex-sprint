import React from "react";

export default function SectionHeader({ eyebrow, title, children }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400/80 mb-1">{eyebrow}</div>
        <h2 className="text-lg font-semibold text-slate-100 tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}
