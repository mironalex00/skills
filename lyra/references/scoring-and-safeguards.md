# Scoring, Safeguards & Post-Delivery Protocol

Detailed reference for scoring optimized prompts, handling edge cases, and running the post-delivery protocol. Read this when you need to justify a score, when you hit a safeguard trigger, or when running full DETAIL mode.

## Table of contents
1. [Quality scoring rubric — detailed](#quality-scoring-rubric--detailed)
2. [Success indicators](#success-indicators)
3. [Safeguards](#safeguards)
4. [Post-delivery protocol](#post-delivery-protocol)
5. [Worked scoring example](#worked-scoring-example)

---

## Quality scoring rubric — detailed

Every optimized prompt is scored 0–10 across five dimensions, 0–2 each.

### Clarity (0–2)
- **0** — Ambiguous; reasonable readers would interpret it differently. Multiple valid end-states.
- **1** — Mostly clear; one fuzzy spot remains (e.g., "make it engaging" without defining engaging).
- **2** — Unambiguous. A 5th-grader could follow the instruction and know when they're done.

### Context (0–2)
- **0** — No background. The model has to guess audience, situation, constraints.
- **1** — Some background given (audience or situation, but not both).
- **2** — Rich, layered context: who's asking, who's the audience, what's the situation, what came before, what constraints already exist.

### Constraints (0–2)
- **0** — No constraints. "Write me an article about X."
- **1** — Implicit or partial constraints (length but no tone, or tone but no format).
- **2** — Explicit, bounded constraints including negatives ("do NOT include…", "avoid jargon", "max 500 words", "neutral tone, not promotional").

### Structure (0–2)
- **0** — Wall of text, no organization.
- **1** — Has some sections or a loose shape.
- **2** — Clean template with defined output format (markdown headings, JSON schema, table columns, etc.).

### Specificity (0–2)
- **0** — Vague. No 5W2H answered.
- **1** — Some 5W2H answered (what + how, but not why/when/where/who/how-much).
- **2** — Full 5W2H + measurable success criteria + at least one edge case addressed.

**Targets:** DETAIL mode ≥ 8/10, BASIC mode ≥ 6/10. If you score below target, iterate before delivering — don't ship a below-target prompt.

---

## Success indicators

These are the outcomes a well-optimized Lyra prompt should produce. Use them as a gut-check, not a literal measurement:

- **Reduce user back-and-forth by 80%** — the optimized prompt should make the first model response usable, without the user needing to clarify or correct.
- **Increase output relevance by 90%+** — the response should land within the user's actual intent on the first try.
- **Generate consistent, reusable results across text and visual media** — re-running the prompt (or handing it to a teammate) should produce a comparable-quality output.

If a prompt you've optimized is unlikely to hit these, say so and iterate.

---

## Safeguards

These are non-negotiable. Apply them in order.

### 1. NEVER modify core intent
If the user wants X, you deliver an optimized prompt for X — not for "a better version of X" that you personally prefer. You can tighten, structure, and platform-tune, but the goal stays the user's goal.

### 2. ALWAYS preserve domain terminology
Industry jargon, acronyms, product names, technical terms — keep them verbatim. Do not "simplify" a domain term the user intentionally used. If you're unsure whether a term is intentional jargon or a typo, ask.

### 3. If the request is harmful
Do not optimize prompts whose purpose is to cause harm: generating malware, facilitating unauthorized access, producing non-consensual sexual content, enabling harassment, generating misinformation for deception, etc.

**Instead:** suggest an ethical alternative that captures the legitimate underlying need (if any). Example: a prompt asking for "a phishing email to steal credentials" → suggest "a security-awareness training email that teaches employees to recognize phishing attempts." Be direct about the refusal, brief about the reason, and constructive with the alternative.

### 4. If the request is too vague
Per SKILL.md: return **three distinct interpretations** as one-line framings and ask the user to pick a lane. Do not guess and ship.

### 5. If the optimized prompt exceeds ~500 words
Offer a condensed version. Long prompts aren't always better — they can dilute focus and hit context-efficiency issues. Provide the full version plus a "condensed" variant that cuts to essentials.

### 6. If the request is outside the model's capabilities
Explain the limitation clearly and specifically. Don't hand the user an optimized prompt that will fail. Examples: real-time data (no model has live market data natively), guaranteed factual accuracy on recent events, deterministic behavior on probabilistic models, etc. Suggest a workaround (RAG, tool use, a different model) where one exists.

---

## Post-delivery protocol

Run this in DETAIL mode after delivering the optimized prompt.

### Step 1 — Ask the three standard questions
Present these verbatim (or close to it):

1. "Adjust for tone / length / complexity / specificity?"
2. "Rate 1–10: how well does this capture your intent?"
3. "Additional domain terms needed?"

### Step 2 — Branch on the rating
- **9–10**: Ship. Offer a platform-tuned variant if they didn't specify one originally.
- **7–8**: Ask if they want a specific tweak (reference their answer to Q1). Apply it. Re-deliver.
- **Below 7**: Ask **one** targeted follow-up question — the single most important gap you can identify. Do not interrogate. Re-optimize based on the answer. Re-deliver with an updated score.

### Step 3 — Close the loop
After any final adjustment, give a one-line summary of what changed and the final score. Do not save anything to memory.

---

## Worked scoring example

**Raw user input:** "write a linkedin post about our new feature"

**Optimized prompt (BASIC mode):**
```
You are a B2B SaaS product marketer. Write a LinkedIn post (max 200 words)
announcing a new feature: [FEATURE_NAME + one-line description]. Audience:
product managers and engineering leads at mid-market tech companies. Tone:
confident, concrete, no hype words ("game-changing", "revolutionary").
Structure: 1 hook line (under 12 words) → 2-3 sentences on the problem
it solves → 1 sentence on how it works → 1 CTA. End with a single
relevant hashtag. Do not mention competitors.
```

**Score:**
- Clarity: 2 (unambiguous, success state is a 200-word post in a defined shape)
- Context: 1 (audience + tone given, but no background on the feature — left as placeholder)
- Constraints: 2 (length, tone negatives, structure, hashtag rule, competitor exclusion)
- Structure: 2 (explicit 4-part structure + CTA)
- Specificity: 1 (what + how + who, but no why/edge cases; feature detail is a placeholder)
- **Total: 8/10** — meets DETAIL-mode target despite being BASIC mode. Good.

**Why it scores 8 not 10:** the `[FEATURE_NAME]` placeholder means the user still has to fill in specifics; if they'd given the feature details up front, specificity would hit 2 and total would be 9–10.
