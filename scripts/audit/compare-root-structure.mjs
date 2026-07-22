import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const EXCLUDE_DIRS = new Set([
  '.git',
  '.github',
  'scripts',
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

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

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

function countFilesAndDirs(rootDir) {
  let files = 0;
  let dirs = 0;
  let tests = 0;
  let ts = 0;
  let js = 0;

  walk(rootDir, (full, rel, entry) => {
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

function findPackageJsons(rootDir) {
  const found = [];

  walk(rootDir, (full, rel, entry) => {
    if (!entry.isDirectory() && entry.name === 'package.json') {
      found.push(rel);
    }
  });

  return found.sort();
}

function hasAny(folder, paths) {
  return paths.some(p => exists(path.join(folder, p)));
}

function packageScripts(packagePath) {
  const json = safeReadJson(path.join(ROOT, packagePath));
  return json?.scripts ? Object.keys(json.scripts).sort() : [];
}

function classify(folder, features, packageJsons) {
  if (folder === 'docs') return 'documentation-patches';
  if (folder === 'w-tracker-scaffold_0603') return 'frontend-scaffold';
  if (packageJsons.length === 0) return 'non-package-folder';

  if (features.core && features.session && features.auditScripts) {
    return 'modern-core-app';
  }

  if (features.engine && features.auditScripts) {
    return 'engine-audit-app';
  }

  if (features.core) {
    return 'core-architecture-app';
  }

  if (features.engine) {
    return 'engine-architecture-app';
  }

  if (features.appTabs && features.database && features.services) {
    return 'legacy-expo-app';
  }

  if (features.app && features.services) {
    return 'early-expo-app';
  }

  return 'package-project';
}

function yes(value) {
  return value ? 'yes' : '';
}

function mdEscape(value) {
  return String(value).replace(/\|/g, '\\|');
}

const rootDirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .filter(name => !EXCLUDE_DIRS.has(name))
  .sort((a, b) => a.localeCompare(b));

const rows = [];

for (const folder of rootDirs) {
  const rootDir = path.join(ROOT, folder);
  const packageJsons = findPackageJsons(rootDir);
  const rootPackage = exists(path.join(folder, 'package.json'));
  const scripts = rootPackage ? packageScripts(path.join(folder, 'package.json')) : [];
  const counts = countFilesAndDirs(rootDir);

  const features = {
    app: exists(path.join(folder, 'app')),
    appTabs: exists(path.join(folder, 'app', '(tabs)')),
    session: exists(path.join(folder, 'app', 'session')),
    src: exists(path.join(folder, 'src')),
    components: exists(path.join(folder, 'src', 'components')),
    ui: exists(path.join(folder, 'src', 'components', 'ui')),
    modals: exists(path.join(folder, 'src', 'components', 'modals')),
    constants: exists(path.join(folder, 'src', 'constants')),
    context: exists(path.join(folder, 'src', 'context')),
    core: exists(path.join(folder, 'src', 'core')),
    engine: exists(path.join(folder, 'src', 'engine')),
    runtime: exists(path.join(folder, 'src', 'runtime')),
    database: exists(path.join(folder, 'src', 'database')),
    feedback: exists(path.join(folder, 'src', 'feedback')),
    services: exists(path.join(folder, 'src', 'services')),
    utils: exists(path.join(folder, 'src', 'utils')),
    types: exists(path.join(folder, 'src', 'types')),
    auditScripts: exists(path.join(folder, 'scripts', 'audit')),
    imageScripts: exists(path.join(folder, 'scripts', 'images')),
    assetsImages: exists(path.join(folder, 'assets', 'images')),
    ios: exists(path.join(folder, 'ios')),
    android: exists(path.join(folder, 'android')),
    docs: exists(path.join(folder, 'docs')),
    coverage: exists(path.join(folder, 'coverage')),
    env: hasAny(folder, ['.env', '.env.local', '.env.production']),
  };

  const classification = classify(folder, features, packageJsons);

  rows.push({
    folder,
    classification,
    rootPackage,
    packageJsons,
    nestedPackages: packageJsons.filter(p => p !== `${folder}/package.json`),
    scripts,
    features,
    counts,
  });
}

const jsonOut = {
  generatedAt: new Date().toISOString(),
  root: ROOT,
  totalRootFolders: rows.length,
  rows,
};

fs.writeFileSync(
  path.join(ROOT, 'STRUCTURE_COMPARISON.json'),
  JSON.stringify(jsonOut, null, 2)
);

let md = '';
md += '# Structure Comparison\n\n';
md += 'Generated structural comparison of root folders in this repository.\n\n';
md += '## Summary Table\n\n';
md += '| Folder | Classification | Root package | Packages | Nested packages | Files | Dirs | Tests | TS | JS | Key features |\n';
md += '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|\n';

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
    f.env ? 'env-present' : '',
  ].filter(Boolean).join(', ');

  md += `| ${mdEscape(row.folder)} | ${row.classification} | ${yes(row.rootPackage)} | ${row.packageJsons.length} | ${row.nestedPackages.length} | ${row.counts.files} | ${row.counts.dirs} | ${row.counts.tests} | ${row.counts.ts} | ${row.counts.js} | ${mdEscape(keyFeatures)} |\n`;
}

md += '\n## Package Scripts By Root Folder\n\n';

for (const row of rows) {
  md += `### ${row.folder}\n\n`;

  if (row.packageJsons.length === 0) {
    md += '- No package.json found.\n\n';
    continue;
  }

  md += `- Package files:\n`;
  for (const p of row.packageJsons) {
    md += `  - \`${p}\`\n`;
  }

  if (row.scripts.length > 0) {
    md += `- Root scripts: ${row.scripts.map(s => `\`${s}\``).join(', ')}\n\n`;
  } else {
    md += '- Root scripts: none or no root package.json.\n\n';
  }
}

md += '## Notes\n\n';
md += '- This report is structural only. It does not prove runtime correctness.\n';
md += '- Nested package.json files should be reviewed as separate projects before deleting or merging anything.\n';
md += '- Generated folders such as node_modules, coverage, build, dist, .expo and caches are excluded from counts.\n';

fs.writeFileSync(path.join(ROOT, 'STRUCTURE_COMPARISON.md'), md);

console.log('Wrote STRUCTURE_COMPARISON.md');
console.log('Wrote STRUCTURE_COMPARISON.json');
console.log(`Analyzed ${rows.length} root folders.`);
