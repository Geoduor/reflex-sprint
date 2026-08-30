# Reflex — Frozen Design Document

**Owners:** Geofry, Mark
**Status:** Frozen as of Day 1 (no new features after this point — see AGENT.md)
**Scope:** Electronics retail shop

---

## 1. Problem Recap

Small electronics retailers coordinate deliveries over WhatsApp and phone calls, with no record of assignment, no status visibility, and no proof of delivery. Given the value and fraud risk of electronics specifically, this is a real business exposure, not just an inconvenience.

## 2. Personas & Core Flow

1. **Retailer staff** logs a delivery request (customer name, phone, address, item description, optional serial/IMEI).
2. **Dispatcher** sees open (unassigned) requests and assigns each to an available rider.
3. **Rider** sees their assigned deliveries and updates status: `Assigned → Picked Up → Delivered`, confirming delivery with a scan.

## 3. Architecture

### Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | React (web), PWA-installable for rider view | One codebase covers all three personas; PWA gives riders an app-like mobile experience without app-store distribution overhead |
| Backend | Node.js + Express, REST API | Fast to build, team-familiar, sufficient for this scope |
| Database | PostgreSQL | Relational fits our clearly-structured entities (requests, assignments, status history) |
| Real-time | WebSockets (Socket.IO) | Dispatcher and rider views update live without polling — required by the case study's real-time sync requirement |
| Confirmation | QR/barcode scan on pickup & delivery | Electronics carry fraud/loss risk; a scan is stronger proof than a manual button tap |
| Customer notification | SMS on status change (e.g. Africa's Talking) | Customers won't have the app; SMS is the accessible channel |

### Data Model

**User**
- id, name, phone, role (`retailer_staff` / `dispatcher` / `rider`)

**DeliveryRequest**
- id, retailer_id, customer_name, customer_phone, address, item_description, serial_number (optional), status, created_at

**Assignment**
- id, delivery_request_id, rider_id, assigned_by (dispatcher_id), assigned_at

**StatusEvent**
- id, delivery_request_id, status, timestamp, changed_by, confirmation_scan (optional)

*Why a separate `StatusEvent` table instead of just a status field on `DeliveryRequest`:* we need a full audit trail (proof of delivery), not just the current state. Every transition is logged, not overwritten.

### Assignment Logic
Manual: the dispatcher selects a rider from a list of available riders for each open request. No auto-assignment (nearest rider, load balancing) in v1 — see trade-offs.

**Concurrency handling:** If two dispatchers attempt to assign the same request at nearly the same time, this is resolved at the database level, not the frontend. The `Assignment` table has a unique constraint on `delivery_request_id` — only one assignment can ever exist per request. The first write succeeds; the second fails and that dispatcher sees an "already assigned" message rather than silently double-assigning a rider.

### Authentication & Account Creation
Accounts are pre-created (seeded) by an admin/shop owner — there is no self-signup in v1, since this is a single small shop with a known, fixed set of staff and riders. Login is via phone number + PIN, reusing the SMS infrastructure already required for customer notifications. This is intentionally simple and scoped to a single-shop deployment (see §5, Out of Scope: multi-tenant support).

**Status: implemented.** `POST /api/auth/login` authenticates against pre-seeded accounts (`src/config/seed.js`) using bcrypt-hashed PINs — the same generic error is returned for "no such user" and "wrong PIN" so the endpoint can't be used to enumerate valid phone numbers. The session token issued is intentionally minimal (a raw user id) for sprint scope — flagged in code as needing a real session/JWT scheme before any production use.

### Status Flow
Linear state machine: `Assigned → Picked Up → Delivered`.
- Each transition writes a new `StatusEvent` row.
- Only the assigned rider can update their own delivery's status — enforced server-side (not just hidden in the UI), so this can't be bypassed by editing the client.
- Delivery confirmation requires a successful scan match against the request's serial/IMEI where one was provided.
- **Failed or mismatched scan:** if the scan doesn't match the request's serial/IMEI, or the scan itself fails, the status does NOT advance to "Delivered." The rider can retry the scan, or escalate — flagging the delivery for dispatcher review with a required note explaining what happened. This keeps a human in the loop rather than letting the rider bypass confirmation by tapping through, which would defeat the purpose of scanning in the first place.

### What Happens Outside the App
- SMS to the customer on "Picked Up" and "Delivered."
- No integration with retailer POS/inventory systems in v1 — delivery requests are logged manually by staff, not auto-generated from a sale.

## 4. Known Trade-offs (summary — full log in `trade-off-log.md`)
1. Manual assignment, not automatic.
2. No offline mode for riders.
3. Single linear status flow — no failed/returned/cancelled path.
4. No handling/fragility instructions field.

## 5. Explicitly Out of Scope (v1)
- Inventory/stock availability checks.
- Full CRUD on historical delivery records (read-only history after creation, aside from status events).
- Auto-assignment / route optimization.
- Multi-retailer / multi-tenant support (v1 assumes a single shop).

## 6. Roadmap (post-v1)
- Auto-assignment based on rider proximity/load.
- Offline-first support for riders (queue status updates locally, sync when reconnected).
- Failed/returned/cancelled status branches.
- Handling/fragility notes on delivery requests.
- POS/inventory integration to auto-generate delivery requests from sales.
