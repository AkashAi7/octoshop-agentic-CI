import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const ALLOWED_SAFE_OUTPUT_KEYS = new Set([
	'staged',
	'mentions',
	'allowed-domains',
	'allowed-github-references',
	'max-bot-mentions',
	'max-patch-size',
	'report-failure-as-issue',
	'report-failed-jobs',
	'failure-issue-repo',
	'group-reports',
	'github-token',
	'github-app',
	'environment',
	'needs',
	'data',
	'runs-on',
	'concurrency-group',
	'messages',
	'jobs',
	'actions',
	'steer',
	'noop',
	'report-missing-tool',
	'report-missing-data',
	'create-issue',
	'update-issue',
	'close-issue',
	'link-sub-issue',
	'create-discussion',
	'update-discussion',
	'close-discussion',
	'create-pull-request',
	'update-pull-request',
	'close-pull-request',
	'approve-workflow-run',
	'merge-pull-request',
	'create-pull-request-review-comment',
	'reply-to-pull-request-review-comment',
	'resolve-pull-request-review-thread',
	'submit-pull-request-review',
	'add-reviewer',
	'push-to-pull-request-branch',
	'add-comment',
	'hide-comment',
	'add-labels',
	'remove-labels',
	'assign-milestone',
	'assign-to-agent',
	'assign-to-user',
	'unassign-from-user',
	'set-issue-type',
	'set-issue-field',
	'create-project',
	'update-project',
	'create-project-status-update',
	'update-release',
	'create-security-advisory',
	'add-security-advisory-comment',
	'upload-artifact',
	'upload-asset',
	'dispatch-workflow',
	'call-workflow',
	'dispatch-repository',
	'create-code-scanning-alert',
	'autofix-code-scanning-alert',
	'create-check-run',
	'create-agent-session',
]);

const WRITE_ONLY_AGENT_SCOPES = new Set(['copilot-requests', 'id-token']);

function collectWorkflowMarkdownFiles() {
	const files = [];
	const dirs = [
		path.join(repoRoot, '.github', 'workflows'),
		path.join(repoRoot, 'lab-2', 'starter-workflows'),
		path.join(repoRoot, 'lab-2', 'advanced-automation'),
	];

	for (const dir of dirs) {
		if (!fs.existsSync(dir)) continue;
		for (const entry of fs.readdirSync(dir)) {
			if (entry.endsWith('.md') && !entry.endsWith('.agent.md') && entry.toLowerCase() !== 'readme.md') {
				files.push(path.join(dir, entry));
			}
		}
	}
	return files;
}

function splitFrontmatter(raw) {
	const normalized = raw.replace(/\r\n/g, '\n');
	if (!normalized.startsWith('---\n')) return null;
	const closingIdx = normalized.indexOf('\n---\n', 4);
	if (closingIdx === -1) return null;
	return {
		frontmatterRaw: normalized.slice(4, closingIdx),
		body: normalized.slice(closingIdx + 5),
	};
}

function extractIndentedSection(frontmatterRaw, topKey) {
	const lines = frontmatterRaw.split('\n');
	const sectionLines = [];
	let inside = false;

	for (const line of lines) {
		if (!inside) {
			if (new RegExp(`^${topKey}:(\\s*#.*|\\s*)$`).test(line)) {
				inside = true;
			}
			continue;
		}
		if (/^\S/.test(line) && !line.trim().startsWith('#')) {
			break;
		}
		sectionLines.push(line);
	}
	return sectionLines;
}

function validateWorkflowFile(filePath) {
	const relPath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
	const raw = fs.readFileSync(filePath, 'utf8');
	const errors = [];
	const warnings = [];

	const parts = splitFrontmatter(raw);
	if (!parts) {
		errors.push('Missing YAML frontmatter delimited by `---` markers.');
		return { relPath, errors, warnings };
	}

	const { frontmatterRaw, body } = parts;

	if (/\t/.test(frontmatterRaw)) {
		errors.push('YAML frontmatter contains tab characters; use 2-space indentation.');
	}

	if (!/^on:/m.test(frontmatterRaw)) {
		errors.push('Frontmatter must declare an `on:` trigger block.');
	}

	if (/^\s*pull_request_target\s*:/m.test(frontmatterRaw) && !/^checkout:\s*false\b/m.test(frontmatterRaw)) {
		errors.push('`pull_request_target` without `checkout: false` detected; prefer `pull_request`.');
	}

	const onLines = extractIndentedSection(frontmatterRaw, 'on');
	if (onLines.some((line) => /^\s{2}workflow_run\s*:/.test(line)) && !onLines.some((line) => /^\s{4}branches\s*:/.test(line))) {
		errors.push('`workflow_run` must declare an explicit `branches:` list (e.g., `branches: [main]`) per CTR-021.');
	}

	const permLines = extractIndentedSection(frontmatterRaw, 'permissions');
	if (permLines.length === 0) {
		errors.push('Frontmatter must declare explicit read-only `permissions:` for the agent job.');
	} else {
		for (const line of permLines) {
			const match = line.match(/^\s{2}([a-z-]+)\s*:\s*(\S+)/);
			if (match) {
				const [, scope, level] = match;
				if (level === 'write' && !WRITE_ONLY_AGENT_SCOPES.has(scope)) {
					errors.push(`Agent permission \`${scope}: write\` violates least-privilege; use \`safe-outputs:\` instead.`);
				}
			}
		}
	}

	const envLines = extractIndentedSection(frontmatterRaw, 'env');
	for (const line of envLines) {
		if (line.includes('secrets.')) {
			errors.push('Top-level `env:` references `secrets.*`, exposing secrets inside the agent container.');
		}
	}

	const safeOutputLines = extractIndentedSection(frontmatterRaw, 'safe-outputs');
	if (safeOutputLines.length === 0) {
		warnings.push('No `safe-outputs:` block declared (default `create-issue` will be auto-injected).');
	} else {
		for (const line of safeOutputLines) {
			const keyMatch = line.match(/^\s{2}([a-z-]+)\s*:/);
			if (keyMatch && !ALLOWED_SAFE_OUTPUT_KEYS.has(keyMatch[1])) {
				errors.push(`Unknown \`safe-outputs\` key: \`${keyMatch[1]}\`.`);
			}
		}
	}

	if (!/\bnoop\b/i.test(body)) {
		errors.push('Markdown prompt should tell the agent when to call `noop` to prevent `missing_safe_outputs` failures.');
	}

	return { relPath, errors, warnings };
}

let hasErrors = false;
const gitattributesPath = path.join(repoRoot, '.gitattributes');
if (!fs.existsSync(gitattributesPath) || !fs.readFileSync(gitattributesPath, 'utf8').includes('linguist-generated=true')) {
	console.error('✗ .gitattributes should mark `.github/workflows/*.lock.yml linguist-generated=true`.');
	hasErrors = true;
}

const files = collectWorkflowMarkdownFiles();
console.log(`Validating ${files.length} GitHub Agentic Workflow (.md) file(s)...\n`);

for (const file of files) {
	const result = validateWorkflowFile(file);
	if (result.errors.length === 0) {
		console.log(`✓ ${result.relPath}${result.warnings.length ? ` (${result.warnings.length} warning)` : ''}`);
		for (const w of result.warnings) console.log(`    ⚠ ${w}`);
	} else {
		hasErrors = true;
		console.error(`✗ ${result.relPath}`);
		for (const e of result.errors) console.error(`    ✗ ${e}`);
	}
}

if (hasErrors) {
	process.exitCode = 1;
} else {
	console.log('\nAll Agentic Workflow files passed frontmatter and security checks.');
}
