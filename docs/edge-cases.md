# Reflex — Edge Cases (docs/edge-cases.md)
Owner: Mark · Edge Cases defense
Reviewed against the current `frozen-design.md` (backend built and
smoke-tested by Geofry: login, request creation, assignment, pickup,
delivery confirmation incl. blocked mismatched scan — all verified against
a real database).

Concurrent assignment and mismatched-scan handling are already documented
and implemented per `frozen-design.md` — not repeated here. This file
covers cases beyond those.

No changes proposed to the frozen architecture, data model, or backend
code — this is stress-testing and defense prep only.

---

## 1. Rider's app crashes or loses connection mid status-update

- **State:** Not handled. If a rider taps a status transition and the
  connection drops after the request is sent but before a response comes
  back, the client has no way to know whether the write succeeded. The
  rider is left staring at a UI that may be stuck "updating," with no
  built-in way to safely check or resolve it.
- **Context:** The design has no idempotency key or request-tracking
  mechanism on status-update calls — each `POST` to the status endpoint is
  just a plain write. That's a reasonable simplification for sprint scope,
  but it means the client and server can end up with different beliefs
  about what happened.
- **Evidence:** `statusController.js` (per `PROJECT_STRUCTURE.md`) has no
  documented idempotency handling, and nothing in `frozen-design.md`
  mentions one. This is a known gap, not a tested-and-solved case.

## 2. Dispatcher assigns a request that no longer exists

- **State:** Likely handled, but for a reason we haven't verified end to
  end. `Assignment.delivery_request_id` is a foreign key into
  `DeliveryRequest`, so the database itself should reject an insert
  against a nonexistent request ID.
- **Context:** v1 explicitly has no delete/full-CRUD on delivery requests
  ("read-only history after creation" per §5 Out of Scope), so a request
  "disappearing" would only happen via a stale client view — a dispatcher
  looking at a list that hasn't refreshed. The FK constraint is the right
  backstop for that, in principle.
- **Evidence:** Not tested. We don't know whether `assignmentsController.js`
  catches that FK violation and returns a clean "request no longer
  available" message, or whether it surfaces as a raw 500 error. This is a
  concrete thing to actually run before the defense, not just reason about.

## 3. Same status transition submitted twice (double-tap or network retry)

- **State:** Not handled. Nothing in the design mentions deduplication on
  status-update requests. A double-tap, or a client automatically retrying
  after a slow response it assumed had failed, could write two
  `StatusEvent` rows for the same transition (e.g. two "Picked Up" events).
- **Context:** Because `StatusEvent` is an append-only audit log by design
  ("every transition is logged, not overwritten"), a duplicate write
  doesn't corrupt the current status — the delivery is still just "Picked
  Up." But it does pollute the audit trail we're relying on as proof of
  delivery, which matters more here than in a generic app given the
  fraud/dispute angle.
- **Evidence:** No idempotency key, request ID, or duplicate-detection
  logic is documented anywhere in `frozen-design.md` or
  `PROJECT_STRUCTURE.md`. Known gap.

## 4. Rider assigned two deliveries updates the wrong one

- **State:** Not handled at the backend level, and can't fully be — this
  is fundamentally a UX risk, not an authorization bug. The server checks
  "is this rider the one assigned to *this* delivery request ID?" — and if
  a rider has two active deliveries, they're the assigned rider on both,
  so a status update against the wrong (but still their own) request ID
  passes the server-side check cleanly.
- **Context:** The frozen design's server-side enforcement ("only the
  assigned rider can update their own delivery's status") protects against
  a rider touching someone else's delivery — it was never designed to
  protect against a rider mixing up two of their own. That's a reasonable
  scope boundary, but worth being explicit that it's a boundary, not an
  oversight.
- **Evidence:** Confirmed by re-reading the stated enforcement rule in
  `frozen-design.md` — it's scoped to ownership, not to which-of-my-own
  disambiguation. This is a case for Jane's UI to mitigate (e.g. showing
  item description prominently before confirming a status change), not a
  backend fix.

## 5. Unassigned request sits open indefinitely

- **State:** Not handled. There is no timeout, staleness flag, or
  escalation path in the design for a `DeliveryRequest` that stays
  unassigned. It waits forever unless a dispatcher happens to notice it.
- **Context:** This is a real operational risk given the shop's use case —
  a request that quietly sits unassigned is functionally the same failure
  mode Reflex was built to fix in the first place (a delivery nobody's
  tracking). It's a legitimate gap to name in defense rather than let a
  panelist find it first.
- **Evidence:** No mention of any timeout/alerting mechanism for open
  requests anywhere in `frozen-design.md`'s architecture, trade-offs, or
  roadmap sections. Explicitly undocumented — a genuine gap, not an
  oversight in this write-up.

## 6. Socket.IO client reconnects and misses an update

- **State:** Not handled, or at minimum unverified. Socket.IO does not
  replay missed events to a client that was disconnected and reconnects —
  by default, a dispatcher or rider who loses and regains connectivity
  would keep showing stale data until something (a manual refresh, or a
  deliberate "refetch full state on reconnect" step) corrects it.
- **Context:** Real-time sync is a stated requirement ("dispatcher and
  rider views update live... required by the case study's real-time sync
  requirement"), so a silent staleness gap here undercuts a requirement we
  specifically built infrastructure for. This sits across both backend
  (event design) and frontend (Jane's `client.js` / page components) —
  it's not purely one owner's fix.
- **Evidence:** Nothing in `frozen-design.md` describes a reconnect/resync
  strategy for Socket.IO clients. This needs a team decision: either the
  frontend does a full REST refetch on every reconnect (simplest, no
  backend change), or the backend adds some form of missed-event replay
  (more work, likely out of scope for this sprint).

---

## Summary for defense

| # | Case | Status |
|---|---|---|
| 1 | Rider app crash/lost connection mid-update | Known gap |
| 2 | Assign a request that no longer exists | Likely handled by FK constraint — unverified |
| 3 | Duplicate status submission (double-tap/retry) | Known gap |
| 4 | Rider updates the wrong of their two deliveries | Scope boundary — needs UX mitigation, not backend |
| 5 | Unassigned request sits open indefinitely | Known gap |
| 6 | Socket.IO reconnect misses an update | Known gap — needs team decision |
