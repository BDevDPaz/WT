import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();

const EXCLUDE_DIR_NAMES = new Set([
  '.git',
  '.github',
  'node_modules',
  '.expo',
  '.expo-shared',
  'coverage',
  'dist',
  'build',
  'web-build',
  '.cache',
  'tmp',
  'temp',
]);

const EXCLUDE_TOP_LEVEL_DIRS = new Set([
  'scripts',
]);

const EXCLUDE_FILE_NAMES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
]);

const EXCLUDE_FILE_SUFFIXES = [
  '.log',
  '.tsbuildinfo',
];

function rel(p) {
  return path.relative(ROOT, p);
}

function isExcludedFile(name) {
  if (EXCLUDE_FILE_NAMES.has(name)) return true;
  return EXCLUDE_FILE_SUFFIXES.some(suffix => name.endsWith(suffix));
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function walk(dir, visitor, options = {}, depth = 0) {
  const {
    skipDirectory = () => false,
    maxDepth = 50,
  } = options;

  if (depth > maxDepth) return;

  for (const entry of safeReaddir(dir)) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIR_NAMES.has(entry.name)) continue;
      if (skipDirectory(full, entry)) continue;

      visitor(full, entry);
      walk(full, visitor, options, depth + 1);
    } else {
      if (isExcludedFile(entry.name)) continue;
      visitor(full, entry);
    }
  }
}

function findPackageRoots() {
  const roots = [];

  walk(ROOT, (full, entry) => {
    if (!entry.isDirectory() && entry.name === 'package.json') {
      roots.push(path.dirname(full));
    }
  }, {
    skipDirectory: full => {
      const r = rel(full);
      const first = r.split(path.sep)[0];
      return EXCLUDE_TOP_LEVEL_DIRS.has(first);
    },
  });

  return roots.sort((a, b) => rel(a).localeCompare(rel(b)));
}

function topLevelUnits() {
  return safeReaddir(ROOT)
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(name => !EXCLUDE_DIR_NAMES.has(name))
    .filter(name => !EXCLUDE_TOP_LEVEL_DIRS.has(name))
    .map(name => path.join(ROOT, name))
    .sort((a, b) => rel(a).localeCompare(rel(b)));
}

