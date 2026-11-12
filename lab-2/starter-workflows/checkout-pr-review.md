---
description: |
  Runs alongside your PR CI checks to audit OctoShop pull request diffs for
  pricing/discount bugs, negative cart totals, inventory bypasses, and missing tests.

on:
  pull_request:
    types: [opened, synchronize, reopened]
  workflow_dispatch:

engine: copilot

permissions:
  contents: read
  issues: read
  pull-requests: read

network: defaults

tools:
  bash: ["cat", "ls", "find", "grep", "head", "tail", "git diff", "git log"]

safe-outputs:
  staged: true
  mentions: false
  create-pull-request-review-comment:
    max: 6
  submit-pull-request-review:
    allowed-events: [COMMENT]
    max: 1

timeout-minutes: 10
---

# Checkout & Pricing PR Risk Reviewer

Review the pull request diff alongside `E-Commerce CI`. Focus strictly on **e-commerce correctness**, **pricing/promo math**, **inventory validation**, and **test coverage**.

## E-Commerce Audit Checklist

1. **Money & Promo Math (`src/checkout.mjs`, `src/catalog.mjs`)**:
   - Are all prices, discounts, shipping, and tax calculated in integer cents (no floating-point drift)?
   - Can any promo code produce a negative subtotal or bypass `minSubtotalCents`?
2. **Inventory & Checkout Safety (`src/server.mjs`, `public/app.js`)**:
   - Are out-of-stock (`stock === 0`) and quantity-exceeds-stock checks enforced on the server, not only in browser UI?
3. **Unit Tests (`test/checkout.test.mjs`)**:
   - Do new promo codes, shipping rules, or tax changes include unit tests?

## Output Rules

- Add inline review comments (`create_pull_request_review_comment`) **only** on lines with concrete pricing, inventory, or security bugs—skip style nitpicks.
- Submit one short advisory review (`submit_pull_request_review` with `COMMENT`) grouping findings into **Checkout Blockers** and **Test Gaps**.
- If the diff only touches generated lock files or has zero findings, call `noop`:
  `{"noop": {"message": "No action needed: PR diff has no pricing, inventory, or checkout risks."}}`
