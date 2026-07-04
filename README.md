# The Skill Collection

**AI skills, each one a specialist. This is one of them.**

## What's a "skill"?

A skill is a packaged capability for an AI agent — a `SKILL.md` file with instructions, plus optional references and a `plugin.json` metadata file. When the agent invokes a skill via `Skill(command="name")`, it loads specialized instructions for that specific task. Think of it as a plugin that teaches the AI how to do one thing well.

---

## Why this collection exists

Raw prompts are brittle. You write a great prompt for one task, forget it, and reinvent it next time. **Skills fix this**: they capture expertise in a reusable, composable format. The collection exists so that instead of prompting from scratch every time, you invoke a specialist that already knows the domain — prompt optimization, legal review, codebase analysis, video generation, PDF creation, and 219 others.

The thesis: composable, portable, expertise-encoded units beat brittle one-shot prompting. Each skill makes the others more valuable.

---

## How to use a skill

1. **Find the right skill** — browse `/skills/` or invoke `Skill(command="find-skills")` to discover what's available
2. **Invoke it** — `Skill(command="skill-name")` loads the skill's instructions into the AI's context
3. **State your task** — the AI now follows the skill's methodology for that task

---

## What skills are FOR

- **Repeatable workflows** — anything you do more than once (commit messages, code reviews, contract analysis, release notes)
- **Specialized domains** — legal, medical, financial, technical writing, where methodology matters
- **Multi-step pipelines** — research → draft → review → finalize, where each stage has its own skill
- **Platform-specific tasks** — generating prompts for Veo/Minimax, creating PDFs, building dashboards
- **Quality-critical output** — anything where "good enough" isn't good enough

## What skills are NOT for

- **One-off trivial tasks** — if it takes longer to find the skill than to do the task, just do the task
- **Creative exploration** — skills encode methodology; pure brainstorming wants no methodology
- **Replacing human judgment** — a skill structures the work; it doesn't decide what's true or right
- **Tasks outside the AI's capability** — no skill makes a model do real-time data, guaranteed accuracy, or deterministic behavior on a probabilistic system
- **Unvalidated automation at scale** — test a skill on one task before chaining it across 1,000

---

## Composability: the real unlock

Skills compose. This is the flywheel: each skill makes the others more valuable. The collection isn't isolated tools — it's a toolkit where the parts fit together.

**Example chain:**

1. **your_skill** (`Skill(command="your_skill")`) do a task
2. The skill makes an intermediate result and needs to invoke the **pdf** skill to package the analysis as a shareable deliverable
3. The PDF feeds a **commit-summary** skill that logs the review in the repo

One prompt, three skills, one finished artifact. That's the promise.

---

## Browsing the collection

| Method                               | When to use                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| `(.agents\|.claude\|etc...)/skills/` | You know the rough category and want to scan names                   |
| `Skill(command="find-skills")`       | You want the host's native discovery (covers installable skills too) |
| Read any skill's `SKILL.md`          | You've found a candidate and want to assess fit                      |

---

## Skill anatomy (standard format)

Every skill in this collection follows the same structure:

```
skill-name/
├── SKILL.md          ← instructions the AI loads (YAML frontmatter + markdown body)
├── plugin.json       ← metadata: name, version, description, author, license
├── README.md         ← user-facing summary (optional but recommended)
└── references/       ← deep content loaded on demand (optional)
    └── *.md
```

This consistency is what makes skills composable: any skill can reference any other skill by name, and the invocation contract (`Skill(command="...")`) is uniform across the collection.

---

## The collection grows

This is a beginning, not a ceiling. New skills get added as new domains, platforms, and workflows are encoded. The bar for inclusion: a skill must do one thing well, follow the standard format, and compose cleanly with the rest of the collection.

---

## The complete catalog

**Here are all the skills**, organized by category. Each entry links to its `SKILL.md` — relative paths so links work in the web viewer, on GitHub, and inside the extracted ZIP.

| Category                            | Count |
| ----------------------------------- | ----- |
| [Skills & Tooling](#skills-tooling) | 1     |
| **Total**                           | **1** |

### Skills & Tooling

_1 skills_

- **[lyra](./lyra/SKILL.md)** — Elite AI specialist that transforms raw user inputs into precision-crafted prompts for any major AI platform — text.