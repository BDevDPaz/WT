import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const EXCLUDE_DIRS = new Set([
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

function walk(dir, visitor, depth = 0, maxDepth = 20) {
  if (depth > maxDepth) return;

  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      visitor(full, rel, entry);
      walk(full, visitor, depth + 1, maxDepth);
    } else {
      visitor(full, rel, entry);
    }
  }
}

function exists(base, rel) {
  return fs.existsSync(path.join(base, rel));
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function findPackageJsons() {
  const found = [];

  walk(ROOT, (full, rel, entry) => {
    if (!entry.isDirectory() && entry.name === 'package.json') {
      found.push(full);
    }
  });

  return found.sort();
}

function countUnitFiles(unitRoot) {
  let files = 0;
  let dirs = 0;
  let tests = 0;
  let ts = 0;
  let js = 0;

  walk(unitRoot, (full, rel, entry) => {
    if (!rel.startsWith(path.relative(ROOT, unitRoot))) return;

    if (entry.isDirectory()) {
      dirs += 1;
      if (entry.name === '__tests__') tests += 1;
      return;
    }

    files += 1;

    if (/\.(ts|tsx)$/.test(entry.name)) ts += 1;
    if (/\.(js|jsx|mjs|cjs)$/.test(entry.name)) js += 1;
    if (/(\.test\.|\.spec\.)/.test(entry.name)) tests += 1;
  });

  return { files, dirs, tests, ts, js };
}

function classify(features, scripts) {
  if (features.core && features.session && features.auditScripts) return 'modern-core-app';
  if (features.engine && features.runtime && features.auditScripts) return 'engine-audit-app';
  if (features.core) return 'core-architecture-app';
  if (features.engine) return 'engine-architecture-app';
  if (features.appTabs && features.database && features.services) return 'legacy-expo-app';
  if (features.app && features.services) return 'early-expo-app';
  return 'package-project';
}

function mdEscape(value) {
  return String(value).replace(/\|/g, '\\|');
}

function yes(value) {
  return value ? 'yes' : '';
}

const packages = findPackageJsons();
const rows = [];

for (const packageFile of packages) {
  const unitRoot = path.dirname(packageFile);
  const relRoot = path.relative(ROOT, unitRoot);
  const pkg = readJson(packageFile) || {};
  const scripts = pkg.scripts ? Object.keys(pkg.scripts).sort() : [];

  const features = {
    app: exists(unitRoot, 'app'),
    appTabs: exists(unitRoot, path.join('app', '(tabs)')),
    session: exists(unitRoot, path.join('app', 'session')),
    src: exists(unitRoot, 'src'),
    components: exists(unitRoot, path.join('src', 'components')),
    ui: exists(unitRoot, path.join('src', 'components', 'ui')),
    modals: exists(unitRoot, path.join('src', 'components', 'modals')),
    core: exists(unitRoot, path.join('src', 'core')),
    engine: exists(unitRoot, path.join('src', 'engine')),
    runtime: exists(unitRoot, path.join('src', 'runtime')),
    database: exists(unitRoot, path.join('src', 'database')),
    feedback: exists(unitRoot, path.join('src', 'feedback')),
    services: exists(unitRoot, path.join('src', 'services')),
    utils: exists(unitRoot, path.join('src', 'utils')),
    types: exists(unitRoot, path.join('src', 'types')),
    auditScripts: exists(unitRoot, path.join('scripts', 'audit')),
    imageScripts: exists(unitRoot, path.join('scripts', 'images')),
    assetsImages: exists(unitRoot, path.join('assets', 'images')),
    ios: exists(unitRoot, 'ios'),
    android: exists(unitRoot, 'android'),
    docs: exists(unitRoot, 'docs'),
  };

  const counts = countUnitFiles(unitRoot);
  const classification = classify(features, scripts);

  rows.push({
    projectRoot: relRoot || '.',
    packageJson: path.relative(ROOT, packageFile),
    name: pkg.name || '',
    version: pkg.version || '',
    classification,
    scripts,
    features,
    counts,
  });
}

const out = {
  generatedAt: new Date().toISOString(),
  totalProjectUnits: rows.length,
  rows,
};

fs.writeFileSync(
  path.join(ROOT, 'PROJECT_UNITS_COMPARISON.json'),
  JSON.stringify(out, null, 2)
);

let md = '';
md += '# Project Units Comparison\n\n';
md += 'Comparison of every detected package.json project unit.\n\n';
md += '| Project root | Classification | Package name | Version | Files | Dirs | Tests | TS | JS | Has gm | Has typecheck | Has test | Key features |\n';
md += '|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|\n';

for (const row of rows) {
  const f = row.features;
  const keyFeatures = [
    f.appTabs ? 'tabs' : '',
    f.session ? 'session' : '',
    f.core ? 'core' : '',
    f.engine ? 'engine' : '',
    f.runtime ? 'runtime' : '',
    f.database ? 'db' : '',
    f.services ? 'services' : '',
    f.auditScripts ? 'audit' : '',
    f.imageScripts ? 'image-scripts' : '',
    f.ios ? 'ios' : '',
    f.docs ? 'docs' : '',
  ].filter(Boolean).join(', ');

  md += `| ${mdEscape(row.projectRoot)} | ${row.classification} | ${mdEscape(row.name)} | ${mdEscape(row.version)} | ${row.counts.files} | ${row.counts.dirs} | ${row.counts.tests} | ${row.counts.ts} | ${row.counts.js} | ${yes(row.scripts.includes('gm'))} | ${yes(row.scripts.includes('typecheck'))} | ${yes(row.scripts.includes('test'))} | ${mdEscape(keyFeatures)} |\n`;
}

md += '\n## Notes\n\n';
md += '- This report treats every package.json as a separate project unit.\n';
md += '- Nested project units must be reviewed before deleting, merging, or flattening folders.\n';
md += '- This is structural only. Runtime validation requires installing dependencies and running scripts.\n';

fs.writeFileSync(path.join(ROOT, 'PROJECT_UNITS_COMPARISON.md'), md);

console.log('Wrote PROJECT_UNITS_COMPARISON.md');
console.log('Wrote PROJECT_UNITS_COMPARISON.json');
console.log(`Analyzed ${rows.length} project units.`);
