---
name: lyra-council
description: "Five-advisor deliberation engine. Spawns five subagents in parallel, each with a fixed persona (Contrarian, First Principles, Expansionist, Outsider, Executor). They peer-review each other anonymously. A chairman synthesizes a verdict: where the council agrees, where it clashes, blind spots caught, the recommendation, and the one thing to do first. Every session is saved to .lyra/council/ so future councils can read what past councils concluded."
compatibility: "Task tool for parallel subagent spawning. Reads CLAUDE.md and memory/ for context. Writes to .lyra/council/."
---

# lyra-council

## What it does

Runs a decision through five advisors who think from different angles, then synthesizes their independent analysis into a verdict a single pass could not produce. Each advisor is a separate subagent spawned in parallel, not one model roleplaying five experts. They peer-review each other's outputs anonymously. A chairman resolves the round into a recommendation.

The council is for decisions where being wrong is expensive: a launch, a pivot, a hire, a refactor strategy. It is wasted on questions with one right answer, on creation tasks, or on casual validation seeking.

Every session is saved to `.lyra/council/sessions/` as JSON. Before convening, the skill reads past sessions whose tags or topic overlap and feeds their verdicts to the advisors. The second council on pricing knows what the first concluded.

## When to convene

Convene when the user faces a genuine decision with stakes, multiple options, and uncertainty. Trigger phrases include "council this", "run the council", "pressure-test this", and "should I X or Y" when a real tradeoff is present. Do not convene for factual lookups, creation tasks, or a casual "should I" with nothing on the line.

## The workflow

1. Frame the question. Read the user's raw question. Scan the workspace for context — `CLAUDE.md`, `memory/`, files the user referenced. Reframe as a neutral prompt all five advisors receive. Include the core decision, the key context, and what is at stake. No opinion from you.
2. Query memory. Read `.lyra/council/index.jsonl`. Find sessions with overlapping tags or topic. Pull their verdicts and first actions into the framed question as prior-session notes.
3. Spawn five advisors in parallel. Use the Task tool, one subagent per advisor. Each gets its persona, the framed question, prior-session notes, and the instruction to lean fully into its angle without hedging. Personas live in `references/advisor-personas.md`. The spawn template is below.
4. Collect responses. Wait for all five. If one times out, note it and proceed with four. Never synthesize with fewer than four.
5. Peer review. Anonymize responses as A through E with a randomized mapping. Spawn five reviewer subagents in parallel. Each sees all five anonymized responses and answers three questions: which is strongest and why, which has the biggest blind spot, what did all five miss. The protocol is in `references/peer-review-protocol.md`.
6. Chairman synthesis. One agent gets the framed question, all five de-anonymized responses, and all five peer reviews. It produces the verdict using the format below. The chairman may side with a minority if the reasoning supports it.
7. Present the verdict in chat.
8. Save the session. Write the full record to `.lyra/council/sessions/{id}.json` and append a line to `.lyra/council/index.jsonl`.

## The advisor spawn

Each advisor is spawned as a Task subagent with this prompt, persona inserted per advisor:

```
You are {advisor_name} on a five-advisor LLM council.

Your thinking style: {persona}

The question brought to the council:
---
{framed_question}
---

Prior council sessions on related topics (build on or contradict; do not ignore):
{prior_session_notes or "none"}

Respond from your perspective only. Lean fully into your angle. Do not hedge and do not try to be balanced — the other advisors cover the angles you do not. If you see a fatal flaw, name it. If you see massive upside, name it.

150 to 300 words. No preamble. Start with the analysis.
```

The five default personas — Contrarian, First Principles, Expansionist, Outsider, Executor — are in `references/advisor-personas.md`. A caller may substitute its own five; lyra-docs passes accuracy, citations, slop, repetition, and completeness for its per-file gate. The orchestration is unchanged.

## The chairman synthesis

The chairman receives the framed question, the five de-anonymized advisor responses, and the five anonymized peer reviews. It produces the verdict in this shape:

```
## Council Verdict: {short topic}

### Where the council agrees
[Points multiple advisors converged on independently. High-confidence signals.]

### Where the council clashes
[Genuine disagreements. Present both sides. Explain why reasonable advisors disagree.]

### Blind spots the council caught
[Things that emerged only through peer review.]

### The recommendation
[A real answer with reasoning. Not "it depends". The chairman may side with a minority.]

### The one thing to do first
[A single concrete next step. Not a list. One thing.]
```

## Memory

Sessions live under `.lyra/council/`:

```
.lyra/council/
├── sessions/
│   └── council-{YYYY-MM-DD-HHMM}-{shortid}.json
└── index.jsonl
```

Each session file is the full record: framed question, raw question, context files read, five advisor responses, five peer reviews, the verdict, tags, and references to prior session IDs. The index is append-only, one JSON line per session with `{id, timestamp, topic, tags, recommendation, first_action, references}`. The full schema and query patterns are in `references/memory-schema.md`.

Sessions are never edited. If a decision is revisited, a new session is written that references the prior one in its `references` field. The chain is the audit trail.

## Composes with

- `lyra-docs` — invokes lyra-council for its per-file review gate. lyra-docs passes its own five advisors and the draft file as the question. The orchestration is unchanged.
- `lyra` — when prompt optimization surfaces a real decision (which platform, which structure), convene a council before shipping.
- `lyra-code-review` — for pre-merge calls with genuine tradeoffs (architectural direction, breaking change), a council pressure-tests the decision.
- `lyra-clean-architecture` — when the pattern choice is contested for a specific service, the council debates it.

The external `llm-council` skill covers similar ground without memory or composition. Inside the Collection, lyra-council is preferred because it persists and composes.

---

_Part of the [skill collection](../README.md)._