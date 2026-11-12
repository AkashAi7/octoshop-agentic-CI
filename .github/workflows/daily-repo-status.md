---
description: |
  Getting-started daily repository status workflow for the OctoShop e-commerce site.
  Summarises open issues, pull requests, recent merges, and storefront/checkout blockers
  into a single GitHub issue.

on:
  schedule: daily
  workflow_dispatch:

engine: copilot

permissions:
  contents: read
  issues: read
  pull-requests: read

network: defaults

tools:
  bash: ["cat", "ls", "find", "grep", "head", "tail", "wc"]
  github:
    lockdown: false
    min-integrity: none

safe-outputs:
  mentions: false
  allowed-github-references: ["repo"]
  create-issue:
    title-prefix: "[daily-status] "
    labels: [report, daily-status]
    close-older-issues: true
    group-by-day: true

timeout-minutes: 15
---

# OctoShop — Daily Repo Status Report

Create a concise daily status report for the **OctoShop** e-commerce repository as a GitHub issue.

## What to Include

1. **Storefront & Checkout Blockers**:
   - Open issues labeled `blocker`, `release-blocker`, or `priority/p0` (such as payment, cart, pricing, or inventory bugs), plus unassigned `priority/p1` issues.
   - Open pull requests with failing `E-Commerce CI` checks or waiting >48 hours for review.
2. **Open Issues**:
   - Newly opened issues in the last 24 hours and a quick breakdown by area (`checkout`, `cart`, `catalog`) and priority (excluding previous `[daily-status]` issues).
3. **Open Pull Requests**:
   - PRs ready to merge, PRs needing review, and PRs with failing checks or requested changes.
4. **Recent Merges**:
   - Pull requests merged in the last 24 hours (or the 3 most recent merges if the last 24 hours were quiet) and what they shipped for shoppers/maintainers.
5. **Recommended Next Steps**:
   - Top 3 concrete maintainer actions for today referencing `#issue` / `#pr` numbers.

## Style & Guardrails

- Keep it factual, scannable, and grounded strictly in real repository activity.
- Do not `@mention` users directly so daily reports never trigger notification spam.
- Format the issue title as `OctoShop Daily Report — YYYY-MM-DD` (`[daily-status] ` is added automatically).
- If there are zero open issues, zero open PRs, and zero recent merges to report, do not open an empty issue—call `noop` instead:
  `{"noop": {"message": "No action needed: no open issues, PRs, or recent merges to summarise."}}`
