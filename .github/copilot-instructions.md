# Repository Instructions for GitHub Copilot

## Overview

This is **OctoShop**, a lightweight, zero-dependency e-commerce repository for demonstrating and experimenting with **GitHub Agentic Workflows (`gh-aw`)** alongside standard GitHub Actions:

1. **OctoShop E-Commerce Storefront (`src/`, `public/`, `test/`)**:
   - `src/catalog.mjs` — Product catalog (`OctoKey TKL`, `ThunderHub Dock`, apparel/accessories) and promo codes (`SAVE20`, `WELCOME10`, `FREESHIP`).
   - `src/checkout.mjs` — Integer-cent cart subtotal, discount, $100 free-shipping threshold, stock validation, and 8% tax calculation.
   - `src/server.mjs` + `public/` — Zero-dependency storefront UI & JSON API (`npm start` → `http://localhost:3000`).
   - `.github/workflows/ci.yml` (`E-Commerce CI`) — Deterministic unit test & workflow guardrail check.
2. **Getting-Started Agentic Workflow (`.github/workflows/daily-repo-status.md`)**: Live demo workflow that summarises open storefront issues, PRs, recent merges, and flash-sale checkout blockers into a GitHub Issue.
3. **Workshop Modules**:
   - `demo/` — Getting started & live demo walkthrough
   - `lab-2/` — Hands-on Lab 2 (pair an Agentic Workflow against `E-Commerce CI` or your own workflow, or build a multi-step `@copilot` checkout-fix automation)

## Agentic Workflow (`gh-aw`) Guardrails

- Keep agent job `permissions:` strictly read-only (`contents: read`, `issues: read`, `pull-requests: read`, `actions: read`). Perform all GitHub writes via `safe-outputs:`.
- Never place `${{ secrets.* }}` inside top-level `env:`.
- Prefer `pull_request` over `pull_request_target`.
- Always include a `noop` instruction in the Markdown prompt for runs where no GitHub write is needed.
- Run `gh aw compile` whenever frontmatter changes and commit both `.md` and `.lock.yml`.
- Run `npm run verify` locally to execute unit tests and validate all workflow `.md` files.
