import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { createDeliveryRequest } from "../../api/client.js";
import SectionHeader from "../../components/SectionHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import DeliveryCard from "../../components/DeliveryCard.jsx";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-mono uppercase tracking-wide text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function NewRequestPage({ requests, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    address: "",
    item_description: "",
    serial_number: "",
  });

  async function submit(e) {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone || !form.address || !form.item_description) return;
    setSubmitting(true);
    setError(null);
    try {
      await createDeliveryRequest(form);
      setForm({ customer_name: "", customer_phone: "", address: "", item_description: "", serial_number: "" });
      setShowForm(false);
      await onCreated(); // refresh the list from the server
    } catch (err) {
      setError(err.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Retailer Staff" title="Log a delivery">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-300 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Log delivery"}
        </button>
      </SectionHeader>

      {showForm && (
        <form onSubmit={submit} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Customer name">
              <input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                placeholder="Wanjiku Kamau"
              />
            </Field>
            <Field label="Customer phone">
              <input
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                placeholder="+254 7XX XXX XXX"
              />
            </Field>
          </div>
          <Field label="Delivery address">
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
              placeholder="Kilimani, off Argwings Kodhek Rd"
            />
          </Field>
          <Field label="Item description">
            <input
              value={form.item_description}
              onChange={(e) => setForm({ ...form, item_description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
              placeholder="iPhone 15 Pro, 128GB"
            />
          </Field>
          <Field label="Serial / IMEI (optional)">
            <input
              value={form.serial_number}
              onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm font-mono text-slate-100 outline-none focus:border-cyan-400"
              placeholder="IMEI / serial, if applicable"
            />
          </Field>
          {error && <div className="text-xs text-rose-400">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-300 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      )}

      <div className="space-y-2.5">
        {requests.map((r) => (
          <DeliveryCard key={r.id} request={r} />
        ))}
        {requests.length === 0 && <EmptyState text="No delivery requests logged yet." />}
      </div>
    </div>
  );
}
