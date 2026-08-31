import React, { useState, useEffect } from "react";
import { Package, ChevronRight } from "lucide-react";
import { assignRider, getRiders } from "../../api/client.js";
import SectionHeader from "../../components/SectionHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import DeliveryCard from "../../components/DeliveryCard.jsx";

export default function AssignPage({ requests, onAssigned }) {
  const [assigning, setAssigning] = useState(null);
  const [riders, setRiders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRiders()
      .then(setRiders)
      .catch((err) => setError(err.message));
  }, []);

  async function handleAssign(requestId, riderId) {
    setError(null);
    try {
      await assignRider(requestId, riderId);
      setAssigning(null);
      await onAssigned();
    } catch (err) {
      setError(err.message || "Failed to assign rider");
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Dispatcher" title="Open delivery requests" />

      {error && (
        <div className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-amber-300 mb-3">
          <Package size={15} /> Open requests ({requests.length})
        </div>
        <div className="space-y-2.5">
          {requests.map((r) => (
            <DeliveryCard key={r.id} request={r} showRail={false}>
              {assigning === r.id ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {riders.map((rider) => (
                    <button
                      key={rider.id}
                      onClick={() => handleAssign(r.id, rider.id)}
                      className="rounded-md border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 px-2.5 py-1 text-xs text-slate-300 transition-colors"
                    >
                      {rider.name}
                    </button>
                  ))}
                  {riders.length === 0 && (
                    <span className="text-[11px] text-slate-600">No riders available.</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAssigning(r.id)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Assign to rider <ChevronRight size={13} />
                </button>
              )}
            </DeliveryCard>
          ))}
          {requests.length === 0 && <EmptyState text="No open requests." />}
        </div>
      </div>
    </div>
  );
}
