# lyra-context-optimization

**Version 1.0.0**
Alexandru Miron
July 2026

> **Note:**
> This is a maintenance contract for agents who edit this skill, not end-user
> documentation. It captures the invariants that must hold, mirrors the rules
> from SKILL.md in maintainer framing, and explains how to edit safely. Read
> this before changing SKILL.md or adding, editing, or removing a rule.

---

## Abstract

Token-efficiency tactics ordered by cost and risk: byte-stable prefixes for prompt caching (cheapest, zero quality risk), observation masking (largest gains, low risk), compaction (lossy, threshold-gated), just-in-time retrieval, progressive disclosure, and filesystem-as-working-memory (structural), and sub-agent partitioning (highest overhead, gated by break-even math). Everything is measurement-first and trigger-driven, with each rule addressed to the actor who can execute it: the pipeline builder (prefix, budgets, metrics) or the in-window agent (retrieval, masking, compaction, partitioning).

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Measurement-first** — no tactic is applied without knowing what dominates the window, and no tactic survives without moving its metric.
2. **Signal preservation** — every tactic removes noise, never signal: active error detail, user constraints, decisions, and the system prompt are never sacrificed.
3. **Cost honesty** — the optimization machinery's own token/latency cost is always counted (masking bookkeeping, compaction calls, coordinator overhead, cold-cache spikes).

---

## Rules

### 1. Measure composition before optimizing

**The rule:** Identify the dominant category (tool outputs / documents / history / scaffolding), then select the tactic from the dominance table. Builders measure exactly via API token counts; agents estimate by declared proxies (tool-result count/size, whole-vs-sliced reads, turns since compaction).
**When editing:** Keep the table's five rows — the "near-limit while debugging" row encodes the most common real-world failure (masking away the error you're chasing). Keep the proxy list — without it the rule is unexecutable from the agent seat.
**Test for violation:** A recommendation to compact or mask with no statement of what dominates the window.

### 2. Byte-stable prefix, stable → dynamic ordering

**The rule:** System prompt, tools, templates, history, query — in that order; no timestamps/IDs/counters in the prefix; respect cache TTL when pacing long-running work.
**When editing:** Keep all three failure details: single-whitespace invalidation, the daily-miss timestamp example, and TTL economics for paused agents — each is a distinct, non-obvious cost.
**Test for violation:** A prompt template with dynamic content above stable content, or an agent sleep pattern that ignores TTL.

### 3. Mask served observations, never active ones

**The rule:** Two shapes per seat — builder-side: harness rewrites history into retrievable references; agent-side (cannot edit prior turns): extract-at-read into notes/files and never re-read, plus harness compaction requests. Never mask the last turn, active reasoning chains, or error output during live debugging; always mask duplicates immediately.
**When editing:** Keep the two shapes separated — assigning literal history-rewriting to the agent seat produces an unexecutable rule, since most runtimes give an agent no way to edit prior turns; keep the reference format retrievable (id + one-line key) and the ~3-turn debugging suspension window.
**Test for violation:** A masked stack trace while the bug it describes is still being fixed, or agent-seat guidance that instructs editing prior turns.

### 4. Compact at ~70%, never the system prompt, re-validate after

**The rule:** Threshold-triggered compaction with per-type preservation lists, a 50–70% reduction target, and a post-compaction check against the current task goal.
**When editing:** Keep the "compaction under pressure degrades" rationale and the stale-summary warning — both are quality-loss modes users discover too late.
**Test for violation:** Compaction triggered above 90% utilization, or a compacted system prompt.

### 5. Just-in-time retrieval and progressive disclosure

**The rule:** Search before read, read slices not files, fetch references when reached, defer tool schemas and deep skill content until needed — and write the store you retrieve from: persist plans/findings/intermediates to files with a one-line in-context pointer, re-read slices on demand.
**When editing:** Keep all three parts — data retrieval, capability loading, and filesystem-as-working-memory; the 2026 update extended JIT from documents to tools/skills and added the write side, which is the highest-leverage tactic for long-running agents.
**Test for violation:** Guidance that front-loads "all possibly relevant files", loads every reference at session start, or holds multi-phase state only in the conversation window.

### 6. Partition on the break-even math, return conclusions not transcripts

**The rule:** Partition when task > ~60% of window or when exploration noise would pollute the coordinator; sub-agents return structured results; below ~3 independent subtasks, don't.
**When editing:** Keep the "conclusions, not transcripts" contract — it is the entire mechanism by which partitioning saves tokens.
**Test for violation:** A sub-agent design that streams its raw search results back to the coordinator.

### 7. Budgets with threshold triggers, degradation routes to diagnosis

**The rule:** Per-category allocations with a reserved buffer; optimize on trigger, not timer; quality-drop signals trigger composition audit before optimization.
**When editing:** Keep the degradation branch — optimizing a poisoned context makes it worse, and this rule is the guardrail.
**Test for violation:** A periodic "compact every N turns" policy, or masking applied in response to wrong answers.

### 8. Every optimization proves itself with a metric

**The rule:** Directly measurable: cache hit rate 70%+, masking reduction 60–80%, compaction reduction 50–70%, partitioning net-positive after overhead. Quality impact is a metric only where an eval suite measures it; otherwise the honest proxies are re-fetch rate of masked content and failures traceable to compaction. Unproven machinery gets removed; prefix edits roll out as known cold-cache spikes.
**When editing:** Keep the measurable/eval-gated split — an unfalsifiable "<N% quality impact" percentage is metric-shaped decoration nobody can compute; numeric targets stay as calibration anchors with a stated adjustment reason.
**Test for violation:** An optimization kept in place with no measured metric attached, or a quality percentage asserted with no eval harness behind it.

---

## Maintenance notes

- **Adding a rule:** It must name its trigger, its metric, and its failure mode. Runtime-agnostic framing only — provider-specific TTLs and prices are cited as examples ("e.g. ~5 minutes"), never hard-coded as facts.
- **Editing a rule:** The dominance table (rule 1) and the metric targets (rule 8) are the skill's two calibration surfaces; keep them consistent with each other and with any threshold mentioned in rules 4, 6, and 7.
- **Deleting a rule:** Rules 1 and 8 are the measurement frame — deleting either turns the skill into a list of tricks and breaks invariant 1.
- **Version policy:** Examples default to the latest stable release of each tool; the stated minimum is the newest LTS or last maintained major (see SKILL.md compatibility). On LTS transitions, bump versions in examples and the patch number.
- **Versioning:** Bump the patch for threshold recalibration, minor for a new tactic, major if the measurement-first frame or a preservation guarantee changes. Keep SKILL.md and this file in sync.
