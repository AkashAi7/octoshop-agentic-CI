# Example Output: `[daily-status] OctoShop Daily Report — 2026-11-12`

> **Labels**: `report`, `daily-status`  
> **Previous Report**: Closed `#14` automatically via `close-older-issues: true`

---

## Storefront & Checkout Blockers

| Item | Type | Why It's Blocking Flash Sale | Status |
|---|---|---|---|
| `#18` | P0 Issue (`blocker`) | Payment retry timeout double-charges orders when network drops during `/api/checkout` | **Unassigned** (opened 3h ago) |
| `#19` | P1 Issue (`cart`) | Sticky mobile cart panel overlaps "Place Demo Order" button on iOS Safari | **Unassigned** (opened 19h ago) |
| `#21` | Open PR (Failing CI) | `refactor(checkout): round promo discounts` failing cent-rounding assertion in `E-Commerce CI` | Changes requested |
| `#16` | Open PR (Stalled) | `feat(catalog): add instant search bar` waiting **54h** for first review | CI green · Needs review |

## Open Issues (4)
- **Checkout & Cart Bugs**: `#18` (`priority/p0`, `blocker`), `#19` (`priority/p1`, `cart`)
- **Ready for `@copilot`**: `#20` — Support `VIP25` ($150+ min) promo tier in `src/catalog.mjs` (`enhancement`, `priority/p2`, `copilot-ready`)
- **Needs Clarification**: `#23` — Should EU VAT be displayed inclusive on product cards or only in cart summary? (`question`, `needs-info`)

## Open Pull Requests (3)
- **Ready to Merge**: `#22` — `fix(checkout): clamp fixed promo discount so total never goes negative` (Approved, `E-Commerce CI` green)
- **Needs Review**: `#16` — `feat(catalog): add instant search bar` (`E-Commerce CI` green, 54h waiting)
- **Failing Checks**: `#21` — `refactor(checkout): round promo discounts` (`E-Commerce CI` failing)

## Recent Merges (Last 24h)
- `#15` — `feat(catalog): show Low Stock badge when inventory <= 5` (merged 6h ago by `octocat`)
- `#13` — `feat(checkout): waive $9 shipping automatically on orders over $100` (merged 18h ago by `mona`)

## Recommended Next Steps
1. **Assign a checkout owner to `#18` (`priority/p0`)** to add idempotency keys before enabling flash-sale traffic.
2. **Merge `#22`** (approved + green CI) and assign a reviewer to unblock **`#16`**.
3. **Fix the cent-rounding test failure on PR `#21`** so `E-Commerce CI` returns to green.
