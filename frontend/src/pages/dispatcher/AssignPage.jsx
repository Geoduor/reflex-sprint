import React, { useState } from "react";
import { Package, Truck, ChevronRight } from "lucide-react";
import { RIDERS } from "../../data/seed.js";
import SectionHeader from "../../components/SectionHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import DeliveryCard from "../../components/DeliveryCard.jsx";

export default function AssignPage({ requests, onAssign }) {
  const open = requests.filter((r) => !r.assignment);
  const inProgress = requests.filter((r) => r.assignment && r.status !== "Delivered");
  const [assigning, setAssigning] = useState(null);

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Dispatcher" title="Live delivery board" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-amber-300 mb-3">
            <Package size={15} /> Open requests ({open.length})
          </div>
          <div className="space-y-2.5">
            {open.map((r) => (
              <DeliveryCard key={r.id} request={r} showRail={false}>
                {assigning === r.id ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {RIDERS.map((rider) => (
                      <button
                        key={rider.id}
                        onClick={() => {
                          onAssign(r.id, rider.id);
                          setAssigning(null);
                        }}
                        className="rounded-md border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 px-2.5 py-1 text-xs text-slate-300 transition-colors"
                      >
                        {rider.name}
                      </button>
                    ))}
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
            {open.length === 0 && <EmptyState text="No open requests." />}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-300 mb-3">
            <Truck size={15} /> In progress ({inProgress.length})
          </div>
          <div className="space-y-2.5">
            {inProgress.map((r) => {
              const rider = RIDERS.find((x) => x.id === r.assignment.rider_id);
              return (
                <DeliveryCard key={r.id} request={r}>
                  <div className="text-[11px] text-slate-600 mb-2.5 mt-2">Rider: {rider?.name}</div>
                </DeliveryCard>
              );
            })}
            {inProgress.length === 0 && <EmptyState text="Nothing in progress." />}
          </div>
        </div>
      </div>
    </div>
  );
}
