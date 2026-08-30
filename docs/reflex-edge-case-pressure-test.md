# Reflex — Edge Case Pressure Test
Owner: Mark (Edge Cases) · Architecture co-owned with Geofry
No changes to frozen stack / data model / status flow — this stress-tests
the existing design and proposes handling within its existing schema.

---

## 1. Serial number mismatch at delivery

**What breaks:** The frozen design requires a scan match against the
request's serial/IMEI "where one was provided," but doesn't specify what
happens on a *mismatch*. Since the status flow is strictly linear
(`Assigned → Picked Up → Delivered`) with no failed/rejected branch, an
unhandled mismatch either silently blocks the transition with no record, or
lets a rider force through to `Delivered` anyway with no rejection path
coded — either way, a genuine mismatch (wrong item, swapped item, fraud
attempt) leaves no trace.

**Handling (no architecture change):** `StatusEvent` already has a
`confirmation_scan` field — use it. On a mismatch, write a `StatusEvent`
recording the failed scan attempt, but do not transition to `Delivered`;
the request stays at `Picked Up` and is flagged for dispatcher follow-up
(phone call to resolve). Uses existing schema, doesn't add a new terminal
status — stays inside the already-accepted trade-off that v1 has no
failed/returned/cancelled path; we're logging the anomaly, not building a
new state.

## 2. Two dispatchers assign the same request simultaneously

**What breaks:** Nothing in the design doc enforces atomicity on
assignment. Two dispatchers acting near-simultaneously could both succeed,
producing two `Assignment` rows for one `DeliveryRequest` — two riders both
believing it's theirs, risking a double dispatch or confused pickup.

**Handling:** Standard race condition, not an architecture gap — enforce
server-side with a DB-level unique constraint (one active assignment per
open request) or a transactional check-then-write ("is this request still
open? if not, reject"). First assignment wins; the second dispatcher gets
an immediate, clear rejection instead of a silent duplicate.

## 3. Rider goes offline mid-delivery with a high-value item

**What breaks:** No offline mode is an explicit, already-acknowledged
trade-off. If a rider loses signal after `Picked Up`, there's no way to
push a status update — the delivery sits silently, with no visibility for
dispatcher, retailer, or customer. For a phone or laptop, that silence is
exactly the window where loss or fraud is hardest to catch early.

**Handling/punt:** Full offline-first sync is already correctly scoped to
the roadmap — don't rebuild that live. The defensible v1 mitigation is
smaller: a staleness check. If a delivery sits at `Picked Up` past a
threshold (e.g. 2 hours) with no new `StatusEvent`, flag it in the
dispatcher view for manual follow-up. This is a monitoring layer on data
we already have (timestamps on `StatusEvent`), not new architecture — it
turns a silent indefinite hang into something surfaced within a bounded
time.
