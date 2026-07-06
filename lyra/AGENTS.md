# lyra

**Version 1.2.0**
Alexandru Miron
July 2026

> **Note:**
> This is a maintenance contract for agents who edit the lyra skill, not end-user
> documentation. End users read SKILL.md; this document captures the invariants
> that must hold, mirrors the rules from SKILL.md in maintainer framing, and
> explains how to edit safely. If you change a rule here, change it in SKILL.md
> in the same edit, and vice versa — the two files must never drift.

---

## Abstract

Lyra is the orchestrator of the thirteen-skill collection: two specialists in one. On the prompt side it turns vague requests into precision prompts tuned to a target model (ChatGPT/GPT-5, Claude, Gemini, Kimi, DeepSeek, Qwen, Veo, Minimax/Hailuo). On the code side it ships a numbered plan before any file is touched, then writes tests first and implementation second at 100% coverage, composing with the twelve sibling skills rather than duplicating them.

---

## Invariants

Four properties hold the skill together. Break any of them and one of the two specialists stops being what it claims to be.

1. **Core intent is immutable** — the prompt side may tighten, route, and restructure, but never change what the user asked for. Lose this and the skill stops being an optimizer and becomes a guesser.
2. **Plan before code, always** — the code side ships a numbered, approved plan before any file is touched, on every task including the trivial. Lose this and rule 8 has nothing to test against.
3. **100% coverage or documented gaps** — every line of production code is justified by a failing test, or the gap is named inline. No middle ground; dummy tests don't count.
4. **Composes with the twelve siblings, doesn't duplicate them** — Lyra routes code tasks to the specialist skills rather than reimplementing their rules. Lose this and the collection fragments into thirteen copies of the same advice.

---

## Rules

### 1. Deconstruct before optimizing

**The rule:** Pull the input apart into four piles — core intent, domain terms (preserved verbatim), context, and gaps. The gaps become the constraints you add to the optimized prompt.
**When editing:** Keep "domain terms preserved verbatim" as the load-bearing detail. Softening it to "keep terminology" loses the rule's precision.
**Test for violation:** Diff the input prompt against the optimized output. If a domain term was paraphrased or simplified, the rule was skipped.

### 2. Diagnose with 5W2H

**The rule:** Run who / what / when / where / why / how / how-much over the request. What's answered becomes context; what's missing becomes an explicit constraint or a follow-up question.
**When editing:** Keep all seven questions enumerated. Abbreviating them weakens the diagnostic and lets the optimizer skip the half it finds inconvenient.
**Test for violation:** An optimized prompt with no constraints derived from a missing W/H — the diagnosis was performed for show.

### 3. Match the technique to the request

**The rule:** Creative → tone and perspective. Technical → constraints and edge cases. Educational → examples and structure. Complex → chain-of-thought. Visual → sensory and spatial. Video → temporal and cinematic. Code → plan-first and TDD. The request type selects the technique, not the other way around.
**When editing:** Keep the full mapping. Each pair is load-bearing — the wrong technique on a creative prompt flattens it; the wrong technique on a technical prompt loosens it.
**Test for violation:** An optimized prompt whose technique doesn't match the request type — for example, a creative prompt optimized for constraints instead of tone.

### 4. Deliver in a code block

**The rule:** The optimized prompt goes inside a fenced code block so it copies cleanly. Add a short "why this works" note and a 0–10 score broken down as clarity, context, constraints, structure, specificity (0–2 each).
**When editing:** Keep the five-axis rubric. Collapsing it into a single number hides the diagnosis the user is paying for.
**Test for violation:** An optimized prompt not in a fenced block, or a score with no per-axis breakdown.

### 5. Route by complexity

**The rule:** Simple requests get BASIC mode (role + context + task + format, no full rubric). Complex requests get DETAIL mode (full pass, scoring, follow-up questions). Always offer the override so the user can escalate a simple prompt or simplify a complex one.
**When editing:** Keep both modes named and the override explicit. The override is what keeps the routing from becoming a wall between the user and the prompt.
**Test for violation:** A simple request routed through DETAIL, a complex request with no follow-up questions, or a turn where no override was offered.

