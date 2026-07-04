# lyra-debug

**Version 1.0.0**
Alexandru Miron
July 2026

> **Note:**
> This file is the maintainer's companion to SKILL.md. SKILL.md tells an agent how to debug; AGENTS.md tells an agent how to edit this skill. When the two disagree, fix SKILL.md first, then update this file to match.

---

## Abstract

lyra-debug applies the scientific method to every defect, from a unit-test failure to a prod-only race, treating a bug as the gap between your mental model and the system's actual behavior. It is tool-light and language-agnostic, leaning on disciplined reproduction, one change per iteration, and root-cause analysis over symptom-fixing. The point is to make the next bug cheaper than the last one.

---

## Invariants

Three load-bearing properties hold the skill up. A change that preserves them is almost certainly safe; one that weakens any of them is almost certainly wrong.

1. **The scientific method is the spine.** Every rule specializes observe → hypothesize → test → conclude. Anything that drifts toward "just try things" or "trust your gut" breaks the skill.
2. **One change per iteration.** Causation is only provable when variables are isolated. Rules that permit bundled changes destroy the ability to confirm the cause.
3. **The regression test precedes the fix.** The test is the executable form of the bug; without it the fix is an opinion, and the bug will return.

---

## Rules

### 1. Treat every bug as a hypothesis to falsify

**The rule:** State the cause as "the bug occurs because <X>." A hunch you haven't written down is panic waiting to happen.
**When editing:** Keep the hypothesis as a written, falsifiable statement; "think about the cause" is not a substitute.
**Test for violation:** Can an agent skip the written hypothesis and still feel compliant? If yes, the rule has been weakened.

### 2. No reproduction, no fix

**The rule:** No repro, no proof the fix worked — "it stopped" is hiding, not fixing. A flaky repro still counts; amplify races with stress runs rather than re-running until green.
**When editing:** Preserve the "stopped" vs "fixed" distinction and the flaky/race guidance; "I restarted and it works" is not a repro.
**Test for violation:** Does the rule allow shipping a fix without a reproducer? If yes, the rule has lost its teeth.

### 3. Reduce to the minimal reproducer

**The rule:** Strip inputs, dependencies, and code paths until removing one more thing makes the bug disappear. Ten lines of focused test beats 90 seconds of e2e.
**When editing:** Keep the "removing one more thing makes it disappear" criterion; that is what minimal means, not merely small.
**Test for violation:** Can a 90-line e2e test be called "minimal" under this rule? If yes, the rule has drifted from minimal to small.

### 4. Binary-search the location

**The rule:** If the bug exists in state A but not B, the cause is in the difference. Halve it repeatedly — `git bisect` over commits, prints over execution.
**When editing:** Keep the two-state framing; the comparison is the power, and halving is just the tactic.
**Test for violation:** Does the rule still name a concrete tactic (`git bisect`, prints) and not only an abstract "narrow it down"?

### 5. Verbalize your mental model

**The rule:** Explain the triggering path out loud, line by line, to a duck or a colleague. Speech forces a linear sequence and surfaces the gap you were skipping.
**When editing:** Preserve "out loud, line by line" — silent re-reading does not produce the same effect; the friction of speech is the point.
**Test for violation:** Does the rule allow silent review to satisfy it? If yes, the mechanism has been lost.

### 6. Rank hypotheses, don't anchor

**The rule:** List plausible causes, rank by likelihood × ease of test, test the top one. Your first guess is one of N; your code is wrong 99% of the time.
**When editing:** Keep the ranking step and the "your code is wrong 99% of the time" reminder; both fight the same bias.
**Test for violation:** Can an agent test its first guess without ranking? If yes, the rule permits the anchoring it was written to prevent.

### 7. Change exactly one thing per iteration

**The rule:** Two changes and the bug disappears leaves you unable to say which mattered — or which introduced the next bug. One change, one observation; revert if no effect.
**When editing:** This is invariant #2 in rule form; keep the revert step, which turns "one change" from guideline into discipline.
**Test for violation:** Does the rule permit shipping a multi-change patch if the bug went away? If yes, the invariant is broken.

### 8. Confirm the cause, not the absence of the symptom

**The rule:** The fix removes the symptom, reverting restores it, and the mechanism matches your hypothesis. All three, or you have a coincidence — "I changed X and it went away" is correlation, not causation.
**When editing:** Keep all three criteria; dropping the revert-restores check weakens rule 7's neighbor, dropping the mechanism check turns it into "it works, ship it."
**Test for violation:** Can the rule be satisfied by "the bug is gone" alone? If yes, two of three legs have been cut.

### 9. Write the failing regression test before the fix

**The rule:** The test is the executable form of the bug — it must fail before the patch and pass after. Without it, the fix is an opinion, and the bug will return.
**When editing:** This is invariant #3 in rule form; preserve red-before-green, since a test written after the fix proves nothing.
**Test for violation:** Does the rule accept a test written after the patch? If yes, the rule has collapsed into "add a test."

### 10. Log then trace, especially for prod-only bugs

**The rule:** When you can't attach a debugger, add structured logs at the boundary first; logs prove the path taken, a debugger proves the path you assumed. Never "works on my machine" a prod-only bug.
**When editing:** Keep the boundary-first log placement and the "works on my machine" warning; both are what make this a prod-only rule.
**Test for violation:** Can the rule be satisfied by attaching a debugger in a non-prod environment? If yes, the prod-only case is uncovered.

### 11. 5 Whys to root cause

**The rule:** The proximate cause is rarely the root. Ask why five times — or until you hit a process, system, or missing safeguard, never a person.
**When editing:** Preserve the "never a person" boundary; the 5 Whys collapses into blame the moment it lands on an individual.
**Test for violation:** Can the chain end at "the engineer made a mistake"? If yes, the rule has become a blame-finder.

### 12. Document the bug, the cause, and the fix

**The rule:** The PR states the symptom, the minimal reproducer, the root cause, the fix, and the regression test that guards it. Undocumented fixes get re-introduced.
**When editing:** Keep the five-part structure; removing one part (usually reproducer or root cause) is what lets the bug come back unnoticed.
**Test for violation:** Can a PR merge with only "fixed X" in the body? If yes, the rule has been reduced to a courtesy.

---

## Maintenance notes

- SKILL.md is the source of truth for behavior; this file is the source of truth for editing. Keep them in lockstep; the rule count is 12 in both.
- The three invariants are load-bearing. A change that appears to weaken any of them deserves a second look — most often it signals the rule was misunderstood, not that the skill needs to flex.
- Examples in SKILL.md use Go, TypeScript, shell, and prose. When adding one, pick the language that best shows the rule, not the one that matches its neighbors.
- This is part of the Alexandru Miron; sibling skills follow the same maintenance shape. Edit this file the way you would edit theirs.