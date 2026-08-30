# Reflex — Full Project Structure

Shared reference for the whole team. Read `AGENT.md` first for project context — this file is just "where does my work go."

```
reflex-sprint/
│
├── README.md                              [Geofry] — project overview, setup, repo guide
├── AGENT.md                               [Geofry] — shared AI/context file, read first
├── .gitignore                             [Geofry] — root-level
│
├── backend/                               [Geofry + Mark] — Architecture & System Design
│   ├── .gitignore
│   ├── .env.example                       (template only — never commit real .env)
│   ├── package.json
│   └── src/
│       ├── index.js                       — server entry point (Express + Socket.IO)
│       ├── config/
│       │   ├── db.js                      — Postgres connection pool
│       │   └── schema.sql                 — table definitions
│       ├── controllers/
│       │   ├── requestsController.js
│       │   ├── assignmentsController.js
│       │   └── statusController.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── asyncHandler.js
│       └── routes/
│           ├── requests.js
│           ├── assignments.js
│           └── status.js
│
├── frontend/                              [Jane] — UX / Solution Flow & Demo
│   ├── .gitignore
│   ├── .env.example
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx                        — routes/entry point
│       ├── index.jsx
│       ├── api/
│       │   └── client.js                  — wraps calls to the backend API
│       ├── components/
│       │   ├── DeliveryCard.jsx
│       │   ├── StatusBadge.jsx
│       │   └── ScanConfirmModal.jsx       — handles scan + failed-scan escalation UI
│       ├── pages/
│       │   ├── retailer/
│       │   │   └── NewRequestPage.jsx     — retailer staff logs a request
│       │   ├── dispatcher/
│       │   │   └── AssignPage.jsx         — dispatcher sees open requests, assigns rider
│       │   └── rider/
│       │       ├── MyDeliveriesPage.jsx   — rider sees assigned deliveries
│       │       └── DeliveryDetailPage.jsx — status updates + scan confirmation
│       └── styles/
│           └── globals.css
│
├── deck/                                  [Team — assembled from everyone's slide content]
│   └── reflex-deck.pptx                   (or a link file to Canva/Google Slides)
│
├── demo/                                  [Jane]
│   └── demo-script.md
│
├── docs/                                  [Shared — different owners per file]
│   ├── frozen-design.md                   [Geofry + Mark]
│   ├── trade-off-log.md                   [Faith]
│   ├── timing-log.md                      [Team — filled in Day 2–4]
│   ├── edge-cases.md                      [Mark] — concurrency/failure scenarios
│   └── meeting-notes.md                   [Geofry] — optional, team sync logs
│
└── planning/                              [Geofry] — internal only, not a graded deliverable
    └── Reflex_Team_Charter.docx
```

## Quick reference — who owns what

| Person | Primary folder(s) | Also owns |
|---|---|---|
| **Geofry** | `backend/` (with Mark), `docs/frozen-design.md` (with Mark) | README, AGENT.md, team coordination, Architecture slide + defense |
| **Mark** | `backend/` (with Geofry), `docs/edge-cases.md` | Edge Cases defense |
| **Faith** | `docs/trade-off-log.md` | Problem + Trade-offs slides, Trade-offs defense |
| **Jane** | `frontend/`, `demo/demo-script.md` | Solution + Roadmap slides, Candor defense |

## Rules for everyone
- Push your own work under your own GitHub account — this is our attribution record.
- Read `AGENT.md` before starting, and paste it into your own Claude chat for context.
- If you change something that affects someone else's folder (e.g. Mark changes the data model, which affects Jane's frontend or Faith's trade-off log), flag it in the team chat immediately.
- New folders/files not in this structure? Ping the group before adding them so this doc — and everyone's mental model — stays accurate.
