import React from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/EmptyState.jsx";
import DeliveryCard from "../../components/DeliveryCard.jsx";
import SectionHeader from "../../components/SectionHeader.jsx";

// Note: the rider-switcher dropdown from the mock build is gone — the
// rider is now whoever is actually logged in (see App.jsx / client.js
// session), not a UI toggle. `requests` here is already scoped to the
// current rider by the backend (GET /api/assignments/mine).
export default function MyDeliveriesPage({ requests }) {
  const navigate = useNavigate();
  const mine = requests.filter((r) => r.status !== "Delivered");

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Rider" title="My deliveries" />
      <div className="space-y-2.5">
        {mine.map((r) => (
          <DeliveryCard key={r.id} request={r} onClick={() => navigate(`/rider/${r.id}`)} />
        ))}
        {mine.length === 0 && <EmptyState text="No active deliveries assigned to you." />}
      </div>
    </div>
  );
}
