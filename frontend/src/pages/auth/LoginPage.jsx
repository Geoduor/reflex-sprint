import React, { useState } from "react";
import { login } from "../../api/client.js";

export default function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(phone, pin);
      onLogin(user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div>
          <div className="text-sm font-semibold text-slate-100">Reflex</div>
          <div className="text-xs text-slate-500 mt-1">Sign in with your phone and PIN</div>
        </div>

        <label className="block">
          <span className="block text-[11px] font-mono uppercase tracking-wide text-slate-500 mb-1">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
            placeholder="0700000001"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] font-mono uppercase tracking-wide text-slate-500 mb-1">PIN</span>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
            placeholder="1234"
          />
        </label>

        {error && <div className="text-xs text-rose-400">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-900 text-sm font-medium py-2.5 transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-[10px] text-slate-600 font-mono">
          Test accounts from seed.js: 0700000001 (staff) · 0700000002 (dispatcher) · 0700000003 (rider) — PIN 1234
        </div>
      </form>
    </div>
  );
}
