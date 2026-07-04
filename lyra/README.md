# Lyra · Prompt Optimization

Turns vague requests into precision prompts for any AI model.

## Before / After

**You type:**

> write a blog post about our new product

**Lyra returns:**

> You are a B2B SaaS product marketer. Write a LinkedIn post (max 200 words) announcing `[FEATURE]`. Audience: product managers at mid-market tech companies. Tone: confident, no hype words ("game-changing", "revolutionary"). Structure: hook (≤12 words) → problem → solution → CTA. Do not mention competitors.

Same intent. The second one actually works.

---

## What Lyra does

- Takes your rough prompt and returns a tightened, platform-specific version
- Tunes the structure to the target model (ChatGPT/GPT-5, Claude, Gemini, Kimi, DeepSeek, Qwen, Veo, Minimax/Hailuo)
- Scores the result 0–10 so you know if it's ready to use
- Can save prompts as Markdown files, generate PDF handouts, or search the web for current model specs

## How to use it

1. **Paste your prompt** — one line or a paragraph, whatever you have
2. **Name the target** — "for Claude", "for Veo", or let Lyra pick
3. **Get the optimized prompt + a score + a short "why this works" note**

If your prompt is too vague, Lyra returns **three interpretations** and asks you to pick a lane before optimizing. It never guesses.

---

## Under the hood

For developers who want the mechanics. Skip this if you just want to use Lyra.

| Mechanism | What it does |
|---|---|
| **4-D methodology** | Deconstruct → Diagnose → Develop → Deliver. Extracts intent, audits gaps, matches technique to request type, constructs the optimized prompt. |
| **Complexity routing** | BASIC mode for simple one-shot requests (quick fix, no full rubric). DETAIL mode for complex/platform-targeted/ambiguous requests (full pass + scoring + follow-up). Auto-detected; you can force either. |
| **Quality rubric (0–10)** | Five dimensions scored 0–2 each: Clarity, Context, Constraints, Structure, Specificity. Target: 8+ for DETAIL, 6+ for BASIC. Below target → iterate before delivering. |
| **Platform architectures** | Canonical template per model. Example — Claude: "Given [context], analyze [subject] using [framework], provide [deliverable] considering [constraints]." Full templates in `references/platform-architectures.md`. |

## Extended capabilities

Reach for these only when the task warrants it — not on every run.

- **Web research** — verifies current model specs (context windows, modalities, tool-use syntax) when platform details may have drifted
- **Skill discovery** — searches the project's existing skills before writing a prompt from scratch; often an existing skill already solves the task
- **Markdown deliverables** — saves optimized prompts as reusable `.md` files with YAML frontmatter in a `prompts/` library
- **PDF deliverables** — generates shareable handouts for onboarding/training packs via the `pdf` skill

See `references/research-and-deliverables.md` for the exact workflows.

---

## What Lyra is NOT for

- **Writing the final output itself** — Lyra optimizes the *prompt*, not the article/code/video. You still run the optimized prompt in your target model.
- **Guaranteeing factual accuracy** — a well-structured prompt doesn't make the model hallucinate less about facts. Use RAG or citations for that.
- **Replacing domain expertise** — Lyra tightens structure and specificity; it doesn't know your legal/medical/financial domain better than you do.
- **One-off trivial asks** — if you just want "summarize this paragraph", you don't need Lyra. It's built for prompts where quality matters.

---

## Files

```
lyra/
├── SKILL.md                              ← the skill instructions (loaded by the AI)
├── plugin.json                           ← metadata (name, version, author, license)
├── README.md                             ← this file
├── COLLECTION.md                         ← the skill collection this belongs to
└── references/
    ├── platform-architectures.md         ← per-model prompt templates + worked examples
    ├── research-and-deliverables.md      ← web research, PDF, Markdown workflows
    └── scoring-and-safeguards.md         ← full rubric, safeguards, post-delivery protocol
```

---

## Privacy

Lyra does not save any information from optimization sessions to memory. Each session is stateless. See `SKILL.md` for the full privacy protocol.

*Part of the skill collection. See [`README.md`](../README.md) for the broader context.*
