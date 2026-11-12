# Demo: Getting Started — OctoShop Daily Repo Status Report

**Story**: We maintain **OctoShop** (`npm start`), an online developer-merch store preparing for a weekend flash sale. Standard CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) runs cart & promo-code unit tests, while our Getting-Started Agentic Workflow ([`.github/workflows/daily-repo-status.md`](../.github/workflows/daily-repo-status.md)) summarises **open issues, PRs, recent merges, and checkout blockers** into one morning GitHub Issue.

---

## 1. Before You Present (2-Minute Checklist)

1. **CLI Ready**:
   ```bash
   gh extension install github/gh-aw
   gh aw version
   ```
2. **Copilot Secret Set on Repo** (one-time):
   Create a [Fine-Grained PAT](https://github.com/settings/personal-access-tokens/new) with **Account permissions → Copilot Requests: Read-only**, then run:
   ```bash
   gh secret set COPILOT_GITHUB_TOKEN
   ```
   *(Or use org centralized billing `copilot-requests: write` via `gh aw add-wizard`.)*
3. **Issues & PRs Ready**:
   This repo already has open issues (`#1`–`#4`), a merged PR (`#5`), and an open PR (`#6`). If presenting on a fresh repo, seed them anytime with:
   ```bash
   ./scripts/seed-demo-repo.sh --repo "<owner>/<repo>"
   # PowerShell: ./scripts/seed-demo-repo.ps1 -Repo "<owner>/<repo>"
   ```

---

## 2. On-Stage Demo Script (8–10 mins)

### Act 1 — Show OctoShop + Contrast `ci.yml` vs `daily-repo-status.md` (3 mins)
1. *(Optional 20-sec hook)* Run `npm start` and open `http://localhost:3000` to show **OctoShop** (products, cart, `SAVE20` / `FREESHIP` promo codes, $100 free shipping).
2. Open [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):
   - *"Standard GitHub Actions (`E-Commerce CI`) is deterministic—great for `npm test` on cart math and stock limits."*
3. Open [`.github/workflows/daily-repo-status.md`](../.github/workflows/daily-repo-status.md) and point out two parts:
   - **Top (`---` YAML Frontmatter)**:
     - `on: schedule: daily` + `workflow_dispatch:`
     - `permissions:` **strictly read-only** (`contents: read`, `issues: read`, `pull-requests: read`) — the AI agent holds **zero write tokens**.
     - `safe-outputs: create-issue:` — a separate job with scoped `issues: write` creates `[daily-status] OctoShop Daily Report` and closes yesterday's status issue (`close-older-issues: true`).
   - **Bottom (Markdown Prompt)**:
     - Plain-English instructions to summarise **Storefront & Checkout Blockers**, **Open Issues**, **Open PRs**, and **Recent Merges** (or call `noop` if nothing is open).

### Act 2 — Show Compilation (`.md` → `.lock.yml`) (2 mins)
*(Note: `daily-repo-status.lock.yml` is already compiled and committed, or make a small prompt tweak live and re-compile!)*
```bash
# Validate tests & workflow guardrails locally
npm run verify

# Compile Markdown workflow into GitHub Actions lock file
gh aw compile daily-repo-status

# Commit .md + .lock.yml if you made an edit
git add .gitattributes .github/aw/ .github/workflows/
git commit -m "Update OctoShop daily repo status prompt"
git push
```

### Act 3 — Trigger Live & Open the Report Issue (3 mins)
```bash
gh aw run daily-repo-status
gh run watch
```
- Open the **Issues** tab on GitHub to show the new `[daily-status] OctoShop Daily Report` issue summarising `#1` (P0 duplicate-charge bug), `#2` (mobile cart bug), merged PR `#5`, and open PR `#6`!
- *(Stage backup while Actions runs ~90s: open [`demo/sample-daily-status-issue.md`](sample-daily-status-issue.md).)*

> **Bridge to Lab 2**: Mention `staged: true` under `safe-outputs:` — in Lab 2, every starter workflow starts with `staged: true` so attendees can preview outputs safely in the Actions Step Summary before creating real issues!
