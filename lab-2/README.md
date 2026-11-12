# Lab 2: Try an Agentic Workflow on OctoShop (or Against Your Own Workflow)

**Time**: 35–45 minutes  
**Goal**: Experiment hands-on by adding **one Agentic Workflow** alongside **OctoShop's** existing [`E-Commerce CI`](../.github/workflows/ci.yml) workflow (or against a workflow in your own repository)—or go deeper with a multi-step `@copilot` checkout-fix automation.

---

## Choose Your Path

| Path | Best For | Starter Files |
|---|---|---|
| **Path 1 (Getting Started): Add One Agentic Workflow Against Your Workflow** | Trying your first `gh-aw` workflow alongside `E-Commerce CI` (or your own repo's CI) in ~15–20 mins | [`starter-workflows/ci-failure-explainer.md`](starter-workflows/ci-failure-explainer.md) *(watches `E-Commerce CI` & explains checkout test failures)*<br>[`starter-workflows/checkout-pr-review.md`](starter-workflows/checkout-pr-review.md) *(audits PRs for pricing/promo/stock bugs)*<br>[`starter-workflows/storefront-issue-triage.md`](starter-workflows/storefront-issue-triage.md) *(triages customer issues into `checkout` / `cart` / `catalog`)* |
| **Path 2 (Go Deeper): Build a Complex Copilot Automation** | Chaining deterministic checkout telemetry + a custom `.agent.md` + guarded `@copilot` coding-agent PR handoff | [`advanced-automation/checkout-responder.agent.md`](advanced-automation/checkout-responder.agent.md)<br>[`advanced-automation/checkout-auto-handoff.md`](advanced-automation/checkout-auto-handoff.md) |

---

## Prerequisites (5 mins)

1. Pick your target repository:
   - **Option A**: Fork this **OctoShop** repository (it already includes [`E-Commerce CI`](../.github/workflows/ci.yml) with a one-click `simulate_checkout_bug` input—and a `.devcontainer` if you click **Open in Codespaces**!).
   - **Option B**: Use one of your own GitHub repositories that already has a GitHub Actions build/test workflow!
2. Install the `gh-aw` CLI extension (pre-installed in GitHub Codespaces, or run on Linux / macOS / Windows WSL):
   ```bash
   gh extension install github/gh-aw
   gh aw version
   ```
3. Configure Copilot authentication on your fork/repo (either org `copilot-requests: write` via `gh aw add-wizard`, or a fine-grained PAT with **Copilot Requests: Read** saved as secret `COPILOT_GITHUB_TOKEN`).

---

## Path 1: Get Started — Pair an Agentic Workflow with `E-Commerce CI`

### Step 1 — Copy One Starter into `.github/workflows/`
Start with **[`ci-failure-explainer.md`](starter-workflows/ci-failure-explainer.md)**, which watches `E-Commerce CI` and opens a plain-English explanation issue whenever cart/checkout tests fail:

```bash
cp lab-2/starter-workflows/ci-failure-explainer.md .github/workflows/ci-failure-explainer.md
```
*(Or on PowerShell: `Copy-Item lab-2/starter-workflows/ci-failure-explainer.md .github/workflows/ci-failure-explainer.md`)*

> **Using your own repo?** Open `.github/workflows/ci-failure-explainer.md` and change `workflows: ["E-Commerce CI"]` on line 9 to match the `name:` at the top of your own `.github/workflows/*.yml` file. Also add `.github/workflows/*.lock.yml linguist-generated=true` to `.gitattributes`.

### Step 2 — Inspect `staged: true` & Customize the Prompt
Open `.github/workflows/ci-failure-explainer.md`:
- Notice `staged: true` is turned **on** under `safe-outputs:`—your first run is a **100% safe dry-run** that previews the proposed issue inside the GitHub Actions Step Summary without writing any real issues yet.
- Customize the Markdown instructions if you want the report to highlight specific areas (e.g., promo codes in `src/catalog.mjs` or tax/shipping rules in `src/checkout.mjs`).

### Step 3 — Validate, Compile & Push
```bash
# Run OctoShop unit tests & check workflow guardrails locally:
npm run verify

# Compile .md -> .lock.yml
gh aw compile ci-failure-explainer

# Commit BOTH the .md file and the generated .lock.yml file
git add .gitattributes .github/workflows/ci-failure-explainer.md .github/workflows/ci-failure-explainer.lock.yml
git commit -m "Add OctoShop ci-failure-explainer agentic workflow"
git push
```

### Step 4 — Trigger a Simulated Checkout Bug & Preview (`staged: true`)
Trigger `E-Commerce CI` with its built-in `simulate_checkout_bug=true` input so it fails on purpose and automatically triggers your `ci-failure-explainer` workflow via `workflow_run`:
```bash
gh workflow run ci.yml -f simulate_checkout_bug=true
gh run watch
```
Open the `ci-failure-explainer` run in your repository's **Actions** tab and check the **Step Summary** to inspect the staged root-cause preview!

### Step 5 — Go Live!
1. Remove `staged: true` from `.github/workflows/ci-failure-explainer.md`.
2. Ensure the `ci-failure` and `checkout` labels exist in your repo:
   ```bash
   ./scripts/seed-demo-repo.sh --repo "<owner>/<repo>" --labels-only
   ```
3. Re-compile (`gh aw compile ci-failure-explainer`), commit both `.md` and `.lock.yml`, push, and trigger `gh workflow run ci.yml -f simulate_checkout_bug=true` once more to watch it create a real GitHub Issue!

---

## Path 2: Build a More Complex Copilot Automation

Ready to chain **deterministic checkout test telemetry + a custom responder agent + automatic `@copilot` PR creation**?

1. Copy both files from [`lab-2/advanced-automation/`](advanced-automation/):
   ```bash
   mkdir -p .github/agents
   cp lab-2/advanced-automation/checkout-responder.agent.md .github/agents/checkout-responder.agent.md
   cp lab-2/advanced-automation/checkout-auto-handoff.md .github/workflows/checkout-auto-handoff.md
   ```
2. Open `.github/workflows/checkout-auto-handoff.md` to see how the 3 stages connect:
   - **Stage 1 (`steps:`)**: Runs `npm test` (or simulates a `SAVE20` promo-code bug via `simulate_failure: true`) into `/tmp/gh-aw/agent/ci-telemetry.txt` at **zero AI credit cost**.
   - **Stage 2 (`.github/agents/checkout-responder.agent.md`)**: Shared rubric separating safe `copilot-ready` pricing/catalog bugs from `needs-maintainer` payment/workflow changes.
   - **Stage 3 (`safe-outputs:`)**: Chains `create_issue` → `add_labels` (`copilot-ready`) → `assign_to_agent` (`copilot`) using `"depends-on"` so `@copilot` is only assigned if issue creation succeeds!
3. Validate, compile, and run:
   ```bash
   npm run verify
   gh aw compile checkout-auto-handoff
   git add .gitattributes .github/agents/checkout-responder.agent.md .github/workflows/checkout-auto-handoff.*
   git commit -m "Add OctoShop checkout auto-handoff automation"
   git push
   gh aw run checkout-auto-handoff -f simulate_failure=true
   ```
4. Once you inspect the Step Summary preview, remove `staged: true`, provision labels (`./scripts/seed-demo-repo.sh --repo "<owner>/<repo>" --labels-only`), recompile, and watch `@copilot` open a draft PR to fix the checkout bug!

---

## Quick Verification Checklist

- [ ] Both `.md` and `.lock.yml` are committed in `.github/workflows/`.
- [ ] Top-level `permissions:` only use `read` (`contents: read`, `issues: read`, `actions: read`, `pull-requests: read`).
- [ ] All GitHub writes happen through `safe-outputs:`.
- [ ] The Markdown prompt includes a `noop` instruction for green/quiet runs.
