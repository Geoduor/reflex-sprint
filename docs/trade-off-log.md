# Trade-off Log — Reflex

| # | Trade-off | Why we accepted it | What we'd do with more time |
|---|---|---|---|
| 1 | Manual assignment, not automatic | Simpler to build for v1; a small rider pool doesn't need automated logic yet | Add auto-assignment (nearest rider, load balancing) as the roadmap describes |
| 2 | No offline mode | Out of scope for v1; real-time sync via WebSockets was prioritized over handling connectivity loss | Add local caching/queued status updates on the rider app so a dropped connection doesn't block a delivery update |
| 3 | Single linear status flow (Assigned → Picked Up → Delivered) | Keeps the state machine simple and the audit trail (StatusEvent) easy to reason about for v1 | Extend the state machine to handle failed, returned, or cancelled deliveries, each with its own StatusEvent type |
| 4 | No fragility/handling-notes field | Acceptable for v1 scope; the core delivery record (item description, serial number) was prioritized first | Add a handling-notes field on DeliveryRequest (e.g., "screen may be cracked, handle with care") for fragile electronics |

## Flagged for team discussion (not yet in the log — need input before adding)
1. Serial number field is optional and unvalidated — worth deciding if v1 should require it, given the stated proof-of-authenticity purpose.
2. No stated rider vetting/trust mechanism for high-value items, despite fraud being a named risk.
3. Scan hardware/method for confirmation scanning isn't specified — could come up in cross-exam.
