#!/usr/bin/env node
/**
 * validate-suite.mjs — structural self-verification for the skill collection.
 *
 * Checks, for every skill directory containing a SKILL.md:
 *  - required files exist (SKILL.md, README.md, AGENTS.md, plugin.json)
 *  - plugin.json parses, name matches the directory, author block is present
 *  - SKILL.md frontmatter name matches the directory
 *  - both SKILL.md and README.md carry the collection footer
 *  - every "lyra-<skill> rule N" cross-reference resolves to a real "### N." heading
 *  - every relative link in the root README catalog resolves to a file
 *  - .lyra/council store (if any) follows the v2 schema: Markdown sessions with
 *    flat frontmatter, a ledger.md digest per session, no unmigrated JSON-era files
 *
 * Exit code 0 = all checks pass; 1 = failures printed to stdout.
 * Declared next step (not yet implemented): execution smoke tests — build the
 * reference Containerfiles, systemd-analyze verify generated quadlets, actionlint
 * the workflow snippets. Until then, code blocks are reviewed, not machine-verified.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
let fails = 0;
const fail = (msg) => { console.log("FAIL " + msg); fails++; };

const skills = fs.readdirSync(root).filter((d) => {
  try { return fs.statSync(path.join(root, d)).isDirectory() && fs.existsSync(path.join(root, d, "SKILL.md")); }
  catch { return false; }
});

const rules = {};
for (const s of skills) {
  const dir = path.join(root, s);
  for (const f of ["README.md", "AGENTS.md", "plugin.json"]) {
    if (!fs.existsSync(path.join(dir, f))) fail(`${s}: missing ${f}`);
  }
  try {
    const p = JSON.parse(fs.readFileSync(path.join(dir, "plugin.json"), "utf8"));
    if (p.name !== s) fail(`${s}: plugin.json name "${p.name}" != directory`);
    if (!p.author?.name || !p.author?.email) fail(`${s}: plugin.json author incomplete`);
  } catch (e) { fail(`${s}: plugin.json unparsable (${e.message})`); }

  const skill = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8");
  const name = skill.match(/^name: (.+)$/m)?.[1];
  if (name !== s) fail(`${s}: SKILL.md frontmatter name "${name}" != directory`);
  rules[s] = {};
  for (const m of skill.matchAll(/^### (\d+)(?:[–-]\d+)?\. /gm)) rules[s][m[1]] = true;
  for (const f of ["SKILL.md", "README.md"]) {
    const t = fs.readFileSync(path.join(dir, f), "utf8");
    if (!t.includes("_Part of the [skill collection](../README.md)._")) fail(`${s}/${f}: missing collection footer`);
  }
}

for (const s of skills) {
  for (const f of ["SKILL.md", "AGENTS.md", "README.md"]) {
    const fp = path.join(root, s, f);
    if (!fs.existsSync(fp)) continue;
    const t = fs.readFileSync(fp, "utf8");
    for (const m of t.matchAll(/(lyra-[a-z-]+) rules? (\d+)(?:\s*[–-]\s*(\d+))?/g)) {
      const target = m[1];
      if (!rules[target]) continue;
      for (const n of [m[2], m[3]].filter(Boolean)) {
        if (!rules[target][n]) fail(`${s}/${f}: broken cross-reference -> ${target} rule ${n}`);
      }
    }
  }
}

const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const m of readme.matchAll(/\]\(\.\/([^)#]+)\)/g)) {
  if (!fs.existsSync(path.join(root, m[1]))) fail(`README.md: broken link ./${m[1]}`);
}

const council = path.join(root, ".lyra", "council");
const sessions = path.join(council, "sessions");
if (fs.existsSync(sessions)) {
  const ledgerPath = path.join(council, "ledger.md");
  const ledger = fs.existsSync(ledgerPath) ? fs.readFileSync(ledgerPath, "utf8") : null;
  if (ledger === null) fail(".lyra/council: sessions exist but ledger.md is missing");
  if (fs.existsSync(path.join(council, "index.jsonl"))) fail(".lyra/council: JSON-era index.jsonl not migrated");
  for (const f of fs.readdirSync(sessions)) {
    const fp = path.join(sessions, f);
    if (!fs.statSync(fp).isFile()) continue;
    if (f.endsWith(".json")) { fail(`.lyra/council/sessions/${f}: JSON-era session not migrated`); continue; }
    if (!f.endsWith(".md")) continue;
    const t = fs.readFileSync(fp, "utf8");
    if (!t.startsWith("---")) { fail(`.lyra/council/sessions/${f}: missing frontmatter`); continue; }
    const fmEnd = t.indexOf("\n---", 3);
    const fm = fmEnd === -1 ? "" : t.slice(0, fmEnd + 1);
    for (const field of ["id: ", "schema: ", "date: ", "topic: ", "tags: "]) {
      if (!fm.includes("\n" + field)) fail(`.lyra/council/sessions/${f}: frontmatter missing "${field.trim()}"`);
    }
    const id = fm.match(/\nid: (\S+)/)?.[1];
    if (id && f !== id + ".md") fail(`.lyra/council/sessions/${f}: id "${id}" != filename`);
    if (ledger && id && !new RegExp(`^### ${id}$`, "m").test(ledger)) fail(`.lyra/council/sessions/${f}: no ledger block for ${id}`);
  }
}

console.log(fails ? `${fails} failure(s) across ${skills.length} skills` : `ALL CHECKS PASS (${skills.length} skills)`);
process.exit(fails ? 1 : 0);
