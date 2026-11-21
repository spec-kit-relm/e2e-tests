#!/usr/bin/env node
// Scenario coverage (QA-2): which product scenario IDs have at least one automated test?
//
//   node scripts/scenario-coverage.mjs [--specs ../product-specs] [--tests <dir> ...] [--feature RELM-1] [--gate]
//
// Scenario IDs come from the "Scenario IDs" table of every product spec
// (product-specs/specs/NNN-*/spec.md). Tests are found by scanning test titles in the given
// directories (default: ./tests plus sibling repos' test folders when present). With --gate, the
// script fails if any P1 scenario of the selected feature has no test (Gate 4).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const specsRoot = resolve(opt('--specs', '../product-specs'));
const feature = opt('--feature', null);
const gate = args.includes('--gate');
const testDirs = [];
for (let i = 0; i < args.length; i++) if (args[i] === '--tests') testDirs.push(resolve(args[i + 1]));
if (testDirs.length === 0) {
  testDirs.push(resolve('tests'));
  for (const sib of ['../inventory-service', '../orders-service', '../web-storefront']) {
    if (existsSync(sib)) testDirs.push(resolve(sib));
  }
}

const SCENARIO_ROW = /^\|\s*(RELM-\d+\/US\d+\/AS\d+)\s*\|\s*([^|]*)\|\s*(P\d)\s*\|/;
const ID = /RELM-\d+\/US\d+\/AS\d+/g;
const TEST_FILE = /(\.spec|\.test|_test)\.(ts|tsx|js|mjs|go)$|Test\.java$/;
const SKIP = new Set(['node_modules', '.git', '.next', 'target', 'test-results', 'specs', '.specify', '.claude']);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (TEST_FILE.test(name)) out.push(p);
  }
  return out;
}

// 1. scenarios
const scenarios = new Map(); // id -> {name, priority}
const specsDir = join(specsRoot, 'specs');
if (!existsSync(specsDir)) {
  console.error(`product specs not found at ${specsDir} — clone product-specs as a sibling or pass --specs`);
  process.exit(2);
}
for (const d of readdirSync(specsDir)) {
  const spec = join(specsDir, d, 'spec.md');
  if (!existsSync(spec)) continue;
  for (const line of readFileSync(spec, 'utf8').split('\n')) {
    const m = line.match(SCENARIO_ROW);
    if (m) scenarios.set(m[1], { name: m[2].trim(), priority: m[3] });
  }
}

// 2. tests (title prefixes)
const covered = new Map(); // id -> [files]
for (const dir of testDirs) {
  for (const file of walk(dir)) {
    const text = readFileSync(file, 'utf8');
    for (const id of new Set(text.match(ID) ?? [])) {
      if (!covered.has(id)) covered.set(id, []);
      covered.get(id).push(file.replace(resolve('..') + '/', ''));
    }
  }
}

// 3. report
let missingP1 = 0;
const rows = [...scenarios].filter(([id]) => !feature || id.startsWith(feature + '/'));
console.log(`Scenario coverage${feature ? ` for ${feature}` : ''}: ${rows.filter(([id]) => covered.has(id)).length}/${rows.length}\n`);
for (const [id, { name, priority }] of rows) {
  const files = covered.get(id) ?? [];
  const mark = files.length ? '✔' : priority === 'P1' ? '✖' : '·';
  if (!files.length && priority === 'P1') missingP1++;
  console.log(`${mark} ${id.padEnd(16)} ${priority}  ${name}${files.length ? `  (${files.length} test file(s))` : ''}`);
}
if (gate && missingP1) {
  console.error(`\nGate 4 blocked: ${missingP1} P1 scenario(s) without an automated test (QA-2)`);
  process.exit(1);
}
