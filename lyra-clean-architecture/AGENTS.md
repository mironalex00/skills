# lyra-clean-architecture

**Version 1.0.0** · Alexandru Miron · July 2026

> Note for agents maintaining this skill: this file is the maintainer's companion to SKILL.md. The rules below are a mirror, not a paraphrase — if you change one, change both in the same edit. Keep the rule count in lockstep with SKILL.md (currently eight). Anything written here that diverges from SKILL.md is a bug.

## Abstract

This skill walks a top-down decision tree — NONE → Layered → Hexagonal → DDD — so a project reaches for more architecture only when the cost of not having it is real. The Dependency Rule (dependencies point inward, toward business policy) is the one principle that unifies all four levels. It is a default-off skill: the lightest option that fits is the correct one, and architecture can always be added later but rarely removed.

## Invariants

Three load-bearing properties hold the skill together. Break any of them and the rest stops making sense.

1. **The decision tree defaults to less.** Every branch starts from the lighter option and descends only on a cost-based justification. If the tree ever stops biasing toward NONE, the skill has been captured by architecture-as-virtue thinking.
2. **The Dependency Rule is the unifying principle.** It is the only rule that applies at every level — NONE through DDD — and the only test that catches a wrong boundary regardless of which level was chosen. Lose it and the four levels become four unrelated styles.
3. **Rule numbers are stable.** Other skills, prompts, and reviewer muscle memory reference "rule 2" or "rule 6" by position. Never renumber; add new rules at the end, deprecate in place with a note.

## Rules

### 1. Default to less.

**The rule:** Architecture has no off switch by default — supply one. Make the case to add a layer, not to remove it. If you can't cite the specific cost of not having it, don't add it.

**When editing:** Keep the framing as a default-off switch. Do not soften "make the case to add" into "consider adding." The burden of proof sits on the addition, always.

**Test for violation:** Ask the author to finish the sentence "the specific cost of not having this layer is \_\_\_." If they can't, the layer should not exist.

### 2. The Dependency Rule always applies.

**The rule:** Source dependencies point inward, toward higher-level policy. Inner code never names outer code. Define the interface in the inner layer; implement it in the outer. Data crossing a boundary uses the form most convenient for the inner layer — never an ORM entity, never an HTTP request object.

**When editing:** The bad/good pair (ORM entity passed through vs. adapter maps to `CreateOrderInput`) is the canonical illustration; keep it. Preserve the language-agnostic phrasing — Protocol in Python, interface-at-consumer in Go, interface in the port package in Java/Kotlin.

**Test for violation:** If an inner module imports an outer module — by name, type, or transitive package — the boundary is broken. If a business-rule unit test needs a running database or framework, the boundary is wrong; fix the boundary, don't mock harder.

### 3. A port without two implementations is a premature port.

**The rule:** Real plus fake-for-tests counts. Real plus "we might add Kafka later" does not. Delete the port until the second implementation is real. Same for wrapping `Logger`, `Clock`, or `UUID` — wrap only when a test actually exercises the seam.

**When editing:** Resist the urge to enumerate things that "usually" deserve ports. The list stays short on purpose.

**Test for violation:** Count implementations. One real + one test double is the floor. Anything speculative fails.

### 4. Don't extract for CRUD.

**The rule:** A Use Case class for a one-line delegation is ceremony — inline it in the controller. A domain entity for CRUD is premature — a plain record or struct is correct until business rules appear. Wait until logic exists.

**When editing:** "Wait until logic exists" is the load-bearing clause. Do not replace it with "wait until the entity feels important" or any other vibe-based trigger.

**Test for violation:** If deleting the extracted class and inlining its body into the caller changes no behavior and no test, it was ceremony.

### 5. Don't reuse the persistence model as the domain model.

**The rule:** Schema changes will rewrite business rules. Keep a persistence model and a domain entity; map between them at the adapter.

**When editing:** The `User` / `passwordHash` example is the canonical illustration — the domain entity hides fields the persistence row exposes. Keep it; it does more work than paragraphs of prose.

**Test for violation:** If a use case reads a field that exists only because the database needs it (e.g. `passwordHash`, `updatedAt`, soft-delete flags), the models are collapsed.

### 6. Confine `new` for adapters to the composition root.

**The rule:** One place wires real adapters to ports. Everything else takes dependencies as arguments. A microservice with a shared database is not an architecture — it's a distributed monolith. Either share nothing, or stay monolithic with clean internal boundaries.

**When editing:** The composition root is the only place `new` is allowed for adapters. Keep the distributed-monolith clause; it is the rule's second half, not a footnote.

**Test for violation:** Grep for `new` (or equivalent construction) outside the composition root. Any hit that constructs an adapter is a violation. For the second clause: two services writing to the same database tables is a distributed monolith.

### 7. Never introduce a bounded context for a single team.

**The rule:** Bounded contexts exist to bound team boundaries and model divergence. One team, one model. Split when teams split.

**When editing:** Three sentences. Do not expand into prose about "strategic vs. tactical DDD" — the skill is deliberately short.

**Test for violation:** If the org chart has one team owning both contexts, the split is premature.

### 8. Strangler, not big-bang.

**The rule:** Don't rewrite a working system to Clean Architecture in one pass. Move one slice at a time, behavior-preserving tests first. The Dependency Rule is language-agnostic — `Protocol` in Python, interface-at-consumer in Go, interface in the port package in Java/Kotlin.

**When editing:** "Behavior-preserving tests first" is the safety clause; do not drop it. The language-agnostic list is shared with rule 2 — keep them consistent across edits.

**Test for violation:** If the migration plan touches more than one slice in a single change, or has no characterization tests ahead of the refactor, it is big-bang.

## Maintenance notes

- Rule count is eight. If you add a ninth, append it; never insert or renumber. Update SKILL.md in the same commit.
- The worked example in SKILL.md (TypeScript, `CreateOrder` with two outbound ports) is the reference shape for Hexagonal. If you change the rules in a way that would invalidate the example, fix the example in the same edit.
- The decision tree's four levels (NONE, Layered, Hexagonal, DDD) and their entry conditions are the skill's spine. Editing one level's entry condition without re-reading the other three is how the tree drifts into incoherence.
- "When two options tie, take the lighter one" is the tiebreaker that makes the tree decidable. If a future edit removes it, the tree stops being a tree.
- This skill pairs with lyra-clean-code (class-level quality inside the layers) and lyra-tdd (the test-first workflow that makes the boundaries safe to move). If the boundaries here stop being testable in isolation, that is usually a lyra-tdd problem surfacing as an architecture problem.