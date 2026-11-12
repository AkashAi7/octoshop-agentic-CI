# Demo: Getting Started — OctoShop Daily Repo Status Report

**Story**: We maintain **OctoShop** (`npm start`), an online developer-merch store preparing for a weekend flash sale. Standard CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) runs cart & promo-code unit tests, while our Getting-Started Agentic Workflow ([`.github/workflows/daily-repo-status.md`](../.github/workflows/daily-repo-status.md)) summarises **open issues, PRs, recent merges, and checkout blockers** into one morning GitHub Issue.

---

## 1. Before You Present (One-Time Repo Setup)

```bash
# 1. Install the GitHub Agentic Workflows CLI extension
gh extension install github/gh-aw
gh aw version

# 2. Authenticate Copilot for GitHub Actions (choose one):
#    - Org Copilot centralized billing: handled via `gh aw add-wizard` (`copilot-requests: write`)
#    - Fine-grained PAT (Account permission -> Copilot Requests: Read):
gh secret set COPILOT_GITHUB_TOKEN < token.txt

# 3. Seed realistic OctoShop e-commerce issues & checkout blockers into your repo
./scripts/seed-demo-repo.sh --repo "<owner>/<repo>"
# Or on PowerShell:
# ./scripts/seed-demo-repo.ps1 -Repo "<owner>/<repo>"
```

---

## 2. Live Demo Flow (8–10 mins)

### Step 1 — Show OctoShop + Contrast `ci.yml` vs `daily-repo-status.md` (3 mins)
1. *(Optional 20-sec context)* Run `npm start` and open `http://localhost:3000` to show **OctoShop** (product catalog, cart, `SAVE20` / `FREESHIP` promo codes, $100 free-shipping threshold).
2. Open [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):
   - *"Standard GitHub Actions (`E-Commerce CI`) is deterministic—perfect for running `npm test` on cart math and stock limits."*
3. Open [`.github/workflows/daily-repo-status.md`](../.github/workflows/daily-repo-status.md):
   - **YAML Frontmatter (`---`)**:
     - `on: schedule: daily` + `workflow_dispatch:`.
     - `permissions:` **strictly read-only** (`contents: read`, `issues: read`, `pull-requests: read`). Even if someone files an issue with prompt injection, the agent has zero write tokens.
     - `safe-outputs: create-issue:` — a separate downstream job with scoped `issues: write` publishes `[daily-status] OctoShop Daily Report` and closes yesterday's status issue (`close-older-issues: true`).
   - **Markdown Body**:
     - Plain-English instructions to surface **Storefront & Checkout Blockers**, **Open Issues**, **Open PRs**, and **Recent Merges** (or call `noop` if nothing is open).

### Step 2 — Compile `.md` → `.lock.yml` & Push (2 mins)
```bash
# Run unit tests & validate workflow guardrails locally
npm run verify

# Compile Markdown workflow into GitHub Actions lock file
gh aw compile daily-repo-status

# Commit both the .md source and .lock.yml lock file
git add .gitattributes .github/workflows/daily-repo-status.md .github/workflows/daily-repo-status.lock.yml
git commit -m "Add OctoShop daily repo status agentic workflow"
git push
```

### Step 3 — Trigger & Inspect the Generated Issue (3 mins)
```bash
gh aw run daily-repo-status
gh run watch
```
- Open the **Issues** tab on GitHub to show `[daily-status] OctoShop Daily Report` highlighting the P0 duplicate-charge checkout bug, mobile cart overlap, stalled PR review, and recent storefront merges!
- *(Backup while Actions runs: open [`demo/sample-daily-status-issue.md`](sample-daily-status-issue.md).)*

> **Tip to Mention Before Lab 2**: Adding `staged: true` under `safe-outputs:` lets anyone dry-run an Agentic Workflow safely—it previews the generated issue in the GitHub Actions Step Summary with zero repo writes!
