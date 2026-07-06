# Related Skills — Lyra's Composition Map

Lyra doesn't reinvent what other skills already do. For code tasks, Lyra composes with existing project skills and the Alexandru Miron. Read this before any code task to know what to invoke.

## Table of contents

1. [Project skills (invoke, don't duplicate)](#project-skills-invoke-dont-duplicate)
2. [The twelve sibling skills](#the-twelve-sibling-skills)
3. [Composition patterns](#composition-patterns)
4. [When to use which](#when-to-use-which)

---

## Project skills (invoke, don't duplicate)

These live in `./.claude/skills/` (or `.agents/skills/`, `.cursor/skills/` — wherever your host stores skills). Invoke via `Skill(command="name")` when the task warrants.

### Architecture & patterns

| Skill                                                 | Invoke when                                                             | What it gives you                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`clean-architecture`](../clean-architecture)         | The task needs layered architecture (entities → use cases → frameworks) | The Dependency Rule, ports & adapters, where business logic lives        |
| [`hexagonal-architecture`](../hexagonal-architecture) | The task needs Ports & Adapters with clear domain boundaries            | Hexagonal patterns in TS/Java/Kotlin/Go, testable use-case orchestration |
| [`architecture-patterns`](../architecture-patterns)   | The task needs proven backend patterns (Clean, Hexagonal, DDD)          | Bounded contexts, dependency inversion, slicing a monolith               |
| [`api-design-expert`](../api-design-expert)           | Designing REST APIs, OpenAPI docs, versioning                           | RESTful best practices, error handling, versioning for NestJS            |

### Code quality & review

| Skill                                                   | Invoke when                                  | What it gives you                                            |
| ------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| [`clean-code`](../clean-code)                           | Refactoring for readability, removing smells | Uncle Bob's principles, component cohesion, SOLID            |
| [`code-review-and-quality`](../code-review-and-quality) | Multi-axis review before merging             | Correctness, TS hygiene, security, DB safety, test existence |
| [`code-review`](../code-review)                         | Reviewing a diff / PR                        | Bug catching, TS hygiene, security gate for incoming PRs     |

### Testing & TDD

| Skill                                             | Invoke when                                                    | What it gives you                                                            |
| ------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`laravel-tdd`](../laravel-tdd)                   | TDD patterns in Laravel (Pest, PHPUnit, Sanctum)               | Model factories, HTTP tests, mocking — adapt the _patterns_ to your language |
| [`e2e-testing`](../e2e-testing)                   | Playwright E2E patterns, POM, CI integration                   | Page Object Model, flaky test strategies, artifact management                |
| [`laravel-verification`](../laravel-verification) | The verification loop (lint, static analysis, tests, security) | Adapt the verification phases to your stack                                  |

### Language & framework specifics

| Skill                                                   | Invoke when                                              | What it gives you                                       |
| ------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| [`nodejs-best-practices`](../nodejs-best-practices)     | Node.js decisions (framework selection, async, security) | Thinking principles, not just snippets                  |
| [`nodejs-backend-patterns`](../nodejs-backend-patterns) | Express/Fastify production patterns                      | Middleware, error handling, auth, DB integration        |
| [`mysql-patterns`](../mysql-patterns)                   | MySQL/MariaDB schema, indexing, transactions             | Production query, replication, connection-pool patterns |
| [`laravel-specialist`](../laravel-specialist)           | Laravel 10+ (Eloquent, Sanctum, Horizon, Livewire)       | Models, queues, auth flows, Pest tests                  |
| [`laravel-patterns`](../laravel-patterns)               | Laravel architecture (routing, Eloquent, queues)         | Service layers, events, caching, API resources          |
| [`laravel-security`](../laravel-security)               | Laravel security (auth, CSRF, XSS, API)                  | Production hardening                                    |
| [`php-pro`](../php-pro)                                 | Modern PHP 8.3+ (strict typing, PHPStan 9, Swoole)       | Async, static analysis, modern features                 |

### Debugging & analysis

| Skill                                             | Invoke when                                       | What it gives you                                                 |
| ------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| [`debug`](../debug)                               | Systematic debugging of bugs/failures/regressions | Reproducible feedback loops, hypothesis testing, regression tests |
| [`debugging-strategies`](../debugging-strategies) | Profiling tools, root cause analysis              | Systematic techniques across stacks                               |
| [`debug-tools`](../debug-tools)                   | Iterative debugging with confidence scoring       | Log injection, auto-cleanup, escalation patterns                  |
| [`bug-hunter`](../bug-hunter)                     | Adversarial bug hunting                           | Sequential pipeline (Recon → Hunter → Skeptic → Referee)          |
| [`analyze-codebase`](../analyze-codebase)         | Architecture/security/perf/quality audit          | Comprehensive codebase analysis before refactoring                |
| [`analyze-project`](../analyze-project)           | Read-only deep inspection of a repo               | Model structure, training/inference entrypoints                   |

### DevOps & CI

| Skill                                                     | Invoke when                                  | What it gives you                           |
| --------------------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| [`ci-cd-and-automation`](../ci-cd-and-automation)         | CI/CD pipeline setup, quality gates          | Build/deploy automation, test runners in CI |
| [`performance-expert`](../performance-expert)             | Perf optimization (frontend render, API, DB) | React/Next/Nest perf patterns               |
| [`performance-optimization`](../performance-optimization) | Core Web Vitals, load times, profiling       | Bottleneck identification                   |

---

## The twelve sibling skills

Lyra composes with twelve sibling skills in the same `/skills/` directory. Each was built via LLM Council deliberation. Invoke them directly or let Lyra orchestrate.

| Skill                                                   | What it does                                                                                                                                 | When Lyra invokes it                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`lyra-tdd`](../lyra-tdd)                               | TDD with a 100% coverage gate and anti-dummy-test enforcement                                                                                | Any code task — Red-Green-Refactor cycle                      |
| [`lyra-clean-code`](../lyra-clean-code)                 | Twenty clean-code rules with weak/correct examples in eight languages                                                                        | Refactoring for readability and testability                   |
| [`lyra-clean-architecture`](../lyra-clean-architecture) | One decision tree: none → layered → hexagonal → DDD                                                                                          | Architecture decisions, structuring a new module              |
| [`lyra-code-review`](../lyra-code-review)               | Seven-category pre-merge checklist with P0–P3 severity gating                                                                                | Before declaring any code task done                           |
| [`lyra-debug`](../lyra-debug)                           | Scientific-method debugging: hypothesize, test one change, conclude                                                                          | Bug fixes, regressions, flaky behavior                        |
| [`lyra-analyze-codebase`](../lyra-analyze-codebase)     | Read-only codebase analysis with a structured report                                                                                         | Before any refactor, or when assessing an unfamiliar codebase |
| [`lyra-nodejs`](../lyra-nodejs)                         | Node.js backends grounded in the event-loop mental model                                                                                     | Node/Express/Fastify/NestJS tasks                             |
| [`lyra-api-design`](../lyra-api-design)                 | API design as a contract: OpenAPI-first, backwards-compatible                                                                                | Designing REST/GraphQL/gRPC APIs                              |
| [`lyra-e2e-testing`](../lyra-e2e-testing)               | Playwright-first E2E with flaky-test elimination                                                                                             | Browser-level user-journey tests                              |
| [`lyra-performance`](../lyra-performance)               | Measurement-first optimization across the full stack                                                                                         | When something is slow, or before it gets slow                |
| [`lyra-ci-cd`](../lyra-ci-cd)                           | CI/CD pipelines that are fast, safe, and reversible                                                                                          | Pipeline setup, deployment strategy, rollback                 |
| [`lyra-database`](../lyra-database)                     | Postgres, MySQL, SQLite — schema, queries, transactions, migrations                                                                          | Any database work                                             |
| [`lyra-docs`](../lyra-docs)                             | Code documentation generator. Writes `docs/` with a directory tree, index, and per-module docs. Every claim cites file:line.                 | Generating or refreshing project documentation                |
| [`lyra-council`](../lyra-council)                       | Five-advisor deliberation engine. Spawns five subagents in parallel, peer-reviews, chairman synthesizes. Sessions saved to `.lyra/council/`. | Decisions where being wrong is expensive                      |

Each skill follows the same standard format (`SKILL.md` + `AGENTS.md` + `plugin.json` + `README.md` + optional `references/`).

---

## Composition patterns

### Pattern 1: Lyra plans, specialized skill executes

```
User: "Add a new payment endpoint to my NestJS API, fully tested"
1. Lyra produces the execution plan (files, test strategy, coverage target)
2. Lyra invokes nodejs-backend-patterns for the Express/Nest patterns
3. Lyra invokes lyra-tdd for the Red-Green-Refactor cycle
4. Lyra invokes lyra-code-review before declaring done
```

### Pattern 2: Lyra orchestrates a refactor

```
User: "Refactor this monolith into clean architecture"
1. Lyra invokes analyze-codebase to understand the current state
2. Lyra invokes lyra-clean-architecture for the target architecture
3. Lyra produces the migration plan (phased, tests-first per phase)
4. Per phase: lyra-tdd writes the tests for the new structure, then moves code, then verifies
```

### Pattern 3: Lyra debugs with TDD safety net

```
User: "This function returns wrong results intermittently"
1. Lyra invokes debug for the systematic method
2. Lyra writes a regression test that reproduces the bug (Red)
3. Lyra fixes the code (Green)
4. Lyra runs lyra-code-review to confirm the fix doesn't break neighbors
```

---

## When to use which

| Task                             | Skills to invoke (in order)                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| New feature in existing codebase | `analyze-codebase` → Lyra plan → `lyra-tdd` → `lyra-code-review`                            |
| Greenfield project               | Lyra plan → `lyra-clean-architecture` → `lyra-tdd` → `lyra-clean-code` → `lyra-code-review` |
| Refactor for readability         | `analyze-codebase` → `lyra-clean-code` → `lyra-tdd` (safety net)                            |
| Bug fix                          | `debug` → `lyra-tdd` (regression test first) → `lyra-code-review`                           |
| Architecture decision            | `lyra-clean-architecture` → `architecture-patterns` → Lyra plan                             |
| API design                       | `api-design-expert` → Lyra plan → `lyra-tdd` → `lyra-code-review`                           |
| Performance work                 | `analyze-codebase` → `performance-expert` → Lyra plan → `lyra-tdd` (benchmarks as tests)    |
| E2E test suite                   | `e2e-testing` → Lyra plan → write tests                                                     |

**Rule of thumb:** if a task spans more than one file, start with a Lyra plan. If a task touches code, end with `lyra-code-review`. If a task writes code, middle is `lyra-tdd`.