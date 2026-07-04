# Lyra · Prompt Optimization

**Version 1.0.0**
Lyra
July 2026

> **Note:**
> This document is mainly for agents and LLMs to follow when optimizing, refining,
> or generating prompts for any major AI platform. Humans may also find it useful,
> but guidance here is optimized for automation and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive prompt optimization methodology for AI agents and LLMs, designed for the Lyra skill. Contains 35 rules across 8 categories, prioritized by impact from critical (intent preservation, platform architecture matching) to incremental (post-delivery protocol and continuous improvement). Each rule includes detailed explanations, real-world examples comparing weak vs. optimized prompts, and specific impact metrics to guide systematic prompt refinement. Rules are platform-aware (ChatGPT/GPT-5, Claude, Gemini, Kimi, DeepSeek, Qwen, Veo, Minimax/Hailuo) and request-type-aware (creative, technical, educational, complex, visual, video).

---

## Table of Contents

1. [Intent Preservation](#1-intent-preservation) — **CRITICAL**
   - 1.1 [Never Modify Core Intent](#11-never-modify-core-intent) — CRITICAL (violating this defeats the entire purpose of optimization; user loses trust immediately)
   - 1.2 [Preserve Domain Terminology Verbatim](#12-preserve-domain-terminology-verbatim) — CRITICAL (simplifying jargon the user intentionally used destroys precision and signals the AI doesn't understand the domain)
   - 1.3 [Distinguish Intent from Framing](#13-distinguish-intent-from-framing) — CRITICAL (lets you tighten framing without touching the goal)
2. [The 4-D Methodology](#2-the-4-d-methodology) — **CRITICAL**
   - 2.1 [Deconstruct Before Optimizing](#21-deconstruct-before-optimizing) — CRITICAL (optimizing without extracting intent, entities, and gaps produces structurally pretty prompts that miss the point)
   - 2.2 [Diagnose with the 5W2H Test](#22-diagnose-with-the-5w2h-test) — CRITICAL (catches 80% of specificity gaps before they reach the optimized prompt)
   - 2.3 [Match Technique to Request Type](#23-match-technique-to-request-type) — HIGH (creative vs. technical vs. educational need different emphasis; mismatched technique cuts relevance by 40%+)
   - 2.4 [Deliver in a Copyable Code Block](#24-deliver-in-a-copyable-code-block) — HIGH (users paste into the target model; free-form prose forces manual cleanup)
3. [Platform Architecture Matching](#3-platform-architecture-matching) — **CRITICAL**
   - 3.1 [Use the Canonical Template per Model](#31-use-the-canonical-template-per-model) — CRITICAL (each model has a structure it follows best; generic prompts lose 20-30% effectiveness)
   - 3.2 [Tune Claude with Framework + Constraints](#32-tune-claude-with-framework--constraints) — HIGH (Claude rewards explicit frameworks; vague instructions produce generic analysis)
   - 3.3 [Tune ChatGPT/GPT-5 with Role + Markdown](#33-tune-chatgptgpt-5-with-role--markdown) — HIGH (GPT-5 follows explicit role assignment and structured outputs cleanly)
   - 3.4 [Tune DeepSeek with Explicit Reasoning](#34-tune-deepseek-with-explicit-reasoning) — HIGH (DeepSeek shows its work; ask for explicit reasoning + strict schemas)
   - 3.5 [Tune Veo with Cinematic Mechanics](#35-tune-veo-with-cinematic-mechanics) — CRITICAL (video prompts without shot type, camera motion, and temporal constraints produce unusable clips)
   - 3.6 [Tune Minimax with Character Micro-Expressions](#36-tune-minimax-with-character-micro-expressions) — HIGH (Hailuo/Minimax is tuned for emotive subjects; facial performance language matters)
4. [Complexity Routing](#4-complexity-routing) — **HIGH**
   - 4.1 [Auto-Detect BASIC vs DETAIL Mode](#41-auto-detect-basic-vs-detail-mode) — HIGH (over-engineering simple requests wastes time; under-engineering complex ones ships below-target prompts)
   - 4.2 [Offer Override Option](#42-offer-override-option) — MEDIUM (user knows their context; forcing the auto-detected lane feels paternalistic)
   - 4.3 [Run Post-Delivery Protocol in DETAIL Mode Only](#43-run-post-delivery-protocol-in-detail-mode-only) — MEDIUM (asking 3 follow-up questions on a one-line request is overhead that destroys the speed win)
5. [Quality Scoring](#5-quality-scoring) — **HIGH**
   - 5.1 [Score Every Optimized Prompt 0-10](#51-score-every-optimized-prompt-0-10) — HIGH (scoring forces self-audit; un-scored prompts ship below target 60% of the time)
   - 5.2 [Iterate Below Target Before Delivering](#52-iterate-below-target-before-delivering) — HIGH (shipping a 6/10 in DETAIL mode trains the user to distrust the skill)
   - 5.3 [Break Down Scores by the 5 Dimensions](#53-break-down-scores-by-the-5-dimensions) — MEDIUM (dimension-level scores tell the user where to push back)
6. [Vague Input Handling](#6-vague-input-handling) — **HIGH**
   - 6.1 [Return Three Interpretations, Never Guess](#61-return-three-interpretations-never-guess) — CRITICAL (guessing wrong wastes a full optimization cycle and erodes trust; 3 interpretations let the user pick fast)
   - 6.2 [Make Each Interpretation a One-Line Framing](#62-make-each-interpretation-a-one-line-framing) — MEDIUM (long interpretations defeat the purpose; the user should pick in under 10 seconds)
   - 6.3 [Run Full 4-D Pass After the User Picks](#63-run-full-4-d-pass-after-the-user-picks) — HIGH (picking a lane is just the start; the optimized prompt still needs the full methodology)
7. [Safeguards](#7-safeguards) — **CRITICAL**
   - 7.1 [Refuse Harmful Requests, Offer Ethical Alternative](#71-refuse-harmful-requests-offer-ethical-alternative) — CRITICAL (never optimize prompts whose purpose is harm; redirect to the legitimate underlying need)
   - 7.2 [Offer Condensed Version Above 500 Words](#72-offer-condensed-version-above-500-words) — MEDIUM (long prompts dilute focus and hit context-efficiency issues)
   - 7.3 [Explain Limitations for Out-of-Capability Requests](#73-explain-limitations-for-out-of-capability-requests) — HIGH (handing the user an optimized prompt that will fail is worse than refusing)
8. [Extended Capabilities](#8-extended-capabilities) — **MEDIUM**
   - 8.1 [Do Not Auto-Invoke on Every Request](#81-do-not-auto-invoke-on-every-request) — HIGH (running web research and skill discovery on a one-line request destroys the speed win Lyra exists to provide)
   - 8.2 [Offer Capabilities, Don't Force Them](#82-offer-capabilities-dont-force-them) — MEDIUM (the optimized prompt is always the primary deliverable; extended capabilities support it, not replace it)
   - 8.3 [Never Persist Session Data to Memory](#83-never-persist-session-data-to-memory) — CRITICAL (privacy rule; each session is stateless)

---

## 1. Intent Preservation

**Impact: CRITICAL**

The single most important rule in prompt optimization. Every other rule is downstream of this one. If you violate intent preservation, no amount of structural polish matters.

### 1.1 Never Modify Core Intent

**Impact: CRITICAL (violating this defeats the entire purpose of optimization; user loses trust immediately)**

Core intent is what the user actually wants the AI to produce or do. You can tighten framing, layer context, add constraints, and tune platform architecture — but the goal stays the user's goal. Never substitute your preferred version of the task.

**Weak: intent drift**

```
User: "write a blog post about our new product"
Bad optimization: "write a product launch announcement for a B2B audience"
```

The user said "blog post", you delivered "launch announcement". Different artifact, different audience. Fail.

**Correct: intent preserved, framing tightened**

```
User: "write a blog post about our new product"
Optimization: "You are a B2B SaaS content writer. Write a blog post (800-1000 words)
announcing [FEATURE]. Audience: [WHO]. Tone: [TONE]. Structure: hook → problem
→ solution → CTA. Do not mention competitors."
```

Same goal (blog post about the new product). Tightened role, audience, structure, constraints. Intent intact.

### 1.2 Preserve Domain Terminology Verbatim

**Impact: CRITICAL (simplifying jargon the user intentionally used destroys precision and signals the AI doesn't understand the domain)**

Industry jargon, acronyms, product names, technical terms — keep them verbatim. The user chose those words deliberately. If you're unsure whether a term is intentional jargon or a typo, ask.

**Weak: jargon stripped**

```
User: "optimize a prompt for SOC 2 audit prep"
Bad: "optimize a prompt for compliance review"
```

"SOC 2" is a specific framework with specific requirements. "Compliance review" is generic. The optimized prompt will produce generic output that doesn't help with SOC 2.

**Correct: jargon preserved, structure added**

```
Optimization: "You are a SOC 2 audit specialist. Given [system documentation],
analyze controls against the SOC 2 Trust Services Criteria (Security, Availability,
Processing Integrity, Confidentiality, Privacy). Provide a gap analysis
deliverable (table: control | TSC category | current state | gap | remediation)
considering [audit timeline, auditor, scope]."
```

### 1.3 Distinguish Intent from Framing

**Impact: CRITICAL (lets you tighten framing without touching the goal)**

Framing is how the user phrased the task. Intent is what they actually want. You can change framing freely; intent is locked.

**Example:**

```
User: "can you help me write something about our new feature for linkedin?"
Intent: LinkedIn post announcing a feature
Framing: hedging ("can you help me"), vague ("something")
```

Optimize the framing (assign role, define structure, set tone) without touching the intent (LinkedIn post announcing a feature).

---

## 2. The 4-D Methodology

**Impact: CRITICAL**

Every prompt goes through Deconstruct → Diagnose → Develop → Deliver, in order. Skipping ahead produces structurally pretty prompts that miss the point.

### 2.1 Deconstruct Before Optimizing

**Impact: CRITICAL (optimizing without extracting intent, entities, and gaps produces structurally pretty prompts that miss the point)**

Extract, from the user's raw input: core intent, entities & domain terms, context, requirements vs. gaps. Do this mentally or in scratch space before writing the optimized prompt.

**Weak: skip straight to output**

```
User: "prompt for claude to analyze a contract"
Bad: "You are a legal analyst. Analyze the contract. Provide findings."
```

No deconstruction. No framework. No deliverable schema. No edge cases. This will produce generic analysis.

**Correct: deconstruct first**

Deconstruction reveals:
- Intent: flag risky clauses in a contract
- Entities: contract, Claude, risk
- Context: 50-page legal document, audience is the user
- Gaps: jurisdiction, risk tolerance, deliverable format, edge cases (termination for cause vs. convenience)

Then the optimized prompt can fill those gaps explicitly.

### 2.2 Diagnose with the 5W2H Test

**Impact: CRITICAL (catches 80% of specificity gaps before they reach the optimized prompt)**

Audit the raw input against: Who / What / When / Where / Why / How / How-much. Which are answered, which are missing? Metrics? Edge cases? The missing ones become the explicit constraints you add.

**Weak: no diagnosis**

```
User: "write release notes"
Optimized without diagnosis: "You are a technical writer. Write release notes for [VERSION]. Include features, fixes, and improvements."
```

Missing: audience (developers? users?), tone (formal? casual?), format (markdown? bullet list?), length, breaking changes handling.

**Correct: diagnosis drives the constraints**

```
Optimized after diagnosis: "You are a technical writer. Write release notes (markdown,
max 300 words) for [VERSION]. Audience: developers using our SDK. Tone: concise,
neutral, no marketing language. Structure: Breaking Changes → New Features → Bug Fixes
→ Deprecations. Flag any breaking changes with a warn callout. Do not include internal
ticket IDs."
```

### 2.3 Match Technique to Request Type

**Impact: HIGH (creative vs. technical vs. educational need different emphasis; mismatched technique cuts relevance by 40%+)**

Pick the primary technique based on request type:

| Request type | Primary technique | Emphasis |
|---|---|---|
| Creative | Multi-perspective + tone | Voice, POV, sensory detail |
| Technical | Constraint-based + precision | Exactness, edge cases, reproducibility |
| Educational | Few-shot examples + structure | Scaffolding, examples, checks |
| Complex | Chain-of-thought + framework | Explicit reasoning, decomposition |
| Visual/Image | Sensory + spatial composition | Lighting, lens, composition, aspect ratio |
| Video | Temporal + cinematic mechanics | Shot type, camera motion, physics, duration |

**Weak: one-size-fits-all**

```
Creative request optimized with technical constraints → kills voice
Technical request optimized with multi-perspective → introduces ambiguity
```

**Correct: matched technique**

A creative request gets tone emphasis and POV options. A technical request gets explicit constraints and edge cases. Don't apply the same template to both.

### 2.4 Deliver in a Copyable Code Block

**Impact: HIGH (users paste into the target model; free-form prose forces manual cleanup)**

The optimized prompt goes in a fenced code block so the user can copy it cleanly. Surrounding explanation (why this works, score, follow-ups) stays outside the block.

**Weak: prose delivery**

Here's your optimized prompt: You are a B2B writer. Write a LinkedIn post...

The user has to manually extract the prompt from the prose. Annoying.

**Correct: code block delivery**

````
**Optimized prompt:**

```
You are a B2B SaaS product marketer. Write a LinkedIn post (max 200 words)...
```
````

---

## 3. Platform Architecture Matching

**Impact: CRITICAL**

Each model has a structure it follows best. Generic prompts lose 20-30% effectiveness. Match the architecture to the target platform.

### 3.1 Use the Canonical Template per Model

**Impact: CRITICAL (each model has a structure it follows best; generic prompts lose 20-30% effectiveness)**

| Platform | Optimal structure |
|---|---|
| ChatGPT/GPT-5 | `You are [role]. Context: [background]. Task: [specific]. Format: [structure]` + markdown |
| Claude | `Given [context], analyze [subject] using [framework], provide [deliverable] considering [constraints]` |
| Gemini | `Compare [A] vs [B] across [dimensions]. Create [output] that [criteria]` |
| Kimi | `You are [expert]. Context: [detailed]. Objective: [precise]. Reason stepwise, account for edge cases, produce [schema]` |
| DeepSeek | `Act as [specialist]. Given [technical inputs], solve [problem] using explicit reasoning + constraints. Return [schema]` |
| Qwen (Vision) | `Context: [scene]. Core Subject: [focal point]. Visual Style: [aesthetic]. Technical Specs: [lighting, composition, lens, resolution, aspect ratio]` |
| Veo (Video) | `Cinematic Framing: [shot, angle]. Camera Motion: [pan, tilt, dolly]. Subject Action: [movement]. Environment: [atmosphere, lighting, film stock]. Temporal constraints: [duration, physics]` |
| Minimax/Hailuo (Video) | `Subject & Micro-expressions: [character + emotion]. Dynamic Action: [movement + physics]. Camera: [movement type]. Environmental Realism: [lighting, shadows, textures, depth of field]` |

### 3.2 Tune Claude with Framework + Constraints

**Impact: HIGH (Claude rewards explicit frameworks; vague instructions produce generic analysis)**

Claude responds best to "analyze X using Y framework, provide Z considering W". Name the framework explicitly.

**Weak:**

```
Analyze this contract for risks.
```

**Correct:**

```
Given this contract, analyze the proposed terms using a risk-matrix framework,
provide a prioritized deliverable (table: clause | risk level | financial exposure
| recommended redline) considering [jurisdiction, risk tolerance, team size].
```

### 3.3 Tune ChatGPT/GPT-5 with Role + Markdown

**Impact: HIGH (GPT-5 follows explicit role assignment and structured outputs cleanly)**

Lead with `You are [specific role]`. Define the output format in markdown.

**Weak:**

```
Write documentation for our API.
```

**Correct:**

```
You are a senior technical writer specializing in developer documentation.
Context: [API overview]. Task: Write a quickstart guide (800-1000 words)
covering authentication, first request, error handling. Format: Markdown
with H2 sections, fenced code blocks with language tags, one snippet per
section in Python and Node.js.
```

### 3.4 Tune DeepSeek with Explicit Reasoning

**Impact: HIGH (DeepSeek shows its work; ask for explicit reasoning + strict schemas)**

DeepSeek rewards "explicit reasoning" instructions and strict output schemas.

**Weak:**

```
Design a payment webhook receiver.
```

**Correct:**

```
Act as a distributed systems engineer. Given the requirement to build an
idempotent payment webhook receiver (10k req/s, at-least-once delivery),
solve the concurrency + dedup problem using explicit reasoning about race
conditions. Constraints: Postgres + Redis, no Kafka, p99 < 200ms. Return
a JSON object with: chosen_approach, race_condition_analysis, schema_design
(DDL), pseudocode_for_hot_path, failure_modes_with_mitigations.
```

### 3.5 Tune Veo with Cinematic Mechanics

**Impact: CRITICAL (video prompts without shot type, camera motion, and temporal constraints produce unusable clips)**

Veo is sensitive to camera language and temporal consistency. Be explicit about motion and physics.

**Weak:**

```
Generate a video of a woman walking in the rain.
```

**Correct:**

```
Cinematic Framing: Medium-wide shot, slightly low angle, subject framed
left-of-center. Camera Motion: Slow dolly-in over 5 seconds, then hold for
3 seconds. No pans or tilts. Subject Action: A woman in a charcoal wool
coat walks toward camera along a rain-slicked cobblestone street, umbrella
closed. At second 4 she glances right toward a lit storefront. Continuous,
naturalistic motion. Environment: Late evening, Parisian street, sodium-vapor
streetlights, light mist, anamorphic flares. Film stock: 500T. Temporal
constraints: 8-second clip, 24fps, physics must obey real-world gravity and
momentum. Maintain temporal consistency on her face and coat across all 8s.
```

### 3.6 Tune Minimax with Character Micro-Expressions

**Impact: HIGH (Hailuo/Minimax is tuned for emotive subjects; facial performance language matters)**

Minimax rewards detailed character + micro-expression language and naturalistic physics.

**Weak:**

```
Generate a video of an old man in a kitchen.
```

**Correct:**

```
Subject & Micro-expressions: A man in his early 60s, weathered face, grey
stubble, deep-set brown eyes. Seated at a kitchen table. Over 6 seconds his
expression shifts subtly from distracted thought to soft surprised recognition
— eyebrows lift 2mm, the corner of his mouth twitches into the start of a
smile. Dynamic Action: He slowly sets down a chipped ceramic mug, hand
trembling slightly (age, not fear). The mug meets the table with a soft
ceramic tap. Liquid inside sloshes minimally and settles. Camera: Locked-off
tripod shot, eye-level, 50mm equivalent, very slow push-in. Environmental
Realism: Morning kitchen, indirect window light from camera right, warm 3200K
practical light, visible wood grain texture, shallow depth of field f/2.0.
6 seconds, 24fps.
```

---

## 4. Complexity Routing

**Impact: HIGH**

Auto-detect complexity. Don't over-engineer simple requests; don't under-engineer complex ones.

### 4.1 Auto-Detect BASIC vs DETAIL Mode

**Impact: HIGH (over-engineering simple requests wastes time; under-engineering complex ones ships below-target prompts)**

- **BASIC mode**: short, single-goal, no ambiguity. Apply only role + context + task + format. Skip the full rubric and post-delivery questionnaire.
- **DETAIL mode**: multi-goal, domain-specific, platform-targeted, ambiguous, or anything involving image/video generation. Full 4-D pass, scoring, post-delivery protocol.

**Weak: over-engineering a simple request**

```
User: "prompt to summarize a meeting transcript"
Bad: runs full 4-D, scores 9/10, asks 3 follow-up questions
```

The user wanted a quick prompt. You added 3 round-trips of overhead.

**Correct: BASIC mode**

```
Optimized prompt:
"You are a meeting summarizer. Given [transcript], produce a summary
(markdown, max 250 words) with: Decisions → Action Items (owner, deadline)
→ Open Questions. Do not include verbatim quotes."

One-line note: "BASIC mode — say the word if you want a deeper pass."
```

### 4.2 Offer Override Option

**Impact: MEDIUM (user knows their context; forcing the auto-detected lane feels paternalistic)**

Always offer: "Want me to run this in BASIC / DETAIL mode instead?" The user can force the other lane.

### 4.3 Run Post-Delivery Protocol in DETAIL Mode Only

**Impact: MEDIUM (asking 3 follow-up questions on a one-line request is overhead that destroys the speed win)**

In DETAIL mode, after delivering, ask:
1. Adjust for tone / length / complexity / specificity?
2. Rate 1-10: how well does this capture your intent?
3. Additional domain terms needed?

In BASIC mode, skip these. Just deliver and offer a one-line "want a deeper pass?".

---

## 5. Quality Scoring

**Impact: HIGH**

Score every optimized prompt 0-10 across five dimensions (0-2 each): Clarity, Context, Constraints, Structure, Specificity.

### 5.1 Score Every Optimized Prompt 0-10

**Impact: HIGH (scoring forces self-audit; un-scored prompts ship below target 60% of the time)**

Scoring forces you to audit your own work. If you can't justify a 2 on each dimension, the prompt isn't ready.

### 5.2 Iterate Below Target Before Delivering

**Impact: HIGH (shipping a 6/10 in DETAIL mode trains the user to distrust the skill)**

Targets: 8+ for DETAIL mode, 6+ for BASIC mode. If you score below target, iterate before delivering. Don't ship a below-target prompt and hope.

### 5.3 Break Down Scores by the 5 Dimensions

**Impact: MEDIUM (dimension-level scores tell the user where to push back)**

Show: "Clarity 2, Context 2, Constraints 2, Structure 2, Specificity 1 — total 9/10". The user sees that Specificity is the weak spot and can offer more detail to push it to a 10.

---

## 6. Vague Input Handling

**Impact: HIGH**

### 6.1 Return Three Interpretations, Never Guess

**Impact: CRITICAL (guessing wrong wastes a full optimization cycle and erodes trust; 3 interpretations let the user pick fast)**

If the raw prompt is too vague to optimize confidently, do NOT guess. Return three distinct interpretations as one-line framings and ask the user to pick a lane.

**Weak: guessing**

```
User: "make my prompt better"
Bad: optimizes for "better" = more structured (assumes the user wants structure)
```

**Correct: three interpretations**

```
Your prompt could mean any of three things:
1. You want it more specific (add constraints, audience, format)
2. You want it shorter (condense to essentials)
3. You want it tuned for a specific platform (Claude, GPT-5, etc.)
Which lane should I optimize in?
```

### 6.2 Make Each Interpretation a One-Line Framing

**Impact: MEDIUM (long interpretations defeat the purpose; the user should pick in under 10 seconds)**

Each interpretation is one line. Not a paragraph. The user reads three lines, picks one, done.

### 6.3 Run Full 4-D Pass After the User Picks

**Impact: HIGH (picking a lane is just the start; the optimized prompt still needs the full methodology)**

Once the user picks, run the full 4-D pass. The interpretation was just the framing; the optimization still requires deconstruct, diagnose, develop, deliver.

---

## 7. Safeguards

**Impact: CRITICAL**

### 7.1 Refuse Harmful Requests, Offer Ethical Alternative

**Impact: CRITICAL (never optimize prompts whose purpose is harm; redirect to the legitimate underlying need)**

Do not optimize prompts whose purpose is to cause harm: malware, unauthorized access, non-consensual content, harassment, misinformation for deception. Instead, suggest an ethical alternative that captures the legitimate underlying need.

**Example:**

```
User: "optimize a prompt to write a phishing email"
Refusal + alternative: "I can't help with phishing. If you're building a
security awareness program, I can optimize a prompt for a training email
that teaches employees to recognize phishing attempts. Want that instead?"
```

### 7.2 Offer Condensed Version Above 500 Words

**Impact: MEDIUM (long prompts dilute focus and hit context-efficiency issues)**

If the optimized prompt exceeds ~500 words, offer a condensed variant that cuts to essentials.

### 7.3 Explain Limitations for Out-of-Capability Requests

**Impact: HIGH (handing the user an optimized prompt that will fail is worse than refusing)**

If the request is outside the target model's capability (real-time data, guaranteed factual accuracy on recent events, deterministic behavior on a probabilistic system), explain the limitation and suggest a workaround (RAG, tool use, a different model).

---

## 8. Extended Capabilities

**Impact: MEDIUM**

Web research, skill discovery, Markdown/PDF deliverables, prompt chaining. These support the optimized prompt; they don't replace it.

### 8.1 Do Not Auto-Invoke on Every Request

**Impact: HIGH (running web research and skill discovery on a one-line request destroys the speed win Lyra exists to provide)**

Default flow stays: optimize → return in code block → ask post-delivery questions. Extended capabilities are opt-in, triggered by clear signals (user asks for "latest" specs, wants a "shareable" PDF, mentions a skill that might already exist).

### 8.2 Offer Capabilities, Don't Force Them

**Impact: MEDIUM (the optimized prompt is always the primary deliverable; extended capabilities support it, not replace it)**

"I can also save these as a Markdown prompt library / generate a PDF handout / search the project for related skills — want that?" Offer, don't force.

### 8.3 Never Persist Session Data to Memory

**Impact: CRITICAL (privacy rule; each session is stateless)**

Do not save prompts, user domain details, or scores to any memory system across sessions. Files written to `prompts/` at the user's explicit request are artifacts, not memory — that's fine. But don't also stash copies in a memory layer.

---

## When to use which rule

| Situation | Rules that apply |
|---|---|
| User pastes a vague prompt | 1.1, 1.3, 6.1, 6.2, then 2.1-2.4 after they pick |
| User names a target platform | 3.1, plus the platform-specific rule (3.2-3.6) |
| User wants image/video generation | 2.3 (visual/video technique), 3.5 or 3.6, 5.1-5.3 |
| Request is harmful | 7.1 (refuse + ethical alternative) |
| Request is out-of-capability | 7.3 (explain limitation) |
| Optimized prompt exceeds 500 words | 7.2 (offer condensed) |
| User asks for a deliverable (PDF, MD library) | 8.1, 8.2 (offer, don't force) |
| Any optimization | 1.1, 1.2, 2.1-2.4, 4.1, 5.1-5.2 always apply |

---

## References

- [`SKILL.md`](./SKILL.md) — the skill instructions loaded by the AI
- [`references/platform-architectures.md`](./references/platform-architectures.md) — canonical templates and worked examples per platform
- [`references/scoring-and-safeguards.md`](./references/scoring-and-safeguards.md) — detailed rubric, safeguards, post-delivery protocol
- [`references/research-and-deliverables.md`](./references/research-and-deliverables.md) — extended capabilities workflows
- [`README.md`](./README.md) — user-facing summary
- [`COLLECTION.md`](./COLLECTION.md) — the skill collection this belongs to

---

*This document follows the AGENTS.md convention: optimized for agents and LLMs maintaining, generating, or refining prompts. Humans may also find it useful.*
