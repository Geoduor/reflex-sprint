# Reflex — Edge Case Defense Prep (State → Context → Evidence)
Owner: Mark (Edge Cases)
5 prepared answers, 2+ electronics-specific, honest about what's untested.

---

## Q1. What happens if the scanned serial number doesn't match the request?
*(electronics/fraud)*

- **State:** The delivery does not transition to `Delivered`. The mismatch
  is logged as a `StatusEvent` with a failed `confirmation_scan`, and the
  request is flagged for dispatcher follow-up.
- **Context:** We chose to log-and-flag rather than auto-reject or
  auto-escalate, because v1 has no failed/returned status branch — adding
  one now would be scope creep on a frozen design. A logged anomaly plus
  human follow-up is the minimum viable safety net.
- **Evidence:** Not built or tested yet — this is a design decision, not a
  measured outcome. To validate it, we'd run a deliberate mismatch scenario
  in a test environment and confirm the `StatusEvent` is written correctly
  and the dispatcher view surfaces it.

## Q2. How do you stop two dispatchers double-assigning the same request?

- **State:** Assignment is enforced atomically server-side — the first
  successful assignment closes the request to further assignment; a second
  attempt gets a clear rejection, not a silent duplicate.
- **Context:** Not explicit in the original design doc; it's a correctness
  detail underneath the already-stated rule that server-side enforcement
  (not client-side) governs status changes.
- **Evidence:** Not yet tested under real concurrent load — we'd want a
  simple test hitting the assign endpoint twice near-simultaneously and
  confirming exactly one succeeds.

## Q3. What happens if a rider goes offline with a high-value item mid-delivery?
*(electronics-specific, loss risk)*

- **State:** We don't solve this with offline sync in v1 — that's an
  acknowledged, deliberate gap. Deliveries stuck at `Picked Up` past a set
  time threshold get flagged for dispatcher follow-up instead.
- **Context:** Building real offline-first sync (local queue, conflict
  resolution on reconnect) is a meaningfully larger effort than this
  sprint's scope justifies. A staleness alert is a proportionate interim
  control given the grading is on defensible trade-offs, not full coverage.
- **Evidence:** No field data — we haven't run a scenario with simulated
  signal loss. To validate: pull a rider's connectivity mid-flow in a
  staging environment, confirm the staleness flag fires at the threshold,
  and confirm the dispatcher view surfaces it correctly.

## Q4. How do you know scan-based confirmation actually reduces fraud, rather than just adding friction?
*(electronics-specific, fraud)*

- **State:** We don't have evidence it reduces fraud — that's an untested
  assumption grounded in the reasoning that a scan is harder to falsify
  than a manual "delivered" button tap.
- **Context:** Electronics carry real fraud risk (wrong recipient claiming
  an item, staged loss claims), and a serial/IMEI scan gives a concrete,
  checkable artifact that a tap doesn't. But this is a design hypothesis,
  not a validated result.
- **Evidence:** None collected. To actually test this: either historical
  dispute/loss data from the retailer's WhatsApp-era process as a baseline,
  or a pilot period comparing dispute rates before and after Reflex —
  neither exists yet.

## Q5. What stops a rider from marking a delivery complete without actually scanning, or scanning early?

- **State:** The scan match is a server-side precondition for the
  `Delivered` transition — a client can't POST a status change without a
  corresponding successful scan event, because that check lives on the
  backend, not the UI.
- **Context:** Follows directly from the existing design principle that
  status changes are enforced server-side "so this can't be bypassed by
  editing the client" — applying the same principle to the scan
  requirement specifically.
- **Evidence:** Not tested. Verifying this would mean attempting to call
  the delivery-confirmation endpoint directly (bypassing the UI) without a
  valid scan payload, and confirming the server rejects it.
