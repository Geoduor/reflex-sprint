/* ============================================================
   API CLIENT — wired to the real backend.
   Base URL comes from VITE_API_URL (see .env.example).
   Session: after login(), the user id is kept in memory (module-level
   variable) and sent as the `x-user-id` header on every request, per
   backend/src/middleware/auth.js. This is intentionally the same
   simple scheme the backend uses — see frozen-design.md's honest note
   that this is not real session security, just sprint-scope auth.
   ============================================================ */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let currentUserId = null;
let currentUser = null;

/**
 * The backend stores status as lowercase/snake_case ('unassigned',
 * 'assigned', 'picked_up', 'delivered' — see backend/src/config/schema.sql),
 * but the UI components (StatusBadge, PulseRail) were built expecting
 * Title Case ('Assigned', 'Picked Up', 'Delivered'), with falsy/unassigned
 * shown as no status. Normalized here at the API boundary so no UI
 * component needs to change.
 */
const STATUS_DISPLAY_MAP = {
  unassigned: null,
  assigned: "Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
};

function normalizeRequest(req) {
  return { ...req, status: STATUS_DISPLAY_MAP[req.status] ?? req.status };
}

export function getAuthHeaders() {
  return currentUserId ? { "x-user-id": currentUserId } : {};
}

export function getCurrentUser() {
  return currentUser;
}

export function logout() {
  currentUserId = null;
  currentUser = null;
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${method} ${path} (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Phone + PIN login. Stores the session in memory for subsequent requests.
 * Maps to POST /api/auth/login.
 */
export async function login(phone, pin) {
  const data = await request("POST", "/auth/login", { phone, pin });
  currentUserId = data.token;
  currentUser = data.user;
  return data.user;
}

/**
 * Retailer staff creates a new delivery request.
 * Maps to POST /api/requests.
 */
export async function createDeliveryRequest(data) {
  return request("POST", "/requests", data);
}

/**
 * Dispatcher views open (unassigned) requests.
 * Maps to GET /api/requests/open.
 */
export async function getOpenRequests() {
  const data = await request("GET", "/requests/open");
  return data.map(normalizeRequest);
}

/**
 * Retailer views their own requests.
 * Maps to GET /api/requests/mine.
 */
export async function getMyRequests() {
  const data = await request("GET", "/requests/mine");
  return data.map(normalizeRequest);
}

/**
 * Dispatcher assigns a rider to an open request.
 * Maps to POST /api/assignments. Note: the backend enforces one
 * assignment per request via a DB unique constraint — a 409 here means
 * someone else already assigned it (see frozen-design.md).
 */
export async function assignRider(deliveryRequestId, riderId) {
  return request("POST", "/assignments", { delivery_request_id: deliveryRequestId, rider_id: riderId });
}

/**
 * Rider views their assigned deliveries.
 * Maps to GET /api/assignments/mine.
 */
export async function getMyDeliveries() {
  const data = await request("GET", "/assignments/mine");
  return data.map(normalizeRequest);
}

/**
 * Dispatcher fetches the list of riders available to assign.
 * Maps to GET /api/users?role=rider.
 */
export async function getRiders() {
  return request("GET", "/users?role=rider");
}

/**
 * Rider marks a delivery picked up.
 * Maps to POST /api/status/picked-up.
 */
export async function markPickedUp(deliveryRequestId) {
  return request("POST", "/status/picked-up", { delivery_request_id: deliveryRequestId });
}

/**
 * Rider confirms delivery via scan. A mismatched scan is a deliberate
 * design behavior — the backend returns 409 and does NOT advance status
 * (see frozen-design.md, Status Flow). Callers should catch this and
 * show the failed-scan UI, not treat it as an unexpected error.
 * Maps to POST /api/status/confirm-delivery.
 */
export async function confirmDelivery(deliveryRequestId, scannedValue) {
  return request("POST", "/status/confirm-delivery", {
    delivery_request_id: deliveryRequestId,
    scanned_value: scannedValue,
  });
}

/**
 * Escalation when a rider can't resolve a failed scan themselves.
 * Maps to POST /api/status/escalate. Requires a note (enforced server-side).
 */
export async function escalateScan(deliveryRequestId, note) {
  return request("POST", "/status/escalate", { delivery_request_id: deliveryRequestId, note });
}
