import React from "react";

const STAGES = ["Assigned", "Picked Up", "Delivered"];

function stageIndex(status) {
  if (!status) return -1;
  return STAGES.indexOf(status);
}

export default function PulseRail({ status, compact }) {
  const idx = stageIndex(status);
  return (
    <div className="flex items-center w-full">
      {STAGES.map((stage, i) => {
        const reached = i <= idx;
        const active = i === idx;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative flex items-center justify-center">
                {active && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400/40 animate-ping" />
                )}
                <span
                  className={
                    "relative inline-flex h-2.5 w-2.5 rounded-full " +
                    (reached ? "bg-cyan-400" : "bg-slate-700")
                  }
                />
              </div>
              {!compact && (
                <span className={"text-[10px] uppercase tracking-wider " + (reached ? "text-slate-200" : "text-slate-600")}>
                  {stage}
                </span>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <div className={"h-px flex-1 mx-1.5 " + (i < idx ? "bg-cyan-400" : "bg-slate-700")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
