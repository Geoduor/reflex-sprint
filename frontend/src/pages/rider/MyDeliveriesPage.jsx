import React from "react";
import { useNavigate } from "react-router-dom";
import { RIDERS } from "../../data/seed.js";
import SectionHeader from "../../components/SectionHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import DeliveryCard from "../../components/DeliveryCard.jsx";

export default function MyDeliveriesPage({ requests, riderId, setRiderId }) {
  const navigate = useNavigate();
  const mine = requests.filter((r) => r.assignment?.rider_id === riderId && r.status !== "Delivered");
  const currentRider = RIDERS.find((r) => r.id === riderId);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Rider" title="My deliveries">
        <select
          value={riderId}
          onChange={(e) => setRiderId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400"
        >
          {RIDERS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </SectionHeader>

      <div className="space-y-2.5">
        {mine.map((r) => (
          <DeliveryCard key={r.id} request={r} onClick={() => navigate(`/rider/${r.id}`)} />
        ))}
        {mine.length === 0 && <EmptyState text={`No active deliveries for ${currentRider?.name}.`} />}
      </div>
    </div>
  );
}
