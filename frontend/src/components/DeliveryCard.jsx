import React from "react";
import { Hash } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import PulseRail from "./PulseRail.jsx";

/**
 * Shared card for a single delivery request. Used in:
 * - NewRequestPage (staff's own request list)
 * - AssignPage (open + in-progress columns)
 * - MyDeliveriesPage (rider's job list, clickable)
 *
 * Pass `onClick` to make the whole card a button (e.g. rider tapping
 * through to DeliveryDetailPage). Pass `children` for page-specific
 * extras rendered between the header and the status rail (e.g.
 * dispatcher's "Assign to rider" controls, or the assigned rider's name).
 */
export default function DeliveryCard({ request, children, onClick, selected, showRail = true }) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={
        "w-full text-left rounded-lg border p-4 transition-colors " +
        (selected
          ? "border-cyan-400/50 bg-cyan-400/5"
          : "border-slate-800 bg-slate-900/40" + (onClick ? " hover:border-slate-700" : ""))
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-100">{request.customer_name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{request.item_description}</div>
          {request.serial_number && (
            <div className="text-[11px] font-mono text-slate-600 mt-1 flex items-center gap-1">
              <Hash size={11} /> {request.serial_number}
            </div>
          )}
        </div>
        <StatusBadge status={request.status} />
      </div>

      {children}

      {showRail && (
        <div className="mt-3">
          <PulseRail status={request.status} />
        </div>
      )}
    </Wrapper>
  );
}
