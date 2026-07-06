# lyra-council

Runs a decision through five advisors who think from different angles, then synthesizes their independent analysis into a verdict a single pass could not produce. Each advisor is a separate subagent spawned in parallel, not one model roleplaying five experts. They peer-review each other's outputs anonymously. A chairman resolves the round into a recommendation.

The five advisors are fixed: the Contrarian finds flaws, the First Principles thinker strips to fundamentals, the Expansionist finds upside, the Outsider catches the curse of knowledge, the Executor names the concrete first step.

Every session is saved to `.lyra/council/sessions/` as JSON, with an append-only index at `.lyra/council/index.jsonl`. Before convening, the skill reads past sessions whose tags or topic overlap and feeds their verdicts to the advisors. The second council on pricing knows what the first concluded.

**Reach for it when:** a decision with stakes, multiple options, and genuine uncertainty — a launch, a pivot, a hire, a refactor strategy, a contested architectural call.
**Don't:** factual lookups, creation tasks, casual validation seeking, or anything with one right answer.

Composes with lyra-docs (per-file review gate), lyra (decisions surfaced during prompt optimization), lyra-code-review (pre-merge tradeoffs), and lyra-clean-architecture (contested pattern choices).

_Part of the [skill collection](../README.md)._