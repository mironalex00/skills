# The Skill Collection

**AI skills, each one a specialist. This is one of them.**

## What's a "skill"?

A skill is a packaged capability for an AI agent — a `SKILL.md` file with instructions, plus optional references and a `plugin.json` metadata file. When the agent invokes a skill via `Skill(command="name")`, it loads specialized instructions for that specific task. Think of it as a plugin that teaches the AI how to do one thing well.

---

## Why this collection exists

Raw prompts are brittle. You write a great prompt for one task, forget it, and reinvent it next time. **Skills fix this**: they capture expertise in a reusable, composable format. The collection exists so that instead of prompting from scratch every time, you invoke a specialist that already knows the domain — prompt optimization, TDD, clean architecture, debugging, database engineering, and twelve others.

The thesis: composable, portable, expertise-encoded units beat brittle one-shot prompting. Each skill makes the others more valuable.

---

## Installation

You can install this collection directly into your project using one of the following commands:

```bash
pnpm dlx skills add https://github.com/mironalex00/skills
# or
npx skills add https://github.com/mironalex00/skills
```

If you prefer to install only a specific skill, you can specify it using the `--skill` option:

```bash
pnpm dlx skills add https://github.com/mironalex00/skills --skill <skill_name>
# or
npx skills add https://github.com/mironalex00/skills --skill <skill_name>
```

---

## How to use a skill

1. **Find the right skill** — scan the catalog below, or invoke `Skill(command="find-skills")` to discover what's available
2. **Invoke it** — `Skill(command="skill-name")` loads the skill's instructions into the AI's context
3. **State your task** — the AI now follows the skill's methodology for that task

---

## What skills are FOR

- **Repeatable workflows** — anything you do more than once (prompt optimization, TDD cycles, pre-merge code review, debugging a regression)
- **Specialized domains** — clean architecture, API design, database engineering, CI/CD, E2E testing, where methodology matters
- **Multi-step pipelines** — analyze → plan → implement → review, where each stage has its own skill
- **Quality-critical output** — anything where "good enough" isn't good enough

## What skills are NOT for

- **One-off trivial tasks** — if it takes longer to find the skill than to do the task, just do the task
- **Creative exploration** — skills encode methodology; pure brainstorming wants no methodology
- **Replacing human judgment** — a skill structures the work; it doesn't decide what's true or right
- **Tasks outside the AI's capability** — no skill makes a model do real-time data, guaranteed accuracy, or deterministic behavior on a probabilistic system
- **Unvalidated automation at scale** — test a skill on one task before chaining it across 1,000

---

## Composability: the real unlock

Skills compose. This is the flywheel: each skill makes the others more valuable. The collection isn't isolated tools — it's a toolkit where the parts fit together. The twelve code skills were designed to chain behind Lyra: Lyra plans, a specialist executes, Lyra verifies.

**Example chain:**

1. **lyra** (`Skill(command="lyra")`) deconstructs a vague request and produces an execution plan — files, order, test strategy
2. **lyra-clean-architecture** picks the right structural pattern for the plan
3. **lyra-tdd** writes tests first, implementation second, at 100% coverage
4. **lyra-code-review** runs the pre-merge checklist before declaring done

One prompt, four skills, one finished feature. That's the promise.

---

## Browsing the collection

| Method | When to use |
|---|---|
| Scan the catalog below | You know the rough category and want to scan names |
| `Skill(command="find-skills")` | You want the host's native discovery |
| Read any skill's `SKILL.md` | You've found a candidate and want to assess fit |
| Read any skill's `README.md` | You want the user-facing summary, not the full methodology |
| Read any skill's `AGENTS.md` | You're maintaining or extending a skill and need the invariants |

---

## Skill anatomy (standard format)

Every skill in this collection follows the same structure:

```
skill-name/
├── SKILL.md          ← instructions the AI loads (YAML frontmatter + markdown body)
├── AGENTS.md         ← maintenance contract for the next agent editing this skill
├── plugin.json       ← metadata: name, version, description, author, license
├── README.md         ← user-facing summary (what it does, when to reach for it)
└── references/       ← deep content loaded on demand (optional)
    └── *.md
```

This consistency is what makes skills composable: any skill can reference any other skill by name, and the invocation contract (`Skill(command="...")`) is uniform across the collection.

---

## The collection grows

This is a beginning, not a ceiling. New skills get added as new domains, platforms, and workflows are encoded. The bar for inclusion: a skill must do one thing well, follow the standard format, ship an `AGENTS.md` maintenance contract, and compose cleanly with the rest of the collection.

---

## The complete catalog

**All 13 skills**, organized by category. Each entry links to its `SKILL.md` — relative paths so links work in the web viewer, on GitHub, and inside the extracted ZIP.

| Category | Count |
|---|---:|
| [Prompt & Code Engineering](#prompt--code-engineering) | 1 |
| [Code Quality & Architecture](#code-quality--architecture) | 4 |
| [Debugging & Analysis](#debugging--analysis) | 2 |
| [Implementation Specializations](#implementation-specializations) | 4 |
| [Operations & Performance](#operations--performance) | 2 |
| **Total** | **13** |

### Prompt & Code Engineering

*1 skill*

- **[lyra](./lyra/SKILL.md)** — Prompt optimization and code engineering. Turns vague requests into precision prompts for any AI model, and produces plan-first, test-driven code at 100% coverage. The orchestrator of the collection; composes with the twelve code skills below for any code task.

### Code Quality & Architecture

*4 skills*

- **[lyra-tdd](./lyra-tdd/SKILL.md)** — Test-driven development with a 100% coverage gate that actually catches dummy tests. Nine languages.
- **[lyra-clean-code](./lyra-clean-code/SKILL.md)** — Twenty clean-code rules with weak/correct example pairs in eight languages, each tied back to testability.
- **[lyra-clean-architecture](./lyra-clean-architecture/SKILL.md)** — One decision tree: none → layered → hexagonal → DDD. Worked examples in TS/Python/Go.
- **[lyra-code-review](./lyra-code-review/SKILL.md)** — Seven-category pre-merge checklist with merge-blocking vs advisory severity gating.

### Debugging & Analysis

*2 skills*

- **[lyra-debug](./lyra-debug/SKILL.md)** — Scientific-method debugging: hypothesize, test one change, conclude. Anti-tunnel-vision and anti-shotgun-debugging built in.
- **[lyra-analyze-codebase](./lyra-analyze-codebase/SKILL.md)** — Read-only codebase analysis with a structured report. Run before any refactor.

### Implementation Specializations

*4 skills*

- **[lyra-nodejs](./lyra-nodejs/SKILL.md)** — Node.js backends grounded in the event-loop mental model. Framework selection, async, security.
- **[lyra-api-design](./lyra-api-design/SKILL.md)** — API design as a contract: OpenAPI-first, backwards-compatible by default, versioning discipline.
- **[lyra-e2e-testing](./lyra-e2e-testing/SKILL.md)** — Playwright-first E2E with flaky-test elimination and CI integration.
- **[lyra-database](./lyra-database/SKILL.md)** — Postgres, MySQL, SQLite: schema, queries, transactions, migrations. Twenty-two rules.

### Operations & Performance

*2 skills*

- **[lyra-performance](./lyra-performance/SKILL.md)** — Measurement-first optimization across the full stack. No change without a baseline number.
- **[lyra-ci-cd](./lyra-ci-cd/SKILL.md)** — CI/CD pipelines that are fast, safe, and reversible. All three required; pick two and you've picked none.
