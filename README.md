# OctoShop — Getting Started with GitHub Agentic Workflows (`gh-aw`)

A zero-dependency **e-commerce storefront** (`OctoShop`) built so anyone can immediately understand the domain—products, cart totals, promo codes (`SAVE20`, `FREESHIP`), inventory stock, and checkout—while seeing **GitHub Agentic Workflows** in action next to standard GitHub Actions CI.

---

## How It Fits Together

```mermaid
flowchart LR
    Code["OctoShop Storefront (Catalog, Cart & Promo Math)"] --> CI["E-Commerce CI (.yml) — Deterministic Unit Tests"]
    Code --> AW["Agentic Workflow (.md -> .lock.yml) — Read-Only Copilot Agent"]
    AW -->|"Structured JSON Intent"| SO["Safe Outputs Job — Scoped GitHub Issue / PR Comment"]
```

## Session Flow

| Part | Guide | What You Will Do |
|---|---|---|
| **1. Live Demo** | **[Daily Repo Status Report](demo/README.md)** | Walk through [`.github/workflows/daily-repo-status.md`](.github/workflows/daily-repo-status.md) and watch it summarise **open storefront issues, PRs, recent merges, and checkout blockers** into one GitHub Issue alongside [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (`E-Commerce CI`). |
| **2. Hands-On Lab** | **[Lab 2: Try One Against Your Workflow](lab-2/README.md)** | **Path 1 (15–20 min)**: Pair a starter Agentic Workflow (`ci-failure-explainer.md`, `checkout-pr-review.md`, or `storefront-issue-triage.md`) against `E-Commerce CI` or your own repo's workflow.<br>**Path 2 (25–30 min)**: Build a multi-step Copilot Automation (`checkout-auto-handoff.md`) that hands off checkout bugs to `@copilot`. |

---

## Step-by-Step Quick Start

### Step 1 — Open the Repo (Codespaces or Local)

- **Fastest (Zero Setup)**: Click **Code → Codespaces → Create codespace on main** (`gh` and `gh-aw` are pre-installed automatically).
- **Local (Linux, macOS, or Windows WSL)**: Clone the repo and install the `gh-aw` CLI extension:
  ```bash
  gh extension install github/gh-aw
  gh aw version
  ```

### Step 2 — Explore OctoShop & Run Tests (No `npm install` Needed)

```bash
# Run cart, promo-code & stock unit tests + validate all Agentic Workflow (.md) files
npm run verify

# Optional: Launch the OctoShop storefront at http://localhost:3000
npm start
```

### Step 3 — One-Time GitHub Actions Setup (On Your Fork / Repo)

1. **Enable Actions (if working on a fork)**: Open your fork's **Actions** tab on GitHub and click **"I understand my workflows, go ahead and enable them"**.
2. **Add your Copilot token secret**:
   - Create a [Fine-Grained Personal Access Token](https://github.com/settings/personal-access-tokens/new) with **Resource owner = your user account** and **Account permissions → Copilot Requests: Read-only** *(no repo scopes needed)*.
   - Save it as `COPILOT_GITHUB_TOKEN` (paste when prompted):
     ```bash
     gh secret set COPILOT_GITHUB_TOKEN
     ```
     *(Using a GitHub Organization with centralized Copilot billing instead? Run `gh aw add-wizard` to use `copilot-requests: write` without a PAT.)*

### Step 4 — Run (or Customize) the Getting-Started Workflow

```bash
# Trigger the pre-compiled Daily Repo Status workflow right away
gh aw run daily-repo-status
gh run watch

# Whenever you edit .github/workflows/daily-repo-status.md, re-compile & push:
gh aw compile daily-repo-status
git add .gitattributes .github/aw/ .github/workflows/
git commit -m "Update OctoShop daily-repo-status workflow"
git push
```

> **Starting from an empty repo?** Seed OctoShop labels and sample checkout/cart issues in one command:
> ```bash
> ./scripts/seed-demo-repo.sh --repo "<owner>/<repo>"
> # PowerShell: ./scripts/seed-demo-repo.ps1 -Repo "<owner>/<repo>"
> ```

---

## Repository Layout

```text
.
├── .devcontainer/
│   └── devcontainer.json                           # Codespaces setup with gh + gh-aw pre-installed
├── .gitattributes                                  # Marks *.lock.yml as linguist-generated=true
├── .github/
│   ├── copilot-instructions.md                     # Repo context & gh-aw guardrails
│   └── workflows/
│       ├── ci.yml                                  # Existing "E-Commerce CI" workflow (with simulate_checkout_bug input)
│       └── daily-repo-status.md                    # Getting-started Demo Agentic Workflow
├── demo/
│   ├── README.md                                   # Live presenter walkthrough
│   └── sample-daily-status-issue.md                # Sample generated OctoShop Daily Report issue
├── lab-2/
│   ├── README.md                                   # Hands-on Lab 2 instructions
│   ├── starter-workflows/                          # Path 1: Pair one Agentic Workflow against CI / PRs / Issues
│   │   ├── ci-failure-explainer.md                 # Watches E-Commerce CI & explains checkout failures
│   │   ├── checkout-pr-review.md                   # Audits PRs for pricing, promo & inventory bugs
│   │   └── storefront-issue-triage.md              # Triages customer issues (checkout / cart / catalog)
│   └── advanced-automation/                        # Path 2: Multi-step @copilot automation
│       ├── checkout-responder.agent.md             # Custom Copilot agent (.github/agents/)
│       └── checkout-auto-handoff.md                # Checkout CI failure -> issue -> guarded @copilot fix PR
├── public/                                         # OctoShop storefront UI (HTML/CSS/JS)
├── scripts/
│   ├── seed-demo-repo.ps1                          # E-commerce label & issue seeder (PowerShell)
│   ├── seed-demo-repo.sh                           # E-commerce label & issue seeder (Bash)
│   └── validate-workflows.mjs                      # Zero-dependency gh-aw guardrail validator
├── src/
│   ├── catalog.mjs                                 # Products & promo codes (SAVE20, WELCOME10, FREESHIP)
│   ├── checkout.mjs                                # Cart totals, discounts, shipping & stock checks
│   └── server.mjs                                  # Zero-dependency Node HTTP server (npm start)
└── test/
    └── checkout.test.mjs                           # Built-in node:test checkout test suite
```
