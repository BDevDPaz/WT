import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();

const CLASSIFICATION_FILE = path.join(ROOT, 'VERSION_CLASSIFICATION.json');
const OUT_MD = path.join(ROOT, 'EXECUTION_COMPARISON.md');
const OUT_JSON = path.join(ROOT, 'EXECUTION_COMPARISON.json');

const DEFAULT_TIMEOUT_MS = Number(process.env.EXECUTION_TIMEOUT_MS || 15 * 60 * 1000);
const SCOPE = process.env.EXECUTION_SCOPE || 'high';
const ALLOW_NPM_SCRIPTS = process.env.ALLOW_NPM_SCRIPTS === '1';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function safeUnitName(unit) {
  return unit.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

function nowIso() {
  return new Date().toISOString();
}

function msToSeconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

function mdEscape(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function hasScript(projectRoot, scriptName) {
  const pkgPath = path.join(ROOT, projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return Boolean(pkg.scripts && pkg.scripts[scriptName]);
  } catch {
    return false;
  }
}

function runStep(projectRoot, stepName, command, args) {
  const cwd = path.join(ROOT, projectRoot);
  const startedAt = Date.now();

  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: DEFAULT_TIMEOUT_MS,
    env: {
      ...process.env,
      CI: 'true',
      npm_config_fund: 'false',
      npm_config_audit: 'false',
    },
  });

  const endedAt = Date.now();

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const combined = `${stdout}\n${stderr}`.trim();

  const timedOut = Boolean(result.error && result.error.code === 'ETIMEDOUT');
  const exitCode = typeof result.status === 'number' ? result.status : timedOut ? 124 : 1;

  return {
    stepName,
    command: [command, ...args].join(' '),
    exitCode,
    status: exitCode === 0 ? 'pass' : timedOut ? 'timeout' : 'fail',
    durationMs: endedAt - startedAt,
    outputTail: combined.split('\n').slice(-80).join('\n'),
  };
}

function skipped(stepName, reason) {
  return {
    stepName,
    command: '',
    exitCode: null,
    status: 'skipped',
    durationMs: 0,
    outputTail: reason,
  };
}

function npmInstallArgs(projectRoot) {
  const hasLock = fs.existsSync(path.join(ROOT, projectRoot, 'package-lock.json'));

  const args = hasLock ? ['ci'] : ['install'];

  if (!ALLOW_NPM_SCRIPTS) {
    args.push('--ignore-scripts');
  }

  return args;
}

function npmAudit(projectRoot) {
  const cwd = path.join(ROOT, projectRoot);
  const startedAt = Date.now();

  const result = spawnSync('npm', ['audit', '--audit-level=high', '--json'], {
    cwd,
    encoding: 'utf8',
    timeout: DEFAULT_TIMEOUT_MS,
    env: {
      ...process.env,
      CI: 'true',
      npm_config_fund: 'false',
    },
  });

  const endedAt = Date.now();

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  let parsed = null;

  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = null;
  }

  const metadata = parsed?.metadata?.vulnerabilities || null;
  const exitCode = typeof result.status === 'number' ? result.status : 1;

  return {
    stepName: 'npm audit high',
    command: 'npm audit --audit-level=high --json',
    exitCode,
    status: exitCode === 0 ? 'pass' : 'fail',
    durationMs: endedAt - startedAt,
    vulnerabilities: metadata,
    outputTail: `${stdout}\n${stderr}`.trim().split('\n').slice(-80).join('\n'),
  };
}

function selectUnits(classification) {
  let rows = classification.rows || [];

  if (SCOPE === 'all') {
    return rows;
  }

  if (SCOPE === 'candidates') {
    return rows.filter(row =>
      row.priority === 'high' ||
      row.officialType === 'legacy-validated-candidate'
    );
  }

  return rows.filter(row => row.priority === 'high');
}

const classification = readJson(CLASSIFICATION_FILE);
const selected = selectUnits(classification);

const results = [];

console.log(`Execution comparison started at ${nowIso()}`);
console.log(`Scope: ${SCOPE}`);
console.log(`Units selected: ${selected.length}`);
console.log(`NPM lifecycle scripts allowed: ${ALLOW_NPM_SCRIPTS ? 'yes' : 'no'}`);
console.log('');

