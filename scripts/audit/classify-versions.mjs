import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function writeFile(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content);
}

function mdEscape(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

function pct(value) {
  if (!Number.isFinite(value)) return '';
  return `${(value * 100).toFixed(1)}%`;
}

function scriptYes(row, scriptName) {
  return row.scripts?.includes(scriptName) || false;
}

const structure = readJson('STRUCTURE_COMPARISON.json');
const projects = readJson('PROJECT_UNITS_COMPARISON.json');
const hash = readJson('HASH_DIFF_ANALYSIS.json');

const exactDuplicateMap = new Map();

for (const pair of hash.exactDuplicateUnitPairs || []) {
  if (!exactDuplicateMap.has(pair.a)) exactDuplicateMap.set(pair.a, []);
  if (!exactDuplicateMap.has(pair.b)) exactDuplicateMap.set(pair.b, []);
  exactDuplicateMap.get(pair.a).push(pair.b);
  exactDuplicateMap.get(pair.b).push(pair.a);
}

const closestMap = new Map();

for (const pair of hash.pairwise || []) {
  for (const [unit, other] of [[pair.a, pair.b], [pair.b, pair.a]]) {
    const current = closestMap.get(unit);

    const score = Math.max(
      pair.exactPathHashJaccard || 0,
      pair.pathJaccard || 0,
      pair.contentHashJaccard || 0
    );

    if (!current || score > current.score) {
      closestMap.set(unit, {
        other,
        score,
        exactPathHashJaccard: pair.exactPathHashJaccard || 0,
        pathJaccard: pair.pathJaccard || 0,
        contentHashJaccard: pair.contentHashJaccard || 0,
        changedSamePathCount: pair.changedSamePathCount || 0,
        onlyInACount: unit === pair.a ? pair.onlyInACount : pair.onlyInBCount,
        onlyInBCount: unit === pair.a ? pair.onlyInBCount : pair.onlyInACount,
      });
    }
  }
}

const uniqueMap = new Map();

for (const item of hash.uniqueFilesByUnit || []) {
  uniqueMap.set(item.unit, item);
}

function classifyProject(row) {
  const unit = row.projectRoot;
  const exactDuplicates = exactDuplicateMap.get(unit) || [];
  const closest = closestMap.get(unit);
  const unique = uniqueMap.get(unit);

  const hasGm = scriptYes(row, 'gm');
  const hasTypecheck = scriptYes(row, 'typecheck');
  const hasTest = scriptYes(row, 'test');

  const isExecutableCandidate = hasGm && hasTypecheck && hasTest;

  if (exactDuplicates.length > 0) {
    return {
      type: 'duplicate-exact',
      relation: `Exact duplicate of ${exactDuplicates.join(', ')}`,
      action: 'Preserve as historical duplicate. Do not merge or delete until human review confirms identity and purpose.',
      priority: 'low',
    };
  }

  if (unit === 'docs' || unit.startsWith('docs/')) {
    return {
      type: 'documentation-or-patch-unit',
      relation: closest ? `Closest to ${closest.other}` : '',
      action: 'Preserve as documentation, patch evidence, or session artifact. Do not use as baseline app.',
      priority: 'low',
    };
  }

  if (unit === 'w-tracker-scaffold_0603') {
    return {
      type: 'frontend-scaffold',
      relation: closest ? `Closest to ${closest.other}` : '',
      action: 'Preserve as UI scaffold or donor reference. Do not use as executable baseline.',
      priority: 'medium',
    };
  }

  if (unit === 'WTracker_F') {
    return {
      type: 'ui-donor',
      relation: closest ? `Closest to ${closest.other}` : '',
      action: 'Review as UX/UI donor, especially session and report screens. Do not use as baseline without services/database validation.',
      priority: 'medium',
    };
  }

  if (
    row.classification === 'modern-core-app' ||
    row.classification === 'engine-audit-app' ||
    row.classification === 'core-architecture-app'
  ) {
    return {
      type: isExecutableCandidate ? 'baseline-candidate' : 'architecture-candidate',
      relation: closest ? `Closest to ${closest.other}` : '',
      action: 'Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing.',
      priority: 'high',
    };
  }

  if (row.classification === 'legacy-expo-app' && isExecutableCandidate) {
    return {
      type: 'legacy-validated-candidate',
      relation: closest ? `Closest to ${closest.other}` : '',
      action: 'Run executable validation and compare with modern candidates. Preserve as possible donor or fallback baseline.',
      priority: 'medium',
    };
  }

  if (row.classification === 'legacy-expo-app') {
    return {
      type: 'legacy-snapshot',
      relation: closest ? `Closest to ${closest.other}` : '',
      action: 'Archive as historical version. Compare only if it contains unique business logic or config.',
      priority: 'low',
    };
  }

  if (row.classification === 'early-expo-app') {
    return {
      type: 'early-historical-version',
      relation: closest ? `Closest to ${closest.other}` : '',
      action: 'Preserve for historical traceability and simple logic reference. Not a baseline candidate.',
      priority: 'low',
    };
  }

  return {
    type: 'unclassified-project',
    relation: closest ? `Closest to ${closest.other}` : '',
    action: 'Review manually before deciding role.',
    priority: 'medium',
  };
}

const rows = [];

for (const row of projects.rows) {
  const classification = classifyProject(row);
  const closest = closestMap.get(row.projectRoot);
  const unique = uniqueMap.get(row.projectRoot);

  rows.push({
    unit: row.projectRoot,
    packageName: row.name,
    version: row.version,
    structuralClass: row.classification,
    officialType: classification.type,
    priority: classification.priority,
    relation: classification.relation,
    action: classification.action,
    files: row.counts.files,
    tests: row.counts.tests,
    ts: row.counts.ts,
    js: row.counts.js,
    hasGm: scriptYes(row, 'gm'),
    hasTypecheck: scriptYes(row, 'typecheck'),
    hasTest: scriptYes(row, 'test'),
    uniqueFiles: unique?.uniqueFileCount ?? null,
    uniqueRatio: unique?.uniqueRatio ?? null,
    closestUnit: closest?.other ?? '',
    samePathHashSimilarity: closest?.exactPathHashJaccard ?? null,
    pathSimilarity: closest?.pathJaccard ?? null,
    contentSimilarity: closest?.contentHashJaccard ?? null,
    exactDuplicates: exactDuplicateMap.get(row.projectRoot) || [],
  });
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

rows.sort((a, b) => {
  return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99) ||
    a.officialType.localeCompare(b.officialType) ||
    a.unit.localeCompare(b.unit);
});

const jsonOut = {
  generatedAt: new Date().toISOString(),
  sourceReports: [
    'STRUCTURE_COMPARISON.json',
    'PROJECT_UNITS_COMPARISON.json',
    'HASH_DIFF_ANALYSIS.json',
  ],
  totalUnits: rows.length,
  rows,
};

writeFile('VERSION_CLASSIFICATION.json', JSON.stringify(jsonOut, null, 2));

let md = '';

md += '# Version Classification\n\n';
md += 'Official classification matrix for preserved project units in this repository.\n\n';

md += '## Classification Rules\n\n';
md += '- `baseline-candidate`: structurally strong project with `gm`, `typecheck`, and `test` scripts.\n';
md += '- `architecture-candidate`: structurally strong project, but executable validation is still required.\n';
md += '- `legacy-validated-candidate`: older Expo app with validation scripts available.\n';
md += '- `legacy-snapshot`: historical Expo snapshot, usually not baseline material unless unique logic is found.\n';
md += '- `duplicate-exact`: exact duplicate by relative path and content hash.\n';
md += '- `ui-donor`: useful for interface or UX migration, not a baseline by itself.\n';
md += '- `frontend-scaffold`: standalone frontend scaffold or design system reference.\n';
md += '- `documentation-or-patch-unit`: docs, Jules sessions, patches, or partial evidence.\n';
md += '- `early-historical-version`: early app generation, useful for traceability.\n\n';

md += '## Official Matrix\n\n';
md += '| Unit | Official type | Priority | Structural class | gm | typecheck | test | Tests | Unique ratio | Closest unit | Same path+hash | Relation | Recommended action |\n';
md += '|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|---|\n';

for (const row of rows) {
  md += `| ${mdEscape(row.unit)} | ${row.officialType} | ${row.priority} | ${row.structuralClass} | ${row.hasGm ? 'yes' : ''} | ${row.hasTypecheck ? 'yes' : ''} | ${row.hasTest ? 'yes' : ''} | ${row.tests} | ${pct(row.uniqueRatio)} | ${mdEscape(row.closestUnit)} | ${pct(row.samePathHashSimilarity)} | ${mdEscape(row.relation)} | ${mdEscape(row.action)} |\n`;
}

md += '\n## High Priority Baseline Candidates\n\n';

const high = rows.filter(r => r.priority === 'high');

if (high.length === 0) {
  md += 'No high priority baseline candidates detected.\n\n';
} else {
  for (const row of high) {
    md += `### ${row.unit}\n\n`;
    md += `- Official type: ${row.officialType}\n`;
    md += `- Structural class: ${row.structuralClass}\n`;
    md += `- Scripts: gm=${row.hasGm ? 'yes' : 'no'}, typecheck=${row.hasTypecheck ? 'yes' : 'no'}, test=${row.hasTest ? 'yes' : 'no'}\n`;
    md += `- Tests detected: ${row.tests}\n`;
    md += `- Unique ratio: ${pct(row.uniqueRatio)}\n`;
    md += `- Closest unit: ${row.closestUnit || 'none'}\n`;
    md += `- Recommended action: ${row.action}\n\n`;
  }
}

md += '## Exact Duplicates\n\n';

const exact = rows.filter(r => r.exactDuplicates.length > 0);

if (exact.length === 0) {
  md += 'No exact duplicate project units detected.\n\n';
} else {
  md += '| Unit | Exact duplicate of |\n';
  md += '|---|---|\n';

  for (const row of exact) {
    md += `| ${mdEscape(row.unit)} | ${mdEscape(row.exactDuplicates.join(', '))} |\n`;
  }

  md += '\n';
}

md += '## Notes\n\n';
md += '- This classification is derived from structural, script, and hash/diff reports.\n';
md += '- It is not a runtime verdict. Baseline selection still requires executable validation.\n';
md += '- Do not delete, flatten, or merge duplicate folders until their historical purpose is reviewed.\n';

writeFile('VERSION_CLASSIFICATION.md', md);

console.log('Wrote VERSION_CLASSIFICATION.md');
console.log('Wrote VERSION_CLASSIFICATION.json');
console.log(`Classified ${rows.length} project units.`);
