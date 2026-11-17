#!/usr/bin/env node
// Validates the synthetic seed data so every number on screen can be traced and is internally consistent.
// Usage: node scripts/validate-seed.mjs   (exit 1 on any failure)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "seed");
const load = (f) => JSON.parse(readFileSync(join(root, f), "utf8"));

const study = load("study.json");
const { facts } = load("facts.json");
const { tlfs } = load("tlfs.json");
const { patients } = load("patients.json");
const { sections, narrativeTemplate } = load("sections.json");
const errors = [];
const fail = (m) => errors.push(m);

// 1. Every file declares itself synthetic
for (const f of ["study.json", "facts.json", "tlfs.json", "patients.json", "sections.json", "rules.json"]) {
  const d = load(f);
  if (!d._synthetic) fail(`${f}: missing _synthetic marker`);
}

// 2. Facts: percentages recompute from counts, ids unique, cells point back to TLFs
const byId = new Map();
for (const f of facts) {
  if (byId.has(f.id)) fail(`duplicate fact id ${f.id}`);
  byId.set(f.id, f);
  if (f.kind === "n_pct") {
    const expected = Math.round((f.value.n * 1000) / f.value.N) / 10;
    if (Math.abs(expected - f.value.pct) > 0.051) fail(`${f.id}: pct ${f.value.pct} != ${expected}`);
    if (f.display !== `${f.value.n} (${f.value.pct.toFixed(1)}%)`) fail(`${f.id}: display mismatch`);
  }
  const t = tlfs.find((x) => x.id === f.tlf);
  if (!t) fail(`${f.id}: TLF ${f.tlf} not found`);
  else if (t.rows[f.cell.row]?.cells[f.cell.col]?.factId !== f.id) fail(`${f.id}: cell coordinates do not point back to the fact`);
}

// 3. Disposition adds up
const v = (id) => byId.get(id)?.value?.n;
for (const arm of ["velo", "pbo"]) {
  const reasons = ["disc_ae", "disc_withdrawal", "disc_ltfu", "disc_death", "disc_other"].reduce((s, r) => s + v(`14.1.1.${r}.${arm}`), 0);
  if (reasons !== v(`14.1.1.discontinued.${arm}`)) fail(`disposition reasons do not sum for ${arm}`);
  if (v(`14.1.1.treated.${arm}`) - v(`14.1.1.discontinued.${arm}`) !== v(`14.1.1.completed.${arm}`)) fail(`treated - discontinued != completed for ${arm}`);
  const saePatients = patients.filter((p) => p.arm === arm).length;
  if (saePatients !== v(`14.3.1.1.sae.${arm}`)) fail(`SAE patients (${saePatients}) != SAE fact for ${arm}`);
  const deaths = patients.filter((p) => p.arm === arm && p.outcome === "Fatal").length;
  if (deaths !== v(`14.3.1.1.death.${arm}`)) fail(`deaths (${deaths}) != death fact for ${arm}`);
}

// 4. Section sentences: every placeholder resolves; cites match placeholders; no literal numerals outside slots
const SLOT = /\{F:([^}|]+)(?:\|(n|pct|n_pct))?\}/g;
for (const s of sections) {
  for (const sen of s.sentences) {
    const used = [...sen.text.matchAll(SLOT)].map((m) => m[1]);
    for (const id of used) if (!byId.has(id)) fail(`${sen.id}: unknown fact ${id}`);
    const cites = new Set(sen.cites);
    for (const id of used) if (!cites.has(id)) fail(`${sen.id}: slot ${id} not in cites`);
    const prose = sen.text.replace(SLOT, "").replace(/\b(Section|Table) [0-9.]+/g, "");
    if (/[0-9]/.test(prose)) fail(`${sen.id}: numeral outside a slot -> "${prose}"`);
  }
}

// 5. Patients: ids unique, timelines ordered, exceptions explained
const ids = new Set();
for (const p of patients) {
  if (ids.has(p.id)) fail(`duplicate patient ${p.id}`);
  ids.add(p.id);
  const days = p.timeline.map((t) => t[0]);
  if (days.some((d, i) => i && d < days[i - 1])) fail(`${p.id}: timeline out of order`);
  if (p.status === "exception" && !p.dataIssue) fail(`${p.id}: exception without dataIssue`);
}
if (!narrativeTemplate?.sentences) fail("narrative template missing");

if (errors.length) {
  console.error(`Seed validation FAILED (${errors.length}):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(`Seed OK: study ${study.id}, ${tlfs.length} TLFs, ${facts.length} facts, ${patients.length} patients, ${sections.length} sections`);
