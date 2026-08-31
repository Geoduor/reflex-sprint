# Reflex — Frontend

React + Vite + Tailwind build covering the three Reflex personas (Retailer Staff,
Dispatcher, Rider) as described in `AGENT.md`, laid out to match `PROJECT_STRUCTURE.md`.
Uses mock data and React Router — no live backend connection yet.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Structure

```
frontend/
  .env.example           # copy to .env once the real API is live
  index.html              # Vite entry — see note below on public/ vs root
  src/
    index.jsx              # React entry point
    App.jsx                 # routes/entry point (React Router)
    styles/
      globals.css
    data/
      seed.js               # mock riders, retailer name, sample delivery requests
    api/
      client.js             # wraps calls to the backend API — currently mock, swap points marked
    components/
      DeliveryCard.jsx       # shared card: staff list, dispatcher columns, rider list
      StatusBadge.jsx
      ScanConfirmModal.jsx   # scan confirmation + failed-scan escalation (placeholder, see note)
      PulseRail.jsx           # status-stage indicator (Assigned → Picked Up → Delivered)
      SectionHeader.jsx
      EmptyState.jsx
    pages/
      retailer/
        NewRequestPage.jsx    # staff logs a delivery request
      dispatcher/
        AssignPage.jsx        # dispatcher assigns open requests to riders
      rider/
        MyDeliveriesPage.jsx   # rider's assigned deliveries list
        DeliveryDetailPage.jsx # detail view: status, scan confirmation, SMS log
```

### Note: index.html location

`PROJECT_STRUCTURE.md` shows `public/index.html`, which is the Create React App
convention. This build uses **Vite**, which requires `index.html` at the project
root to work at all — moving it into `public/` would break the dev server and
build. Kept at root here; flag with Geofry if the team wants to standardize on
CRA instead, in which case this project would need a different scaffold.

### Note: extra files not in PROJECT_STRUCTURE.md

`data/seed.js`, `PulseRail.jsx`, `SectionHeader.jsx`, and `EmptyState.jsx` aren't
listed in the doc. They're small, low-risk additions (mock data + shared visual
utilities), but per the doc's own rule ("new files not in this structure? Ping
the group") — worth a quick heads-up in the team chat rather than silently
assuming they're fine.

### Note: ScanConfirmModal's failed-scan path

The doc calls out `ScanConfirmModal.jsx` as handling "scan + failed-scan
escalation UI." This build includes a working version (with a demo toggle to
simulate a failure) but the actual retry/backoff and dispatcher-notification
behavior is a best guess, not a confirmed design — it should be checked against
Mark's `docs/edge-cases.md` before being treated as final. `src/api/client.js`
has a matching `escalateScan()` stub ready for `POST /api/status/escalate`,
but it isn't called from anywhere yet — the current failed-scan flow only
updates local component state in `DeliveryDetailPage.jsx`.

## Connecting to the real backend

The three functions `App.jsx` actually calls today are still mock/local-state,
but their TODO comments in `src/api/client.js` now point at the real endpoints:

- `createDeliveryRequest(list, data)` → `POST /api/requests`
- `assignRider(list, requestId, riderId)` → `POST /api/assignments`
- `logStatusEvent(list, requestId, status, changedByName)` → splits into
  `POST /api/status/picked-up` or `POST /api/status/confirm-delivery`
  depending on the `status` value passed in (the backend uses two separate
  endpoints here, not one generic one)

The backend also exposes a few endpoints nothing in this build calls yet.
`client.js` has stub functions ready for each, all currently throwing if
called (so a broken wire-up fails loudly instead of silently no-op'ing):

- `getOpenRequests()` → `GET /api/requests/open` (AssignPage still filters the full local list client-side instead)
- `escalateScan(requestId, note)` → `POST /api/status/escalate` (deliberately unimplemented — see the ScanConfirmModal note below)
- `login(phone, pin)` → `POST /api/auth/login` (there's no login screen in this build yet)
- `getAuthHeaders()` → builds the `x-user-id` header every request needs once a session exists

Each currently operates on local React state. To wire in Mark & Geofry's real API:
1. Replace the body of each function with a `fetch()` call to the matching endpoint (base URL from `VITE_API_URL` in `.env`), including `getAuthHeaders()` once login exists.
2. Replace `seedRequests` in `src/data/seed.js` with an initial `GET /api/requests` (or similar) fetch (e.g. in a `useEffect` in `App.jsx`).
3. For live sync across roles, add a Socket.IO client in `App.jsx` (using `VITE_SOCKET_URL`) and update `requests` state on incoming events, instead of relying on local `setRequests` calls alone.
4. Build an actual login screen before `login()`/`getAuthHeaders()` are useful — right now the three "roles" are just routes, not authenticated sessions.

No page or component needs to change for this swap — they only consume `requests`
state and call the handler functions passed down from `App.jsx`.

## Known simplifications (see AGENT.md trade-off log)

- Manual rider assignment, not automatic.
- No offline mode for the rider view.
- Linear status flow only (`Assigned → Picked Up → Delivered`) — no failed/returned/cancelled states.
- No handling/fragility notes field.
- The serial/IMEI field is shown to the rider as a manual visual check; the scan confirms the delivery event, not an automated serial match.
- Failed-scan escalation UI exists but its behavior is a placeholder pending Mark's edge-cases.md.
- No login screen / authenticated session yet — the three "roles" are just routes; `login()` and the `x-user-id` header pattern the real backend expects are stubbed in `client.js` but unused.
