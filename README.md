# Reflex — The Readiness Sprint

Delivery-coordination system design for a small Kenyan **electronics retail shop**, built for Power Learn Project's Readiness Sprint. This week is graded on design clarity and live defense, not on shipping production code — see `AGENT.md` for full context.

## Team

| Name | Role |
|---|---|
| Geofry Oduor | Team Lead — Architecture & System Design |
| Mark | Architecture & System Design, Edge Cases defense |
| Faith | Narrative & Trade-off Log, Problem + Trade-offs slides |
| Jane | UX/Solution Flow & Demo, Solution + Roadmap slides |

## The Problem

Small electronics retailers currently coordinate deliveries over WhatsApp and phone calls — no record of who's assigned, no status visibility, no proof of delivery. Given the value and fraud risk of electronics specifically, this creates real business risk, not just inconvenience.

## The Solution

Reflex lets:
1. **Retailer staff** log a delivery request
2. **Dispatcher** assign it to a rider
3. **Rider** update status: `Assigned → Picked Up → Delivered`, with scan-based confirmation at delivery

Full architecture, data model, and known trade-offs are documented in [`AGENT.md`](./AGENT.md) — read this first before contributing.

## Repo Structure

```
reflex-sprint/
├── README.md              (this file)
├── AGENT.md                (shared project context — read first)
├── docs/
│   ├── frozen-design.md    (architecture — Geofry + Mark)
│   ├── trade-off-log.md    (Faith)
│   └── timing-log.md       (whole team — updated Day 2 & Day 4)
├── deck/
│   └── reflex-deck.pptx    (or a link to Google Slides/Canva, whichever we use)
└── demo/
    └── demo-script.md      (Jane)
```

## Contribution Convention

- Everyone pushes their **own** work under their **own** GitHub account — no centralizing commits through one person's account. Commit history is our attribution record for grading.
- Read `AGENT.md` before starting your section, and paste it into your own Claude chat for context if you're using AI assistance.
- If you change something that affects another section (e.g. Mark changes the data model, which affects Faith's trade-off log or Jane's screen flow), flag it in the team chat immediately — don't let people build against a stale AGENT.md.
- Commit early and often. A clean, incremental history is easier to defend than one giant commit on Day 5.

## Week Schedule

| Day | Focus |
|---|---|
| Day 1 | Freeze & Storyboard — lock architecture, storyboard deck |
| Day 2 | Learn State → Context → Evidence, first timed dry run |
| Day 3 | Mock Panel Session — presentation + cross-exam + critique |
| Day 4 | Revise & re-run based on feedback |
| Day 5 | Submission |

## Deliverables Checklist

- [ ] Frozen design doc (`docs/frozen-design.md`)
- [ ] Deck: Problem → Solution → Architecture → Trade-offs → Roadmap
- [ ] Trade-off log — 3+ weak points, each with "acceptable because..." (`docs/trade-off-log.md`)
- [ ] Demo script (`demo/demo-script.md`)
- [ ] Timing log from 2+ dry runs (`docs/timing-log.md`)
