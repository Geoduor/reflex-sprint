# AGENT.md — Reflex (The Readiness Sprint)

This file gives any AI assistant (Claude, etc.) the context it needs to help a team member on this project. Paste this whole file into a new chat before asking for help, or upload it as a project file.

## What we're building

**Reflex** — a delivery-coordination system for small Kenyan retailers. **Our team has chosen to scope this specifically to an electronics retail shop** (phones, laptops, TVs, accessories) rather than treat it generically. Today this shop coordinates deliveries over WhatsApp/phone calls with no record of assignment, no status visibility, no proof of delivery.

### Why electronics specifically (use this in the Problem slide)
- Higher item value than a generic retailer → higher stakes if a delivery is lost, swapped, or fraudulently claimed.
- Customers expect real tracking when spending significant money — this is what justifies real-time sync as a requirement, not a nice-to-have.
- Electronics are a common target for delivery fraud (someone other than the customer claiming the item), which is the direct justification for scan-based delivery confirmation.
- Items often have a serial number / IMEI, which gives us a natural, concrete field for proof-of-authenticity — a good "why this field?" answer in the architecture defense.

Reflex lets:
1. **Retailer staff** log a delivery request (customer name, phone, address, item description)
2. **Dispatcher** see open requests and assign each to a rider
3. **Rider** see assigned deliveries and update status: `Assigned → Picked Up → Delivered`

It also needs to support real-time syncing (dispatcher/rider see new requests/assignments live) and scanning for order confirmation at pickup/delivery.

## Important context: this is NOT a "build the best app" assignment

We are graded on whether we can **design a system, explain it clearly, and defend it live under cross-examination** — not on shipping polished code. Every decision must be justifiable out loud. Simplifications are fine and expected, as long as we know what we simplified and why.

## Current architecture decisions (draft — confirm before extending)

- **Frontend:** React (or React Native / PWA for the rider mobile view)
- **Backend:** Node.js + Express, REST API
- **Database:** PostgreSQL
- **Real-time:** WebSockets (Socket.IO or similar) for live request/assignment updates
- **Confirmation scanning:** QR/barcode scan on pickup and delivery, logged against the delivery record
- **SMS to customer:** on "Picked Up" and "Delivered" status changes (e.g. via Africa's Talking)

### Data model (core entities)
- `User` — id, name, phone, role (`retailer_staff` / `dispatcher` / `rider`)
- `DeliveryRequest` — id, retailer_id, customer_name, customer_phone, address, item_description, **serial_number (optional — phone/laptop/TV IMEI or serial, for proof of authenticity)**, status, created_at
- `Assignment` — id, delivery_request_id, rider_id, assigned_by, assigned_at
- `StatusEvent` — id, delivery_request_id, status, timestamp, changed_by, confirmation_scan

### Status flow
Linear state machine: `Assigned → Picked Up → Delivered`. Each transition writes a `StatusEvent` row — this is our audit trail / proof-of-delivery. Only the assigned rider can update their own delivery's status (enforced server-side).

### Assignment logic
Manual for v1 — dispatcher picks a rider from a list. Auto-assignment (nearest rider, load balancing) is a roadmap item, not a v1 requirement.

## Known trade-offs (do not silently "fix" these — they are intentional talking points)
1. Manual assignment, not automatic — simpler to build, doesn't scale past a small rider pool.
2. No offline mode — a rider losing signal mid-delivery is a real risk; not handled in v1.
3. Single linear status flow — no handling for failed/returned/cancelled deliveries yet.
4. No special handling/fragility instructions field — electronics can be fragile, but v1 doesn't model handling notes (e.g. "screen may be cracked, handle with care"). Acceptable for v1 scope; flagged as a roadmap item.

If you think of more trade-offs while working, flag them — don't just quietly patch them, since the trade-off log is a graded deliverable.

## Team & roles

| Person | Owns |
|---|---|
| Geofry (lead) | Architecture & system design (with Mark), Architecture slide, fields Architecture questions |
| Mark | Architecture & system design (with Geofry), Edge cases prep |
| Faith | Narrative structure, trade-off log, Problem + Trade-offs slides |
| Jane | UX/solution flow, demo script, Solution + Roadmap slides |

## Deliverables checklist (whole team)
- [ ] Frozen design doc
- [ ] Deck: Problem → Solution → Architecture → Trade-offs → Roadmap (one takeaway per slide)
- [ ] One-page trade-off log (3+ weak points, each with "acceptable because...")
- [ ] Demo script
- [ ] Timing log from 2+ dry runs

## Ground rules for AI assistance on this project
- Don't invent architecture decisions that contradict the ones above — if you want to propose an alternative, flag it as a proposal, not a silent change.
- Don't fabricate data, user research, or "results" that didn't happen — if something is unknown, say so.
- Keep output scoped to the section the person asking owns (see table above) unless they say otherwise.
- This is a design/communication exercise, not a coding exercise — prioritize clarity and defensibility over cleverness.
