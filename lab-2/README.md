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

## Before You Start (3-Minute Checklist)

1. **Choose where to work**:
   - **Option A (Recommended)**: **Fork** this **OctoShop** repo and open it in **GitHub Codespaces** (`Code → Codespaces → Create codespace on main`) or clone locally.
   - **Option B (Bring Your Own Repo)**: Use any repository you own that already has a GitHub Actions `.yml` workflow.
2. **Enable GitHub Actions on your fork**:
   - On GitHub.com, open your fork's **Actions** tab and click **"I understand my workflows, go ahead and enable them"** *(GitHub disables workflows on new forks until clicked)*.
3. **Set your Copilot secret** (if not already set):
   - Create a [Fine-Grained PAT](https://github.com/settings/personal-access-tokens/new) with **Account permissions → Copilot Requests: Read-only**, then run:
     ```bash
     gh secret set COPILOT_GITHUB_TOKEN
     ```
4. **Verify `gh-aw` is installed** *(already pre-installed in Codespaces)*:
   ```bash
   gh aw version
   # If not installed locally (Linux / macOS / WSL): gh extension install github/gh-aw
   ```

---

## Path 1: Get Started — Pair an Agentic Workflow with `E-Commerce CI`

### Step 1 — Copy One Starter into `.github/workflows/`
Copy **[`ci-failure-explainer.md`](starter-workflows/ci-failure-explainer.md)**, which watches `E-Commerce CI` and explains checkout/cart test failures in plain English:

```bash
cp lab-2/starter-workflows/ci-failure-explainer.md .github/workflows/ci-failure-explainer.md
```
*(PowerShell: `Copy-Item lab-2/starter-workflows/ci-failure-explainer.md .github/workflows/ci-failure-explainer.md`)*

> **Using your own repo instead of OctoShop?** Open `.github/workflows/ci-failure-explainer.md` and change `workflows: ["E-Commerce CI"]` and `branches: [main]` to match your own workflow's `name:` and default branch, and add `.github/workflows/*.lock.yml linguist-generated=true` to `.gitattributes`.

### Step 2 — Review `staged: true` & Customize the Prompt
Open `.github/workflows/ci-failure-explainer.md`:
- Notice `staged: true` under `safe-outputs:` — **leave this on for your first run!** It runs a 100% safe dry-run and renders a preview in the GitHub Actions **Step Summary** without creating real issues yet.
- Optional: Edit the Markdown bullets at the bottom to customize how the report formats **What Broke**, **Customer Impact**, and **Suggested Fix**.

### Step 3 — Validate, Compile & Push
```bash
# 1. Run OctoShop unit tests & check workflow guardrails locally (if in OctoShop)
npm run verify

# 2. Compile .md -> .lock.yml (also generates agentics-maintenance.yml for 7d issue expiry)
gh aw compile ci-failure-explainer

# 3. Commit & push all generated workflow files
git add .gitattributes .github/aw/ .github/workflows/
git commit -m "Add OctoShop ci-failure-explainer agentic workflow"
git push
```

### Step 4 — Trigger a Simulated Checkout Bug & Check the Preview
Trigger `E-Commerce CI` with `simulate_checkout_bug=true` so it fails on purpose (~10s), which automatically triggers **ci-failure-explainer** via `workflow_run`:

```bash
# 1. Trigger a failing E-Commerce CI run on main
gh workflow run ci.yml -f simulate_checkout_bug=true

# 2. Watch E-Commerce CI fail (~10s), then open Actions -> "ci-failure-explainer"
gh run watch
```
Now open your repository's **Actions** tab on GitHub:
1. Click the **`ci-failure-explainer`** workflow run that started right after `E-Commerce CI` failed.
2. Scroll down to the **Step Summary** to read the **Staged Mode Preview** of the root-cause issue!

### Step 5 — Flip from Preview to Live Issue Creation!
1. Open `.github/workflows/ci-failure-explainer.md` and delete the line `staged: true`.
2. Ensure the `ci-failure` and `checkout` labels exist on your fork:
   ```bash
   ./scripts/seed-demo-repo.sh --repo "<your-username>/<your-fork>" --labels-only
   ```
3. Re-compile, push, and trigger the simulated checkout failure again:
   ```bash
   gh aw compile ci-failure-explainer
   git add .github/workflows/
   git commit -m "Enable live issue creation for ci-failure-explainer"
   git push
   gh workflow run ci.yml -f simulate_checkout_bug=true
   ```
4. Check your **Issues** tab in ~2 minutes to see the newly created `[ci-explainer]` bug report!

> **Try Another Starter**: Want to test PR review or issue triage next? Repeat Steps 1–3 with [`checkout-pr-review.md`](starter-workflows/checkout-pr-review.md) or [`storefront-issue-triage.md`](starter-workflows/storefront-issue-triage.md)!

---

## Path 2: Go Deeper — Multi-Step `@copilot` Checkout Automation

Chain **deterministic test capture (0 AI credits) + a custom `.agent.md` responder + automatic `@copilot` draft PR handoff**:

1. Copy both files from [`lab-2/advanced-automation/`](advanced-automation/):
   ```bash
   mkdir -p .github/agents
   cp lab-2/advanced-automation/checkout-responder.agent.md .github/agents/checkout-responder.agent.md
   cp lab-2/advanced-automation/checkout-auto-handoff.md .github/workflows/checkout-auto-handoff.md
   ```
2. Open `.github/workflows/checkout-auto-handoff.md` to see the 3 stages:
   - **Stage 1 (`steps:`)**: Captures `npm test` output (or simulates a `SAVE20` promo bug) into `/tmp/gh-aw/agent/ci-telemetry.txt` at **zero AI credit cost**.
   - **Stage 2 (`.github/agents/checkout-responder.agent.md`)**: Separates safe `copilot-ready` pricing/catalog bugs from `needs-maintainer` payment/workflow changes.
   - **Stage 3 (`safe-outputs:`)**: Chains `create_issue` → `add_labels` (`copilot-ready`) → `assign_to_agent` (`copilot`) via `"depends-on"` so `@copilot` is only assigned if issue creation succeeds!
3. Validate, compile, push, and trigger a dry-run preview:
   ```bash
   npm run verify
   gh aw compile checkout-auto-handoff
   git add .gitattributes .github/agents/ .github/aw/ .github/workflows/
   git commit -m "Add OctoShop checkout auto-handoff automation"
   git push
   gh aw run checkout-auto-handoff -f simulate_failure=true
   ```
4. Inspect the **Step Summary** preview in the **Actions** tab. To run live, remove `staged: true`, ensure labels exist (`./scripts/seed-demo-repo.sh --repo "<your-username>/<your-fork>" --labels-only`), re-run `gh aw compile checkout-auto-handoff`, push, and watch `@copilot` pick up the issue to draft a fix PR!

---

## Quick Verification Checklist

- [ ] Both `.md` and `.lock.yml` are committed in `.github/workflows/`.
- [ ] Top-level `permissions:` only use `read` (`contents: read`, `issues: read`, `actions: read`, `pull-requests: read`).
- [ ] All GitHub writes happen through `safe-outputs:`.
- [ ] The Markdown prompt includes a `noop` instruction for green/quiet runs.
