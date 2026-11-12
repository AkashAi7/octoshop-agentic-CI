#!/usr/bin/env bash
set -euo pipefail

REPO=""
DRY_RUN="false"
LABELS_ONLY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      REPO="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --labels-only)
      LABELS_ONLY="true"
      shift
      ;;
    *)
      echo "Usage: $0 --repo <owner/repo> [--dry-run] [--labels-only]"
      exit 1
      ;;
  esac
done

if [[ -z "$REPO" ]]; then
  echo "Error: --repo <owner/repo> is required."
  exit 1
fi

run_cmd() {
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

echo "==> Ensuring workshop labels on $REPO ..."
run_cmd gh label create "report" --repo "$REPO" --color "0E8A16" --description "Automated repository status or telemetry report" --force
run_cmd gh label create "daily-status" --repo "$REPO" --color "1D76DB" --description "Daily Repo Status Agentic Workflow output" --force
run_cmd gh label create "blocker" --repo "$REPO" --color "B60205" --description "Active release or operational blocker" --force
run_cmd gh label create "release-blocker" --repo "$REPO" --color "D93F0B" --description "Blocks next production release tag" --force
run_cmd gh label create "priority/p0" --repo "$REPO" --color "B60205" --description "Critical outage, auth failure, or release stopper" --force
run_cmd gh label create "priority/p1" --repo "$REPO" --color "D93F0B" --description "High-severity defect without clean workaround" --force
run_cmd gh label create "priority/p2" --repo "$REPO" --color "FBCA04" --description "Standard actionable engineering item" --force
run_cmd gh label create "needs-info" --repo "$REPO" --color "D876E3" --description "Awaiting reproduction details or clarification" --force
run_cmd gh label create "copilot-ready" --repo "$REPO" --color "5319E7" --description "Well-scoped task ready for Copilot coding agent" --force
run_cmd gh label create "ci-failure" --repo "$REPO" --color "E99695" --description "Deterministic CI regression tracked by CI Explainer" --force
run_cmd gh label create "checkout" --repo "$REPO" --color "C2E0C6" --description "Cart pricing, promos, tax, and order placement" --force
run_cmd gh label create "cart" --repo "$REPO" --color "BFD4F2" --description "Shopping cart UI and line-item state" --force
run_cmd gh label create "catalog" --repo "$REPO" --color "FEF2C0" --description "Product listing, categories, and inventory stock" --force

if [[ "$LABELS_ONLY" == "true" ]]; then
  echo "Labels provisioned successfully."
  exit 0
fi

echo "==> Seeding realistic OctoShop e-commerce issues & blockers on $REPO ..."
run_cmd gh issue create --repo "$REPO" \
  --title "Checkout retry double-charges customer when /api/checkout network request times out" \
  --label "bug,checkout,priority/p0,blocker" \
  --body "Clicking Place Demo Order twice on a slow mobile connection submits two identical /api/checkout requests without an idempotency key, creating duplicate orders. Blocks weekend flash-sale launch."

run_cmd gh issue create --repo "$REPO" \
  --title "Mobile cart summary overlaps Place Order button on small iOS viewports" \
  --label "bug,cart,priority/p1" \
  --body "On 375px-wide screens with 4+ distinct line items in the cart, the sticky cart summary pushes the checkout CTA below the fold. Currently unassigned."

run_cmd gh issue create --repo "$REPO" \
  --title "Add VIP25 promo code (25% off orders of \$150+) to catalog and unit tests" \
  --label "enhancement,checkout,priority/p2,copilot-ready" \
  --body "Add VIP25 in src/catalog.mjs (type: 'percent', percentOff: 25, minSubtotalCents: 15000) and add unit test coverage in test/checkout.test.mjs."

run_cmd gh issue create --repo "$REPO" \
  --title "Should EU VAT be displayed inclusive on product cards or calculated at checkout?" \
  --label "question,catalog,needs-info" \
  --body "Before adding multi-currency EUR support next sprint, should product cards show VAT-inclusive pricing or keep tax as a separate line item in the cart summary?"

echo "Done! Repository $REPO is ready for the Daily Repo Status Demo and Lab 2."
