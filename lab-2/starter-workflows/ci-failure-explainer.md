---
description: |
  Watches your existing E-Commerce CI workflow (or your own repo's CI workflow)
  and opens a concise root-cause issue whenever checkout or cart tests fail.

on:
  workflow_run:
    # Replace "E-Commerce CI" below with the `name:` of your own GitHub Actions workflow if using your own repo!
    workflows: ["E-Commerce CI"]
    types: [completed]
    branches: [main]
  workflow_dispatch:

if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'failure'

engine: copilot

permissions:
  contents: read
  actions: read
  issues: read
  pull-requests: read

network: defaults

tools:
  bash: ["cat", "ls", "find", "grep", "head", "tail", "git log", "git show"]
  github:
    lockdown: false
    min-integrity: none

safe-outputs:
  # Tip: Keep `staged: true` for your first dry-run preview in the Actions Step Summary,
  # then remove `staged: true` and re-run `gh aw compile` to create real issues!
  staged: true
  mentions: false
  create-issue:
    title-prefix: "[ci-explainer] "
    labels: [bug, ci-failure, checkout]
    deduplicate-by-title: 2
    close-older-issues: false
    expires: 7d
    max: 1

timeout-minutes: 10
---

# E-Commerce CI Failure Explainer

Investigate the latest failed run of `E-Commerce CI` (or inspect `src/checkout.mjs`, `src/catalog.mjs`, and `test/checkout.test.mjs` if triggered via `workflow_dispatch`).

## Steps

1. Inspect the failed workflow run jobs/logs, the triggering commit (`git log -n 5`), and the affected storefront/checkout source and test files.
2. Check open `[ci-explainer]` issues first so we do not file a duplicate issue for the same pricing, promo-code, or stock failure.
3. Open **one** concise GitHub issue summarising:
   - **What Broke**: Failing job, test case, and assertion/error message (e.g., negative cart total, broken promo minimum, or out-of-stock check).
   - **Customer Impact**: How this affects shoppers in OctoShop (checkout, cart totals, shipping, or catalog).
   - **Likely Root Cause & Fix**: Exact file + line numbers and `npm test` command to verify locally.

## No-Op Rule

If the watched CI workflow succeeded, or if an existing open `[ci-explainer]` issue already covers this exact failure, do NOT create a duplicate issue—call `noop` instead:
`{"noop": {"message": "No action needed: E-Commerce CI is green or failure is already tracked."}}`
