---
description: |
  Triages incoming OctoShop customer bug reports and feature requests by area
  (checkout, cart, catalog), flags flash-sale blockers, and marks copilot-ready tasks.

on:
  issues:
    types: [opened, reopened]
  reaction: eyes
  workflow_dispatch:

engine: copilot

permissions:
  contents: read
  issues: read
  pull-requests: read

network: defaults

safe-outputs:
  staged: true
  mentions: false
  add-labels:
    blocked: ["~*", "*[bot]"]
    allowed:
      - bug
      - enhancement
      - question
      - needs-info
      - blocker
      - checkout
      - cart
      - catalog
      - copilot-ready
      - priority/p0
      - priority/p1
      - priority/p2
      - duplicate
    max: 5
  add-comment:
    max: 1
    hide-older-comments: true

timeout-minutes: 10
---

# Storefront Customer Issue Triage

Analyze the triggering issue (or the newest untriaged open issue on `workflow_dispatch`) for the **OctoShop** storefront.

## Instructions

1. Read the issue and search open/closed issues for duplicates.
2. If reproduction steps (such as cart items, promo code used, or browser viewport) are missing on a bug report, apply `needs-info` and ask 2–3 short clarifying questions.
3. Otherwise apply:
   - Storefront area label: `checkout`, `cart`, or `catalog`
   - Type label: `bug`, `enhancement`, or `question`
   - Priority label:
     - `priority/p0` + `blocker`: Duplicate charges, broken `/api/checkout`, negative cart totals, or overselling out-of-stock items.
     - `priority/p1`: Broken promo codes, wrong shipping/tax math, or mobile cart layout bugs.
     - `priority/p2`: New promo tiers, catalog items, or minor UX polish.
   - `copilot-ready`: Apply **only** when the change is self-contained (e.g., adding a promo code in `src/catalog.mjs` + unit test in `test/checkout.test.mjs`).
4. Post one concise triage comment table summarising **Storefront Area**, **Priority**, **Flash-Sale Blocker**, and **Next Step**.
5. If the issue is already triaged with a `priority/*` label, call `noop`:
   `{"noop": {"message": "No action needed: storefront issue already has priority triage labels."}}`
