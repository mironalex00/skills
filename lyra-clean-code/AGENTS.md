# lyra-clean-code

**Version 1.0.0**  
Alexandru Miron  
July 2026

> **Note:**
> This file is for the agent maintaining the lyra-clean-code skill, not for end users. End users read SKILL.md; this document is the maintenance contract. If you change a rule here, change it in SKILL.md in the same edit, and vice versa — the two files must never drift.

---

## Abstract

Twenty language-agnostic rules for code that is cheap to change and easy to test. Each rule ships a bad/good pair in a real language and ties back to testability — if a function resists a test, a rule is being broken somewhere.

---

## Invariants

Three properties hold the skill together. Break any of them and the rules stop working.

1. Every rule ties back to testability — untestable code is broken code, and the rules are the diagnostic.
2. Each rule ships a bad/good pair in a real language. No prose-only rules, no pseudocode-only rules.
3. Rule numbers are the citation currency in code review — stable, ordered, and referenced by other rules. Never renumber casually.

---

## Rules

### 1. Reveal intent in every name
**The rule:** A name answers *what*, not *how*. If you need a comment to explain the name, the name failed.
**When editing:** Keep the bad/good pair short and in a real language. The good name must read like a sentence when spoken aloud.
**Test for violation:** Say the name out loud. If a colleague asks "what does that mean?" before reading the code, the name is wrong.
### 2. Don't disinform with names
**The rule:** `accountList` that holds a `Map` lies about type. Vague beats misleading.
**When editing:** Don't soften the lie to make a codebase feel better. If a name's type word (`List`, `Array`, `Map`) disagrees with the declared type, that is the violation.
**Test for violation:** Read the type from the name's suffix. If it doesn't match the declared type, the rule is broken.
### 3. Drop noise suffixes
**The rule:** `Data`, `Info`, `Helper`, `Manager`, `Processor` add zero information. Name what the thing actually does.
**When editing:** Replace, don't delete. A `Manager` with no specific verb is a missing design decision, not a styling issue.
**Test for violation:** Strip the suffix from the name. If what remains is still meaningful, the suffix was noise.
### 4. Do one thing
**The rule:** If you can extract another function at a different level of abstraction, do it. Extract until you can't.
**When editing:** Keep the bad example visibly doing three things at three levels. The good example must collapse to one level only.
**Test for violation:** List the verbs the function body performs. More than one level of abstraction means it does more than one thing.
### 5. Cap arguments at two
**The rule:** Three or more arguments signal a hidden object. Group them into a struct.
**When editing:** Preserve the group-into-a-struct move. Don't suggest default arguments as the fix.
**Test for violation:** Count positional parameters. Three or more, and the rule fires unless they naturally form a single concept.
### 6. Kill flag arguments
**The rule:** A boolean parameter means the function does two things. Split it into two named functions.
**When editing:** The split must produce two clearly named functions, not one with a defaulted flag.
**Test for violation:** Search for boolean parameters in signatures. Any call site reading the flag at the top of a branch is a violation.
### 7. No hidden side effects
**The rule:** A function named `get*` or `is*` must not mutate state, write to disk, or fire HTTP. Side effects belong in verbs named for the effect.
**When editing:** Keep the `get*`/`is*` prefix as the trigger. Don't extend the rule to verbs like `send` or `save` that promise a side effect.
**Test for violation:** Trace a `get*` or `is*` call. If it writes anything anywhere, the rule is broken.
### 8. One responsibility per class
**The rule:** A class has one reason to change. If two unrelated teams would edit it for unrelated reasons, split it.
**When editing:** Keep the "two unrelated teams" framing. It's the load-bearing intuition; without it, the rule collapses into taste.
**Test for violation:** Name the actors who would change the class. Two or more unrelated reasons to change means split.
### 9. Open for extension, closed for modification
**The rule:** Add behavior by adding a new type, not by editing a switch. New discount = new class, not new `case`.
**When editing:** Use a switch-vs-polymorphism pair. Other shapes (strategy, visitor) are fine but the example stays concrete.
**Test for violation:** Find every switch on a type field. Each case is a place the codebase must be edited to add a variant.
### 10. Honor Liskov substitution
**The rule:** Subtypes must be usable wherever the base type is, with no surprises.
**When editing:** The Square/Rectangle pair is canonical for a reason; keep it. Don't soften the surprise into a contract note.
**Test for violation:** Substitute a subtype where the base is expected. If the caller must special-case the subtype, the rule is broken.
### 11. Segregate fat interfaces
**The rule:** Clients depend only on the methods they call. Fat interfaces force clients to implement methods they don't use.
**When editing:** Keep the Robot-must-eat framing; it makes the cost visible. The fix is split interfaces, not default no-op implementations.
**Test for violation:** List interface methods. If any client implements one only to satisfy the compiler, the interface is too fat.
### 12. Depend on abstractions, not concretions
**The rule:** High-level policy depends on interfaces. `new ConcreteRepo()` inside a domain service couples you to a detail.
**When editing:** Keep the injection-via-constructor fix. A factory hidden inside the service is still a violation.
**Test for violation:** Grep for `new` inside domain logic. Every match where the constructed type is a detail is a violation.
### 13. Co-locate what changes together
**The rule:** Classes that change together live in the same package. Classes that change for unrelated reasons live apart.
**When editing:** Use the billing/shipping split; it shows that the rule is about change axes, not feature domains.
**Test for violation:** Open recent commits. If two files always change together but live apart, or change apart but live together, the rule is broken.
### 14. Break dependency cycles
**The rule:** If `A → B → C → A`, no module can be understood or released on its own. Break the cycle with an interface and inversion.
**When editing:** The fix is an interface owned by the downstream module, not a shared utils package.
**Test for violation:** Draw the module graph. Any cycle means the rule is broken, regardless of how small the cycle is.
### 15. Return results, not error codes
**The rule:** Error codes are silently ignorable. Use a `Result`, `Option`, or `Exception` type the caller is forced to handle.
**When editing:** Keep at least one language where the type system forces handling (Go `error`, Rust `Result`, checked exception). Untyped returns dilute the rule.
**Test for violation:** Look for `int` or `string` return codes. If the caller can ignore them and the program still compiles, the rule is broken.
### 16. Never return null
**The rule:** Return an empty collection, `Option<T>`, `Result<T, E>`, or a Null Object. Null turns every caller into a defensive minefield.
**When editing:** Empty collections for plural queries, `Option` for singular. Don't conflate the two.
**Test for violation:** Grep return types for nullable. Each one is a future `NullPointerException` waiting to happen.
### 17. Never pass null
**The rule:** If a parameter can be null, you have two functions. Make the optional case explicit with overloads, option types, or sentinels.
**When editing:** The fix is two signatures or an `Option` type, not a nullable parameter with an internal branch.
**Test for violation:** Find nullable parameters. Each one is a hidden second function pretending to be one.
### 18. If you can't test it first, the design is wrong
**The rule:** Before writing a function, write its test. If the test needs 5+ mocks, a real database, or a `sleep`, the design violates Rule 12 or Rule 4.
**When editing:** Keep the cross-reference to Rule 12 and Rule 4. This rule is a detector, not a standalone fix.
**Test for violation:** Try to write the test first. If you can't without scaffolding, redesign before coding.
### 19. Inject every dependency
**The rule:** No `new`, no `os.environ`, no `DateTime.now()`, no `Math.random()` inside business logic. Pure logic is testable logic.
**When editing:** Keep the list of banned calls concrete and short. The fix is to pass the source of nondeterminism in as a parameter.
**Test for violation:** Grep business logic for `new`, `now`, `random`, `environ`. Every match is a hidden dependency.
### 20. Prefer immutability
**The rule:** Mutable shared state is the largest source of concurrency bugs. Make records immutable; copy-on-change.
**When editing:** The `reduce`/`forEach` pair is the canonical example; keep it. Don't drift into a lecture on functional programming.
**Test for violation:** Find `let` bindings mutated inside loops or callbacks. Each one is a candidate for an immutable fold.

---

## Maintenance notes

The next agent's contract — read before editing the rule set.

**Adding a rule.** Append it as the next numbered rule, ship a bad/good pair in a real language, and tie it back to testability in one sentence. Update SKILL.md and this file in the same edit. Bump the minor version.

**Editing a rule.** Wording-only edits are a patch bump. Changes to the rule's claim, its bad/good pair, or its test are a minor bump. Keep the bad/good pair in the same language as before unless the rule itself is about that language.

**Deleting a rule.** Don't. Renumbering breaks citations in existing review comments and PRs. If a rule no longer applies, mark it deprecated in place and explain why, then plan a major-version removal.

**Versioning.** `1.0.0` means the rule set is locked. Any change to the rule count or order is a major bump. Wording edits are patch; substantive edits to a single rule are minor. Update the version line at the top of this file and the SKILL.md front matter together.