function uniqueUnitRoots() {
  const packageRoots = findPackageRoots();
  const packageRootSet = new Set(packageRoots.map(p => path.resolve(p)));

  const units = [];

  for (const top of topLevelUnits()) {
    units.push({
      root: top,
      kind: 'root-folder',
      hasPackageJson: fs.existsSync(path.join(top, 'package.json')),
    });
  }

  for (const pkgRoot of packageRoots) {
    const parts = rel(pkgRoot).split(path.sep);
    if (parts.length <= 1) continue;

    units.push({
      root: pkgRoot,
      kind: 'nested-package',
      hasPackageJson: true,
    });
  }

  const seen = new Set();
  return units.filter(unit => {
    const key = path.resolve(unit.root);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => rel(a.root).localeCompare(rel(b.root)));
}

const packageRoots = findPackageRoots();
const packageRootSet = new Set(packageRoots.map(p => path.resolve(p)));
const units = uniqueUnitRoots();

function collectFilesForUnit(unitRoot) {
  const files = [];

  walk(unitRoot, (full, entry) => {
    if (entry.isDirectory()) return;

    const stat = fs.statSync(full);
    const relativeToUnit = path.relative(unitRoot, full);

    files.push({
      path: relativeToUnit,
      repoPath: rel(full),
      size: stat.size,
      hash: sha256File(full),
    });
  }, {
    skipDirectory: full => {
      const resolved = path.resolve(full);
      if (resolved !== path.resolve(unitRoot) && packageRootSet.has(resolved)) {
        return true;
      }
      return false;
    },
  });

  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

function setIntersectionSize(a, b) {
  let count = 0;
  for (const x of a) {
    if (b.has(x)) count += 1;
  }
  return count;
}

function setUnionSize(a, b) {
  const s = new Set(a);
  for (const x of b) s.add(x);
  return s.size;
}

function pct(n) {
  return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : '0.0%';
}

function mdEscape(value) {
  return String(value).replace(/\|/g, '\\|');
}

const unitReports = units.map(unit => {
  const files = collectFilesForUnit(unit.root);
  const pathHashSignatures = new Set(files.map(f => `${f.path}:${f.hash}`));
  const hashes = new Set(files.map(f => f.hash));
  const paths = new Set(files.map(f => f.path));

  return {
    unit: rel(unit.root),
    kind: unit.kind,
    hasPackageJson: unit.hasPackageJson,
    fileCount: files.length,
    totalBytes: files.reduce((sum, f) => sum + f.size, 0),
    files,
    pathHashSignatures,
    hashes,
    paths,
  };
});

const hashGroups = new Map();

for (const report of unitReports) {
  for (const file of report.files) {
    if (!hashGroups.has(file.hash)) {
      hashGroups.set(file.hash, []);
    }

    hashGroups.get(file.hash).push({
      unit: report.unit,
      path: file.path,
      repoPath: file.repoPath,
      size: file.size,
    });
  }
}

const duplicateContentGroups = [...hashGroups.entries()]
  .map(([hash, occurrences]) => ({ hash, occurrences }))
  .filter(group => {
    const units = new Set(group.occurrences.map(o => o.unit));
    return units.size > 1;
  })
  .sort((a, b) => {
    const sizeA = a.occurrences[0]?.size || 0;
    const sizeB = b.occurrences[0]?.size || 0;
    return sizeB - sizeA || b.occurrences.length - a.occurrences.length;
  });

const pairwise = [];

for (let i = 0; i < unitReports.length; i += 1) {
  for (let j = i + 1; j < unitReports.length; j += 1) {
    const a = unitReports[i];
    const b = unitReports[j];

    const exactPathHashOverlap = setIntersectionSize(a.pathHashSignatures, b.pathHashSignatures);
    const exactPathHashUnion = setUnionSize(a.pathHashSignatures, b.pathHashSignatures);
    const exactPathHashJaccard = exactPathHashUnion === 0 ? 0 : exactPathHashOverlap / exactPathHashUnion;

    const pathOverlap = setIntersectionSize(a.paths, b.paths);
    const pathUnion = setUnionSize(a.paths, b.paths);
    const pathJaccard = pathUnion === 0 ? 0 : pathOverlap / pathUnion;

    const contentHashOverlap = setIntersectionSize(a.hashes, b.hashes);
    const contentHashUnion = setUnionSize(a.hashes, b.hashes);
    const contentHashJaccard = contentHashUnion === 0 ? 0 : contentHashOverlap / contentHashUnion;

    const changedSamePath = [];
    const samePathSameHash = [];

    const aByPath = new Map(a.files.map(f => [f.path, f]));
    const bByPath = new Map(b.files.map(f => [f.path, f]));

    for (const [filePath, af] of aByPath) {
      const bf = bByPath.get(filePath);
      if (!bf) continue;

      if (af.hash === bf.hash) {
        samePathSameHash.push(filePath);
      } else {
        changedSamePath.push(filePath);
      }
    }

    const onlyInA = a.files.filter(f => !bByPath.has(f.path)).map(f => f.path);
    const onlyInB = b.files.filter(f => !aByPath.has(f.path)).map(f => f.path);

    const exactDuplicate =
      a.fileCount === b.fileCount &&
      exactPathHashOverlap === a.fileCount &&
      exactPathHashOverlap === b.fileCount;

    pairwise.push({
      a: a.unit,
      b: b.unit,
      exactDuplicate,
      exactPathHashOverlap,
      exactPathHashJaccard,
      pathOverlap,
      pathJaccard,
      contentHashOverlap,
      contentHashJaccard,
      changedSamePathCount: changedSamePath.length,
      onlyInACount: onlyInA.length,
      onlyInBCount: onlyInB.length,
      examples: {
        changedSamePath: changedSamePath.slice(0, 25),
        onlyInA: onlyInA.slice(0, 25),
        onlyInB: onlyInB.slice(0, 25),
      },
    });
  }
}

pairwise.sort((a, b) => {
  if (a.exactDuplicate !== b.exactDuplicate) return a.exactDuplicate ? -1 : 1;
  return b.exactPathHashJaccard - a.exactPathHashJaccard ||
    b.pathJaccard - a.pathJaccard ||
    b.contentHashJaccard - a.contentHashJaccard;
});

const exactDuplicates = pairwise.filter(p => p.exactDuplicate);
const closestPairs = pairwise
  .filter(p => !p.exactDuplicate)
  .filter(p => p.exactPathHashJaccard >= 0.5 || p.pathJaccard >= 0.7 || p.contentHashJaccard >= 0.7)
  .slice(0, 80);

const hashToUnits = new Map();

for (const [hash, occurrences] of hashGroups) {
  hashToUnits.set(hash, new Set(occurrences.map(o => o.unit)));
}

const uniqueFilesByUnit = unitReports.map(report => {
  const uniqueFiles = report.files.filter(file => {
    const unitsWithHash = hashToUnits.get(file.hash);
    return unitsWithHash && unitsWithHash.size === 1;
  });

  return {
    unit: report.unit,
    uniqueFileCount: uniqueFiles.length,
    fileCount: report.fileCount,
    uniqueRatio: report.fileCount === 0 ? 0 : uniqueFiles.length / report.fileCount,
    examples: uniqueFiles.slice(0, 50).map(f => f.path),
  };
}).sort((a, b) => b.uniqueRatio - a.uniqueRatio || b.uniqueFileCount - a.uniqueFileCount);

const jsonOut = {
  generatedAt: new Date().toISOString(),
  totalUnits: unitReports.length,
  totalDuplicateContentGroups: duplicateContentGroups.length,
  exactDuplicateUnitPairs: exactDuplicates,
  closestPairs,
  uniqueFilesByUnit,
  units: unitReports.map(report => ({
    unit: report.unit,
    kind: report.kind,
    hasPackageJson: report.hasPackageJson,
    fileCount: report.fileCount,
    totalBytes: report.totalBytes,
    files: report.files,
  })),
  duplicateContentGroups,
  pairwise,
};

fs.writeFileSync(
  path.join(ROOT, 'HASH_DIFF_ANALYSIS.json'),
  JSON.stringify(jsonOut, null, 2)
);

let md = '';

md += '# Hash Diff Analysis\n\n';
md += 'Content-hash and relative-path comparison for preserved root folders and nested package units.\n\n';

md += '## Scope\n\n';
md += `- Units analyzed: ${unitReports.length}\n`;
md += `- Duplicate content groups across units: ${duplicateContentGroups.length}\n`;
md += '- Excluded generated/local folders: `.git`, `.github`, `node_modules`, `.expo`, `.expo-shared`, `coverage`, `dist`, `build`, `web-build`, `.cache`, `tmp`, `temp`.\n';
md += '- Excluded local/sensitive files: `.env`, `.env.local`, `.env.production`, `.env.development`, `*.log`, `*.tsbuildinfo`.\n';
md += '- Nested package roots are treated as separate units and skipped from their parent unit comparison.\n\n';

md += '## Unit Inventory\n\n';
md += '| Unit | Kind | Package | Files | Bytes |\n';
md += '|---|---:|---:|---:|---:|\n';

for (const report of unitReports) {
  md += `| ${mdEscape(report.unit)} | ${report.kind} | ${report.hasPackageJson ? 'yes' : ''} | ${report.fileCount} | ${report.totalBytes} |\n`;
}

md += '\n## Exact Duplicate Unit Pairs\n\n';

if (exactDuplicates.length === 0) {
  md += 'No exact duplicate unit pairs found by relative path + content hash.\n\n';
} else {
  md += '| A | B | Files |\n';
  md += '|---|---|---:|\n';

  for (const p of exactDuplicates) {
    md += `| ${mdEscape(p.a)} | ${mdEscape(p.b)} | ${p.exactPathHashOverlap} |\n`;
  }

  md += '\n';
}

md += '## Closest Non-Exact Pairs\n\n';
md += '| A | B | Same path+hash | Path similarity | Content similarity | Changed same-path files | Only in A | Only in B |\n';
md += '|---|---|---:|---:|---:|---:|---:|---:|\n';

for (const p of closestPairs) {
  md += `| ${mdEscape(p.a)} | ${mdEscape(p.b)} | ${pct(p.exactPathHashJaccard)} | ${pct(p.pathJaccard)} | ${pct(p.contentHashJaccard)} | ${p.changedSamePathCount} | ${p.onlyInACount} | ${p.onlyInBCount} |\n`;
}

md += '\n## Unique Files By Unit\n\n';
md += '| Unit | Unique files | Total files | Unique ratio |\n';
md += '|---|---:|---:|---:|\n';

for (const row of uniqueFilesByUnit) {
  md += `| ${mdEscape(row.unit)} | ${row.uniqueFileCount} | ${row.fileCount} | ${pct(row.uniqueRatio)} |\n`;
}

md += '\n## Largest Duplicate Content Groups\n\n';
md += '| Hash prefix | Size | Occurrences | Units | Example paths |\n';
md += '|---|---:|---:|---:|---|\n';

for (const group of duplicateContentGroups.slice(0, 50)) {
  const units = new Set(group.occurrences.map(o => o.unit));
  const size = group.occurrences[0]?.size || 0;
  const examples = group.occurrences
    .slice(0, 6)
    .map(o => `${o.unit}/${o.path}`)
    .join('<br>');

  md += `| \`${group.hash.slice(0, 12)}\` | ${size} | ${group.occurrences.length} | ${units.size} | ${mdEscape(examples)} |\n`;
}

md += '\n## Notes\n\n';
md += '- `Same path+hash` means files match at the same relative path with identical content.\n';
md += '- `Path similarity` means the two units share relative file paths, regardless of content.\n';
md += '- `Content similarity` means the two units share file content hashes, regardless of path.\n';
md += '- A high path similarity with many changed same-path files suggests a fork/snapshot rather than an exact clone.\n';
md += '- A high content similarity with lower path similarity suggests files were moved or reorganized.\n';

fs.writeFileSync(path.join(ROOT, 'HASH_DIFF_ANALYSIS.md'), md);

console.log('Wrote HASH_DIFF_ANALYSIS.md');
console.log('Wrote HASH_DIFF_ANALYSIS.json');
console.log(`Analyzed ${unitReports.length} units.`);
console.log(`Exact duplicate unit pairs: ${exactDuplicates.length}`);
console.log(`Duplicate content groups: ${duplicateContentGroups.length}`);
