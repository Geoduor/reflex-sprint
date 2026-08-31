import React from "react";

export default function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 py-10 text-center text-sm text-slate-600">
      {text}
    </div>
  );
}
