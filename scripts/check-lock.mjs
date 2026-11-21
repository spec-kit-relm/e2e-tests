#!/usr/bin/env node
// QA-3 / E2E-4: contracts.lock.json must match the vendored contract versions and, when the
// product-specs sibling is present, the feature contract locks.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const lock = JSON.parse(readFileSync('contracts.lock.json', 'utf8')).contracts;
let failed = 0;
for (const [name, version] of Object.entries(lock)) {
  const file = join('contracts/vendor', `${name}.yaml`);
  if (!existsSync(file)) { console.error(`✖ ${name}: ${file} missing`); failed++; continue; }
  const m = readFileSync(file, 'utf8').match(/^info:\s*\n(?:[ \t]+.*\n)*?[ \t]+version:\s*['"]?([^'"\s]+)/m);
  const vendored = m?.[1];
  if (vendored !== version) { console.error(`✖ ${name}: lock ${version} but vendored ${vendored}`); failed++; }
  else console.log(`✔ ${name}@${version}`);
}
const specs = join(process.env.PRODUCT_SPECS ?? '../product-specs', 'specs');
if (existsSync(specs)) {
  for (const d of readdirSync(specs)) {
    const f = join(specs, d, 'contracts.lock.md');
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\|\s*([a-z-]+)\s*\|[^|]*\|\s*(\d+\.\d+\.\d+)\s*\|.*\|\s*(locked|released)\s*\|$/);
      if (m && lock[m[1]] && lock[m[1]] !== m[2]) {
        console.error(`✖ ${d}: product lock ${m[1]}@${m[2]} ≠ e2e lock ${lock[m[1]]}`); failed++;
      }
    }
  }
}
process.exit(failed ? 1 : 0);