for (const row of selected) {
  const unit = row.unit;
  const projectPath = path.join(ROOT, unit);

  console.log(`=== ${unit} ===`);

  const projectResult = {
    unit,
    officialType: row.officialType,
    priority: row.priority,
    structuralClass: row.structuralClass,
    startedAt: nowIso(),
    steps: [],
  };

  if (!fs.existsSync(path.join(projectPath, 'package.json'))) {
    projectResult.steps.push(skipped('install', 'No package.json found'));
    projectResult.finishedAt = nowIso();
    results.push(projectResult);
    continue;
  }

  const installArgs = npmInstallArgs(unit);
  console.log(`Running: npm ${installArgs.join(' ')}`);
  projectResult.steps.push(runStep(unit, 'install', 'npm', installArgs));

  if (hasScript(unit, 'typecheck')) {
    console.log('Running: npm run typecheck');
    projectResult.steps.push(runStep(unit, 'typecheck', 'npm', ['run', 'typecheck']));
  } else {
    projectResult.steps.push(skipped('typecheck', 'Script not found'));
  }

  if (hasScript(unit, 'lint')) {
    console.log('Running: npm run lint');
    projectResult.steps.push(runStep(unit, 'lint', 'npm', ['run', 'lint']));
  } else {
    projectResult.steps.push(skipped('lint', 'Script not found'));
  }

  if (hasScript(unit, 'test')) {
    console.log('Running: npm test');
    projectResult.steps.push(runStep(unit, 'test', 'npm', ['test', '--', '--runInBand']));
  } else {
    projectResult.steps.push(skipped('test', 'Script not found'));
  }

  if (hasScript(unit, 'gm')) {
    console.log('Running: npm run gm');
    projectResult.steps.push(runStep(unit, 'gm', 'npm', ['run', 'gm']));
  } else {
    projectResult.steps.push(skipped('gm', 'Script not found'));
  }

  console.log('Running: npm audit --audit-level=high --json');
  projectResult.steps.push(npmAudit(unit));

  projectResult.finishedAt = nowIso();

  const failures = projectResult.steps.filter(step => step.status === 'fail' || step.status === 'timeout');
  console.log(`Result: ${failures.length === 0 ? 'PASS' : 'FAIL'} (${failures.length} failing step(s))`);
  console.log('');

  results.push(projectResult);
}

const summaryRows = results.map(project => {
  const stepMap = new Map(project.steps.map(step => [step.stepName, step]));
  const failing = project.steps.filter(step => step.status === 'fail' || step.status === 'timeout');
  const passed = project.steps.filter(step => step.status === 'pass');

  return {
    unit: project.unit,
    officialType: project.officialType,
    priority: project.priority,
    structuralClass: project.structuralClass,
    overall: failing.length === 0 ? 'pass' : 'fail',
    passedSteps: passed.length,
    failingSteps: failing.length,
    install: stepMap.get('install')?.status || '',
    typecheck: stepMap.get('typecheck')?.status || '',
    lint: stepMap.get('lint')?.status || '',
    test: stepMap.get('test')?.status || '',
    gm: stepMap.get('gm')?.status || '',
    audit: stepMap.get('npm audit high')?.status || '',
    auditVulnerabilities: stepMap.get('npm audit high')?.vulnerabilities || null,
  };
});

const jsonOut = {
  generatedAt: nowIso(),
  scope: SCOPE,
  timeoutMs: DEFAULT_TIMEOUT_MS,
  allowNpmScripts: ALLOW_NPM_SCRIPTS,
  selectedUnits: selected.map(row => row.unit),
  summary: summaryRows,
  results,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(jsonOut, null, 2));

let md = '';

md += '# Execution Comparison\n\n';
md += 'Executable validation report for selected preserved project units.\n\n';

md += '## Run Configuration\n\n';
md += `- Generated at: ${jsonOut.generatedAt}\n`;
md += `- Scope: \`${SCOPE}\`\n`;
md += `- Timeout per step: ${DEFAULT_TIMEOUT_MS} ms\n`;
md += `- NPM lifecycle scripts allowed during install: ${ALLOW_NPM_SCRIPTS ? 'yes' : 'no'}\n`;
md += `- Units selected: ${selected.length}\n\n`;

md += '## Summary\n\n';
md += '| Unit | Overall | Type | Install | Typecheck | Lint | Test | GM | npm audit high |\n';
md += '|---|---:|---:|---:|---:|---:|---:|---:|---:|\n';

for (const row of summaryRows) {
  md += `| ${mdEscape(row.unit)} | ${row.overall} | ${row.officialType} | ${row.install} | ${row.typecheck} | ${row.lint} | ${row.test} | ${row.gm} | ${row.audit} |\n`;
}

md += '\n## Details\n\n';

for (const project of results) {
  md += `### ${project.unit}\n\n`;
  md += `- Official type: ${project.officialType}\n`;
  md += `- Priority: ${project.priority}\n`;
  md += `- Structural class: ${project.structuralClass}\n\n`;

  md += '| Step | Status | Exit code | Duration | Command |\n';
  md += '|---|---:|---:|---:|---|\n';

  for (const step of project.steps) {
    md += `| ${step.stepName} | ${step.status} | ${step.exitCode ?? ''} | ${msToSeconds(step.durationMs)} | \`${mdEscape(step.command)}\` |\n`;
  }

  const failedSteps = project.steps.filter(step => step.status === 'fail' || step.status === 'timeout');

  if (failedSteps.length > 0) {
    md += '\n#### Failure output tails\n\n';

    for (const step of failedSteps) {
      md += `<details><summary>${step.stepName}</summary>\n\n`;
      md += '```text\n';
      md += `${step.outputTail || 'No output captured'}\n`;
      md += '```\n\n';
      md += '</details>\n\n';
    }
  }

  md += '\n';
}

md += '## Notes\n\n';
md += '- This report is executable evidence, but it is environment-dependent.\n';
md += '- Install uses `npm ci` when `package-lock.json` exists, otherwise `npm install`.\n';
md += '- By default install uses `--ignore-scripts`. Set `ALLOW_NPM_SCRIPTS=1` to allow lifecycle scripts.\n';
md += '- Generated `node_modules` folders are ignored by repository `.gitignore`.\n';

fs.writeFileSync(OUT_MD, md);

console.log('Wrote EXECUTION_COMPARISON.md');
console.log('Wrote EXECUTION_COMPARISON.json');
