# Research & Deliverables — Extended Capabilities

The Lyra skill goes beyond just returning text in a chat. When the task warrants it, the agent using this skill can reach for four extended capabilities: **web research**, **PDF deliverables**, **structured Markdown files**, and **skill/reference discovery**. This file holds the detailed workflows.

Load this reference when the user asks for any of: research-backed prompts, a PDF/Markdown deliverable, "find a skill that…", prompt-library files, or when current platform specs are needed.

## Table of contents

1. [When to reach for extended capabilities](#when-to-reach-for-extended-capabilities)
2. [Web research workflow](#web-research-workflow)
3. [Skill & reference discovery](#skill--reference-discovery)
4. [Markdown deliverables (prompt library)](#markdown-deliverables-prompt-library)
5. [PDF deliverables](#pdf-deliverables)
6. [Prompt chaining & variant packs](#prompt-chaining--variant-packs)
7. [Anti-patterns](#anti-patterns)

---

## When to reach for extended capabilities

Default behavior is still: optimize the prompt, return it in a code block, ask the post-delivery questions. Do NOT auto-invoke extended capabilities on every run — that bloats simple requests.

Reach for them when any of these are true:

| Signal                                                                               | Capability to use              |
| ------------------------------------------------------------------------------------ | ------------------------------ |
| User references a platform whose specs change often (Veo, GPT-5, new model releases) | Web research                   |
| User asks for "the latest", "current", "as of 2026", or specific version numbers     | Web research                   |
| User mentions a domain you're unsure about (niche legal/medical/financial)           | Web research + skill discovery |
| User asks for "a prompt library", "save these prompts", "prompt template file"       | Markdown deliverables          |
| User asks for a "shareable", "printable", "handout", "team doc" version              | PDF deliverable                |
| User asks "is there already a skill for…?" or the task smells like an existing skill | Skill discovery                |
| User wants prompts for a multi-step pipeline (research → draft → review)             | Prompt chaining                |

When in doubt, **offer** the capability ("I can also save these as a Markdown prompt library / generate a PDF handout / search the project for related skills — want that?") rather than forcing it.

---

## Web research workflow

### Why search

Platform specs drift. Veo's max clip length, GPT-5's context window, Claude's tool-use syntax, Qwen's latest image-model name — these change every few months. The platform-architectures reference file holds canonical templates, but if a user is targeting a specific recent feature, verify it.

### How to search

Use the project's **Web-Search** capability (invoke via `Skill(command="web-search")` if available, or use whatever web-search tool the host environment provides). Search in this order of reliability:

1. **Official docs** — `site:openai.com`, `site:anthropic.com`, `site:ai.google.dev`, `site:platform.minimaxi.com`, etc.
2. **Model cards / release announcements** — for capability boundaries, context limits, supported modalities.
3. **Recent developer blog posts** — for practical patterns and gotchas.

### What to look up

- **Context window / max tokens** — affects how long the prompt + input can be.
- **Supported input modalities** — text, image, audio, video, file uploads.
- **Tool use / function calling** — syntax and limitations.
- **Output format support** — JSON mode, structured outputs, tool-calling schemas.
- **Rate limits / latency characteristics** — relevant for prompts meant to run at scale.
- **Known failure modes** — hallucination patterns, instruction-following weaknesses.

### How to integrate findings

When search changes the optimized prompt, note it explicitly:

> "Based on [source], [model] currently supports [X]. I've tuned the prompt to use [specific feature]."

Cite the source URL in the "Why this works" note. Do not silently bake in facts you looked up — make the reasoning transparent so the user can verify.

### Guardrails

- **Do not search** for things you already know with high confidence from the platform-architectures reference. That wastes a round-trip.
- **Do not over-cite** — one or two authoritative sources is enough. A prompt optimized around five caveats from blog posts becomes unreadable.
- If search fails or returns nothing useful, fall back to the canonical template and flag the uncertainty to the user.

---

## Skill & reference discovery

### How to discover

The project ships with hundreds of skills (`./.claude/skills/ (or .agents/skills/, .cursor/skills/)`). Before writing a prompt from scratch, check whether an existing skill already solves — or substantially helps with — the user's task. Recommending an existing skill is often more valuable than handing back a prompt.

### Discovery methods

Use whichever is available in the host environment:

1. **`Skill(command="find-skills")`** — the host's native skill-discovery mechanism. Covers installable skills and may surface skills not yet in the project. Preferred when available.
2. **Browse `/skills/` directly** — list the directory (`ls ./.claude/skills/ (or .agents/skills/, .cursor/skills/)`) and read the `description` field from each `SKILL.md`'s frontmatter (or the `plugin.json` if present). Best when you already know the rough category you're looking for.
3. **Web research** — for skills/knowledge _outside_ the project (platform docs, external libraries).

### How to use the results

1. Summarize the user's task in 2–6 words (e.g., `"video generation cinematic"`, `"legal contract analysis"`, `"pdf report"`).
2. Find candidate skills using one of the methods above.
3. For any strong candidate, read its `SKILL.md` to assess fit.
4. If a skill is a strong fit, **recommend it** to the user before (or alongside) delivering the optimized prompt:
   > "Heads up — the project already has a `[skill-name]` skill that does [X]. You could invoke it directly via `Skill(command='[skill-name]')` instead of running this prompt manually. Want me to (a) just point you to that skill, (b) write a prompt that wraps it, or (c) both?"
5. If the user wants the wrapper approach, optimize a prompt that _invokes_ the skill — that's often the highest-leverage move.

---

## Markdown deliverables (prompt library)

### When to save as Markdown

- The user asks for a "prompt library", "prompt template", "prompt file".
- The user will reuse the prompt across sessions or share it with teammates.
- You've produced multiple prompt variants and the user wants them organized.

### File structure

Save under a `prompts/` directory at the project root (create it if absent):

```
prompts/
├── README.md                          # index of all prompts
├── text/
│   ├── claude-legal-contract-review.md
│   └── chatgpt-quickstart-docs.md
├── image/
│   └── qwen-celadon-teacup.md
├── video/
│   ├── veo-rainy-street-walk.md
│   └── minimax-chef-kitchen.md
└── chains/
    └── research-draft-review.md       # multi-step prompt chains
```

### Per-file frontmatter

Every prompt file starts with YAML frontmatter so it's discoverable and self-documenting:

```markdown
---
title: "Claude: Legal Contract Risk Review"
platform: claude
request_type: complex
mode: detail
quality_score: 9
tags: [legal, contract, risk-analysis, claude]
created: 2026-01-15
author: Lyra
---

# Claude: Legal Contract Risk Review

## Prompt

\`\`\`
Given [contract text], analyze the proposed terms using a risk-matrix
framework, provide a prioritized deliverable (table: clause | risk level |
financial exposure | recommended redline) considering [constraints].
\`\`\`

## Why this works

- [bullet]
- [bullet]

## Variables to fill

- `[contract text]` — paste the full contract
- `[constraints]` — your risk tolerance, jurisdiction, team size, etc.

## Quality score

9/10 — Clarity 2, Context 2, Constraints 2, Structure 2, Specificity 1
```

### The README index

`prompts/README.md` lists every prompt with a one-line description and a link, grouped by category. Keep it alphabetical within categories. This is what makes the library navigable.

### Naming convention

`{platform}-{short-slug}.md` — lowercase, hyphenated, no spaces. Examples: `claude-legal-contract-review.md`, `veo-rainy-street-walk.md`. The slug should be evocative enough that you can recognize the prompt from the filename alone.

---

## PDF deliverables

### When to generate a PDF

- The user asks for a "shareable", "printable", "handout", "one-pager", "team doc" version of the optimized prompt.
- The prompt is part of an onboarding/training pack.
- The user wants to attach the prompt to a formal document (RFP, compliance packet, etc.).

### How to generate

Use the project's **`pdf`** skill — invoke via `Skill(command="pdf")`. It auto-routes between Report (structured docs via ReportLab), Creative (visual design), Academic (LaTeX), and Process (manipulate existing PDFs).

For prompt deliverables, the **Report** line is almost always the right choice. Hand the pdf skill a structured brief:

```markdown
Title: Optimized Prompt — [short name]
Sections:

1. Summary (1 paragraph: what this prompt does, target platform, expected output)
2. The Optimized Prompt (the full prompt text in a monospace block)
3. Why This Works (bulleted explanation of the key moves)
4. How To Use (step-by-step: where to paste it, what to fill in, what to expect)
5. Quality Score (the 5-dimension breakdown + total)
6. Variants (optional: platform-tuned alternates)
   Format: Clean, professional, A4 or Letter, sans-serif body, monospace for the prompt block.
```

### What NOT to put in a PDF

- Raw URLs to internal/temporary resources — they rot.
- Long chat transcripts — the PDF is a deliverable, not a log.
- Multiple prompts in one PDF unless they're explicitly a "prompt pack" — one prompt per PDF keeps things shareable.

---

## Prompt chaining & variant packs

### When to chain

The user's task naturally decomposes into stages: research → draft → review → finalize. A single prompt rarely handles all stages well. Chain them.

### Chain structure

Define each chain as a single Markdown file under `prompts/chains/`:

```markdown
---
title: "Research → Draft → Review Chain"
platform: claude
stages: 3
tags: [chain, research, writing]
---

# Research → Draft → Review Chain

## Stage 1: Research

[Prompt 1 — gathers and synthesizes sources]

**Input:** [user's question]
**Output:** structured research notes

## Stage 2: Draft

[Prompt 2 — turns research notes into a first draft]

**Input:** output of Stage 1
**Output:** draft document

## Stage 3: Review

[Prompt 3 — critiques the draft against a rubric, returns a revised version]

**Input:** output of Stage 2
**Output:** final document + change log
```

### Variant packs

When a user wants the same prompt tuned for multiple platforms, save them as a variant pack:

```
prompts/text/legal-contract-review/
├── claude.md
├── chatgpt.md
├── gemini.md
└── README.md   # compares the variants, explains when to use each
```

The `README.md` in a variant pack should include a small comparison table: which platform's variant scores highest on which dimension, and a recommendation.

---

## Anti-patterns

Avoid these failure modes when using extended capabilities:

1. **Auto-invoking on every request.** Don't run skill discovery and web search on a one-line "fix this prompt" request. The overhead destroys the speed win Lyra is supposed to provide.
2. **Saving files without asking.** Don't write to `prompts/` or generate a PDF unless the user wants a deliverable. Writing files unprompted clutters their project.
3. **Citing low-quality sources.** A random Medium blog post is not authoritative. Prefer official docs, model cards, and the platform-architectures reference bundled with this skill.
4. **Burying the prompt under process.** The optimized prompt is always the deliverable. Extended capabilities _support_ it — they don't replace it. If the user asks "optimize this prompt", lead with the prompt; offer research/files/PDF as additions.
5. **Forgetting the no-memory rule.** Even when generating files, do not persist user session details, proprietary prompts, or scores to any memory system. Files written to `prompts/` are explicit user-requested artifacts, not memory — that's fine. But don't _also_ stash copies in a memory layer.