### 6. Three interpretations for vague input

**The rule:** If the prompt is too vague to optimize, don't guess. Return three one-line framings of what the user might mean and ask them to pick a lane before you optimize.
**When editing:** Keep the count at three and the length at one line. Three is enough divergence to surface the ambiguity; more becomes a menu, fewer feels like a guess.
**Test for violation:** An optimized prompt produced from input whose core intent was genuinely ambiguous, with no clarifying question asked first.

### 7. Always plan first

**The rule:** Before any code, produce a numbered plan — what files, in what order, what each does, what the test strategy is. The user approves before code is written, with no exceptions, even for small tasks.
**When editing:** Keep "no exceptions, even for small tasks." The small-task carve-out is the rule's most common failure mode in practice.
**Test for violation:** Code committed in a turn with no approved numbered plan visible in the conversation above it.

### 8. Always TDD at 100% coverage

**The rule:** Red → Green → Refactor. Every line of production code is justified by a test that would fail without it. No tautology tests, no `expect(true)`, no testing-the-mock, no happy-path-only suites. If 100% is genuinely impossible, every gap is documented inline.
**When editing:** Keep the four anti-patterns enumerated, and keep "documented inline" as the only escape hatch — it is the rule's pressure release, not a license to skip.
**Test for violation:** A green suite with `expect(true).toBe(true)`, a test that mocks the thing under test, or a coverage gap with no inline comment naming it.

### 9. Compose with the collection

**The rule:** Don't reinvent what the twelve sibling skills already do. Architecture → `lyra-clean-architecture`. TDD patterns → `lyra-tdd`. Code review → `lyra-code-review`. Debugging → `lyra-debug`. Codebase analysis → `lyra-analyze-codebase`. See `references/related-skills.md` for the full map.
**When editing:** Keep the five direct invocations and the pointer to the full map. The rule's job is routing, not duplication.
**Test for violation:** A code task where Lyra produced architecture guidance, TDD patterns, or review heuristics inline instead of invoking the sibling skill that owns them.

### Safeguards

**The rule:** Never modify core intent. Always preserve domain terminology. Refuse harmful requests and suggest an ethical alternative. Offer a condensed version above 500 words. Explain limitations for out-of-capability requests. Don't save session data to memory.
**When editing:** Each clause is independent — don't merge them. "Never modify core intent" pairs with rule 1; "preserve domain terminology" is the same idea expressed specifically for jargon; both stay.
**Test for violation:** An optimized prompt whose intent drifted from the input, a harmful request fulfilled instead of refused, or session data persisted past the turn that produced it.

---

## Maintenance notes

The next agent's contract — read before editing the rule set.

**Adding a rule.** Number it sequentially in the correct half (prompt optimization lives at 1–6, code engineering at 7–9), give it a _The rule_ / _When editing_ / _Test for violation_ triple, and update SKILL.md and this file in the same edit. Bump the minor version.

**Editing a rule.** Wording-only edits are a patch bump. Changes to a rule's claim or its test for violation are a minor bump. Keep the SKILL.md description and the AGENTS.md maintainer framing aligned — same rule, two audiences.

**Deleting a rule.** Don't. Renumbering breaks the composition map in `references/related-skills.md` and any external citations. If a rule no longer applies, mark it deprecated in place with a reason, then plan a major-version removal.

**Versioning.** `1.2.0` is the current contract. A change to rule count or order is a major bump; substantive edits to a single rule are minor; wording edits are patch. Update the version line at the top of this file and the SKILL.md front matter in the same commit.

**Cross-references.** The twelve sibling skills are `lyra-tdd`, `lyra-clean-code`, `lyra-clean-architecture`, `lyra-code-review`, `lyra-debug`, `lyra-analyze-codebase`, `lyra-nodejs`, `lyra-api-design`, `lyra-e2e-testing`, `lyra-performance`, `lyra-ci-cd`, `lyra-database`.
Rule 9 routes to five of them directly; the full map lives in `references/related-skills.md`, and changes to a sibling's rule surface should trigger a re-read of that file.