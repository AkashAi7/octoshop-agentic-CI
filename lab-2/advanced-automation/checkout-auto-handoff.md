---
description: |
  Complex multi-step Copilot automation for OctoShop: captures deterministic
  checkout test output, opens a deduplicated incident issue, and conditionally
  assigns @copilot coding agent to open a draft fix PR.

on:
  workflow_run:
    workflows: ["E-Commerce CI"]
    types: [completed]
    branches: [main]
  workflow_dispatch:
    inputs:
      simulate_failure:
        description: "Simulate a promo-discount rounding bug to test the @copilot handoff"
        required: false
        type: boolean
        default: true

if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'failure'

engine: copilot

permissions:
  contents: read
  actions: read
  issues: read
  pull-requests: read

network: defaults

# Stage 1: Deterministic pre-step runs OctoShop checkout tests at ZERO AI credit cost
steps:
  - name: Capture checkout test output & recent commits
    continue-on-error: true
    env:
      SIMULATE_FAILURE: ${{ inputs.simulate_failure }}
    run: |
      mkdir -p /tmp/gh-aw/agent
      {
        echo "=== RECENT COMMITS ==="
        git log -n 5 --oneline || true
        echo ""
        echo "=== OCTOSHOP CHECKOUT TEST OUTPUT ==="
        if [ "$SIMULATE_FAILURE" = "true" ]; then
          echo 'not ok 3 - applies SAVE20 promo code when subtotal is at least $50.00'
          echo '  AssertionError: Expected discountCents 1360, got 0 when promoCode passed in lowercase ("save20") at src/checkout.mjs:61'
        else
          npm test 2>&1
        fi
      } > /tmp/gh-aw/agent/ci-telemetry.txt

tools:
  bash: ["cat", "ls", "find", "grep", "head", "tail", "git log", "git show"]
  github:
    lockdown: false
    min-integrity: none

# Stage 2: Multi-step safe-outputs with guarded @copilot coding-agent assignment
safe-outputs:
  staged: true
  mentions: false
  create-issue:
    title-prefix: "[checkout-auto] "
    labels: [bug, ci-failure, checkout]
    deduplicate-by-title: 2
    deduplicate-by-labels: [bug, ci-failure]
    expires: 7d
    max: 1
  add-labels:
    blocked: ["~*", "*[bot]"]
    allowed: [copilot-ready, priority/p1, priority/p2]
    target: "*"
    max: 1
  assign-to-agent:
    name: "copilot"
    target: "*"
    required-labels: [copilot-ready]
    max: 1

max-turns: 20
max-ai-credits: 400
timeout-minutes: 12
---

# Checkout CI Auto-Triage & `@copilot` Fix Handoff

Follow `.github/agents/checkout-responder.agent.md` (if present) to diagnose `/tmp/gh-aw/agent/ci-telemetry.txt`.

1. Read `/tmp/gh-aw/agent/ci-telemetry.txt`. If all checkout tests passed, immediately call `noop`.
2. Search open `[checkout-auto]` issues; if this failure is already tracked, call `noop` citing the open issue number.
3. Call `create_issue` explaining what broke in OctoShop checkout, the exact file/lines in `src/checkout.mjs` or `src/catalog.mjs`, customer impact, and whether it qualifies as `copilot-ready`.
4. **Only when `copilot-ready`**:
   - Call `add_labels` (`["copilot-ready", "priority/p1"]`) on the new issue with `"depends-on"` set to the `create_issue` `output_id`.
   - Call `assign_to_agent` (`"copilot"`) on the new issue with `"depends-on"` set to the `add_labels` `output_id` so `@copilot` opens a draft fix PR!
