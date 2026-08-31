/* ============================================================
   API CLIENT
   Wraps calls to the real backend (see backend/src/routes/).
   Still mock/local-state for now — every write below operates
   on the `list` passed in and returns a new array, which is how
   App.jsx currently uses these (setRequests((list) => fn(list, ...))).
   The exported function NAMES and SIGNATURES below are relied on
   by App.jsx — don't rename/reshape createDeliveryRequest,
   assignRider, or logStatusEvent without updating App.jsx too.

   Auth: once wired for real, every request after login needs an
   `x-user-id` header (see login() below and getAuthHeaders()).
   ============================================================ */

const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/**
 * Creates a new DeliveryRequest.
 * TODO: replace body with `POST /api/requests`
 */
export function createDeliveryRequest(list, data) {
  const newReq = {
    id: `req-${Date.now()}`,
    ...data,
    created_at: timeNow(),
    assignment: null,
    status: null, // null = logged but not yet assigned (no Assignment row yet)
    events: [],
  };
  return [newReq, ...list];
}

/**
 * Creates an Assignment and moves the request into "Assigned" status.
 * TODO: replace body with `POST /api/assignments`
 */
export function assignRider(list, requestId, riderId) {
  return list.map((r) =>
    r.id === requestId
      ? {
          ...r,
          assignment: { rider_id: riderId, assigned_at: timeNow() },
          status: "Assigned",
          events: [
            ...r.events,
            { status: "Assigned", timestamp: timeNow(), changed_by: "Dispatcher", confirmation_scan: false },
          ],
        }
      : r
  );
}

/**
 * Writes a StatusEvent (e.g. from a pickup/delivery scan) and updates
 * the request's current status. The real backend splits this into two
 * separate endpoints rather than one generic one:
 *   status === "Picked Up"  → TODO: `POST /api/status/picked-up`
 *   status === "Delivered"  → TODO: `POST /api/status/confirm-delivery`
 * Kept as a single function here (not two) because App.jsx and
 * DeliveryDetailPage.jsx already call it as one — branch on `status`
 * inside the fetch() body when wiring this up for real.
 */
export function logStatusEvent(list, requestId, status, changedByName) {
  const ts = timeNow();
  return list.map((r) =>
    r.id === requestId
      ? {
          ...r,
          status,
          events: [...r.events, { status, timestamp: ts, changed_by: changedByName, confirmation_scan: true }],
        }
      : r
  );
}

/* ============================================================
   NOT YET WIRED IN — stubs only.
   These exist so the shape is ready once the pieces they connect
   to are confirmed. None of them are called anywhere in the app
   yet; wiring them in is a separate step from generating them.
   ============================================================ */

/**
 * Fetches the dispatcher's open-requests list from the server instead
 * of filtering the full local list client-side (which is what
 * AssignPage.jsx does today).
 * TODO: replace body with `GET /api/requests/open`
 */
export async function getOpenRequests() {
  throw new Error("getOpenRequests() is not wired up yet — AssignPage still filters the local requests list.");
}

/**
 * Failed-scan escalation. Deliberately NOT implemented beyond a stub —
 * ScanConfirmModal.jsx / DeliveryDetailPage.jsx currently handle a
 * failed scan with local component state only (an `escalations` array
 * in DeliveryDetailPage), and that flow is explicitly marked as
 * pending confirmation against Mark's docs/edge-cases.md. This stub
 * exists only so the shape is ready to call once that's resolved —
 * it does not encode any assumption about retry policy, who gets
 * notified, or what the payload should contain.
 * TODO: replace body with `POST /api/status/escalate`, once confirmed.
 */
export async function escalateScan(requestId, note) {
  throw new Error("escalateScan() is not wired up yet — pending Mark's docs/edge-cases.md.");
}

/**
 * Phone + PIN login. Not wired into any page yet — there's no login
 * screen in this build (the rider/dispatcher/staff "roles" are
 * currently just routes, not authenticated sessions).
 * TODO: replace body with `POST /api/auth/login`, store the returned
 * user id, and attach it as an `x-user-id` header (see getAuthHeaders)
 * on every subsequent request.
 */
export async function login(phone, pin) {
  throw new Error("login() is not wired up yet — no auth flow exists in the UI yet.");
}

/**
 * Once login() is wired up, use this to build the header object for
 * authenticated fetch() calls, e.g.:
 *   fetch(url, { headers: { "Content-Type": "application/json", ...getAuthHeaders() } })
 */
export function getAuthHeaders() {
  const userId = null; // TODO: read from wherever login() ends up storing it (state/localStorage/etc.)
  return userId ? { "x-user-id": userId } : {};
}
