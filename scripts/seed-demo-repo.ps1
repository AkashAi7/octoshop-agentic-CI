param(
    [Parameter(Mandatory = $true)]
    [string]$Repo,

    [switch]$DryRun,

    [switch]$LabelsOnly
)

$ErrorActionPreference = "Stop"

$labels = @(
    @{ Name = "report"; Color = "0E8A16"; Desc = "Automated repository status or telemetry report" },
    @{ Name = "daily-status"; Color = "1D76DB"; Desc = "Daily Repo Status Agentic Workflow output" },
    @{ Name = "blocker"; Color = "B60205"; Desc = "Active release or operational blocker" },
    @{ Name = "release-blocker"; Color = "D93F0B"; Desc = "Blocks next production release tag" },
    @{ Name = "priority/p0"; Color = "B60205"; Desc = "Critical outage, auth failure, or release stopper" },
    @{ Name = "priority/p1"; Color = "D93F0B"; Desc = "High-severity defect without clean workaround" },
    @{ Name = "priority/p2"; Color = "FBCA04"; Desc = "Standard actionable engineering item" },
    @{ Name = "needs-info"; Color = "D876E3"; Desc = "Awaiting reproduction details or clarification" },
    @{ Name = "copilot-ready"; Color = "5319E7"; Desc = "Well-scoped task ready for Copilot coding agent" },
    @{ Name = "ci-failure"; Color = "E99695"; Desc = "Deterministic CI regression tracked by CI Explainer" },
    @{ Name = "checkout"; Color = "C2E0C6"; Desc = "Cart pricing, promos, tax, and order placement" },
    @{ Name = "cart"; Color = "BFD4F2"; Desc = "Shopping cart UI and line-item state" },
    @{ Name = "catalog"; Color = "FEF2C0"; Desc = "Product listing, categories, and inventory stock" }
)

Write-Host "==> Ensuring workshop labels on $Repo ..."
foreach ($lbl in $labels) {
    if ($DryRun) {
        Write-Host "[DryRun] gh label create '$($lbl.Name)' --repo $Repo --color $($lbl.Color) --description '$($lbl.Desc)' --force"
    } else {
        gh label create $lbl.Name --repo $Repo --color $lbl.Color --description $lbl.Desc --force
    }
}

if ($LabelsOnly) {
    Write-Host "Labels provisioned successfully."
    exit 0
}

$issues = @(
    @{
        Title = "Checkout retry double-charges customer when /api/checkout network request times out"
        Labels = "bug,checkout,priority/p0,blocker"
        Body = @"
### Symptom
Clicking **Place Demo Order** twice during a slow mobile connection submits two identical `/api/checkout` requests without an idempotency key, creating duplicate orders.

### Impact
Blocks weekend flash-sale launch. Needs immediate checkout owner assignment.

### Reproduction
1. Throttle network to Slow 3G in DevTools.
2. Add `OctoKey TKL Mechanical Keyboard` to cart and double-click **Place Demo Order**.
"@
    },
    @{
        Title = "Mobile cart summary overlaps Place Order button on small iOS viewports"
        Labels = "bug,cart,priority/p1"
        Body = @"
### Summary
On 375px-wide screens with 4+ distinct line items in the cart, the sticky cart summary pushes the checkout CTA below the fold. Currently unassigned.
"@
    },
    @{
        Title = 'Add VIP25 promo code (25% off orders of $150+) to catalog and unit tests'
        Labels = "enhancement,checkout,priority/p2,copilot-ready"
        Body = @'
### Context
Add a new `VIP25` promo code in `src/catalog.mjs` (`type: 'percent'`, `percentOff: 25`, `minSubtotalCents: 15000`) and verify it in `test/checkout.test.mjs`.

### Acceptance Criteria
- `VIP25` applies 25% discount when subtotal >= $150.00
- Orders under $150.00 receive a clear minimum-subtotal message
- `npm test` passes
'@
    },
    @{
        Title = "Should EU VAT be displayed inclusive on product cards or calculated at checkout?"
        Labels = "question,catalog,needs-info"
        Body = @"
Before adding multi-currency EUR support next sprint, should product cards show VAT-inclusive pricing or keep tax as a separate line item in the cart summary?
"@
    }
)

Write-Host "==> Seeding realistic open issues & blockers on $Repo ..."
foreach ($item in $issues) {
    if ($DryRun) {
        Write-Host "[DryRun] gh issue create --repo $Repo --title '$($item.Title)' --label '$($item.Labels)'"
    } else {
        gh issue create --repo $Repo --title $item.Title --label $item.Labels --body $item.Body
    }
}

Write-Host "Done! Repository $Repo is ready for the Daily Repo Status Demo and Lab 2."
