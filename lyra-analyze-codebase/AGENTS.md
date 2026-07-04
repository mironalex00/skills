# lyra-analyze-codebase

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

Read-only codebase analysis across architecture, security, performance, and code quality, producing a severity-ranked report with evidence-backed findings. A five-phase workflow turns a repo into a prioritized, citation-rich report rather than a bullet dump. Each finding cites a file and line, earns a P0–P3 severity, and carries a specific recommendation.

---

## Invariants

These properties hold the skill together. Breaking any of them changes what the skill is, even if the rules still read fine.

1. **Read-only on the target** — a modified codebase poisons every prior finding, so no Edit/Write/MultiEdit or mutating Bash ever touches the target repo.
2. **Evidence over assertion** — every finding cites a file path and line range; "the codebase has issues" with no citation is speculation, not analysis.
3. **Phased ordering** — map → patterns → risks → prioritize → report, in that order, because a finding in an unmapped module is a guess about what the module does.

---

## Rules

### 1. Read-only, no exceptions

**The rule:** Never use Edit, Write, MultiEdit, or mutating Bash on the target codebase — a modified codebase can't be trusted as an analysis target.
**When editing:** Keep the compatibility front-matter list of allowed tools; any new tool must be read-only.
**Test for violation:** Any tool call that mutates filesystem, env, or process state against the target repo.

### 2. Evidence or it doesn't exist

**The rule:** Every finding cites a specific file path and line range — Grep to locate, Read to confirm, then cite `path/to/file.ext:42–58`.
**When editing:** Preserve the `path/to/file.ext:42–58` citation format in every finding template.
**Test for violation:** Any finding without a file path and line range fails the report.

### 3. Verify before reporting

**The rule:** A Grep match is a lead, not a finding — read the surrounding context before classifying; one false positive makes the reader doubt every true positive.
**When editing:** Keep the bad/good example (`passwordMinLength = 8` is not a secret) intact; it teaches the verification step.
**Test for violation:** Any finding whose cited line wasn't read in context is suspect.

### 4. Severity is earned

**The rule:** P0 = exploitable vuln, data loss, or critical-path crash; P1 = significant weakness; P2 = tech debt; P3 = style. No inflation, no deflation — both are dishonest.
**When editing:** Keep the severity definitions anchored; if you add a tier, justify it against these anchors.
**Test for violation:** A hardcoded prod DB password rated P3, or a missing docstring rated P0.

### 5. Every finding has a recommendation

**The rule:** If you can't name a specific fix, you don't understand the finding well enough to report it; "Improve security" is a complaint, not a recommendation.
**When editing:** Keep the bad/good pair ("Improve security" vs. the env-var + `.env.example` example).
**Test for violation:** Any recommendation a developer couldn't execute without more information.

### 6. Discover the stack, don't assume it

**The rule:** Read manifests in Phase 1, then choose language-agnostic Grep patterns — the same skill handles a Go monolith, a Python ML repo, and a PHP e-commerce site.
**When editing:** Don't hardcode language-specific patterns into the workflow; keep the skill language-agnostic.
**Test for violation:** Running TypeScript patterns on a Python repo, or vice versa.

### 7. The report is the product, not a bullet dump

**The rule:** Follow the report template — sections, structured findings, prioritized recommendations; "here's what I noticed" + 30 bullets is a brain dump, not analysis.
**When editing:** Keep the template block in SKILL.md intact; new sections must fit the existing structure.
**Test for violation:** An unstructured bullet list where a templated report should be.

### 8. Phases run in order

**The rule:** Map before patterns, patterns before risks, risks before prioritization, prioritization before report — a security finding in an unmapped module is a guess.
**When editing:** Don't reorder the five-phase workflow; the dependency chain is load-bearing.
**Test for violation:** A security finding cited in a module that was never mapped.

### 9. Executive summary first, written last

**The rule:** The summary stands alone — a reader who reads only the summary should understand health, top risks, and recommended actions; write it after every finding is prioritized.
**When editing:** Keep the "written last" instruction; a summary written before findings is a guess.
**Test for violation:** A summary that references findings not yet prioritized, or that can't stand alone.

### 10. Quantify where you can

**The rule:** Use read-only Bash (`wc -l`, `find ... | wc -l`, `git log --oneline | wc -l`) for file counts, LOC, test-to-source ratio, TODO counts; "42 TODOs" beats "many TODOs."
**When editing:** Keep the read-only Bash examples; never introduce mutating commands.
**Test for violation:** "Many TODOs" where a count was available.

### 11. Lead with P0s

**The rule:** Within each category, order findings P0 → P3; the prioritized recommendations list puts P0s at the top — a P0 buried under ten P3s is a failed report.
**When editing:** Preserve the ordering instruction; the prioritized list must lead with P0s.
**Test for violation:** A P0 buried under P3s in the recommendations list.

### 12. Recommend integrations with a file reference

**The rule:** When pointing to lyra-debug or lyra-clean-architecture, cite the specific files and symptoms or boundaries — "Consider lyra-debug" without a file is not a recommendation.
**When editing:** Keep the file-reference requirement for every next-steps entry.
**Test for violation:** A next-steps entry that names a sibling skill without a concrete file or boundary.

---

## Maintenance notes

- **Adding a rule:** Number it sequentially, give it a bad/good pair or a concrete test, and verify it doesn't overlap with an existing rule. Update the Abstract if the rule count changes.
- **Editing a rule:** Preserve the bad/good example structure where present — the example is what makes the rule survive contact with real code.
- **Deleting a rule:** Check whether the report template or the phased workflow depends on it; rules 7 and 8 are especially load-bearing.
- **Versioning:** Bump the patch for clarifications, minor for new rules, major if a rule is removed or an invariant changes. Keep SKILL.md and this file in sync — they describe the same skill from two angles.