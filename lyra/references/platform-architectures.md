# Platform-Specific Prompt Architectures

Canonical templates for tuning an optimized prompt to its target model. Each section gives the optimal structure, when to use it, and one worked example. When the user names a platform (or it's clearly implied by the task), build the final prompt on that platform's template.

## Table of contents
1. [ChatGPT / GPT-5](#chatgpt--gpt-5)
2. [Claude](#claude)
3. [Gemini](#gemini)
4. [Kimi](#kimi)
5. [DeepSeek](#deepseek)
6. [Qwen (Vision / Multimodal)](#qwen-vision--multimodal)
7. [Google Veo (Video)](#google-veo-video)
8. [Minimax / Hailuo AI (Video)](#minimax--hailuo-ai-video)
9. [Platform selection guide](#platform-selection-guide)

---

## ChatGPT / GPT-5

**Optimal structure:**
```
You are [role].
Context: [background].
Task: [specific].
Format: [structure]
```
+ markdown rendering assumed.

**When to use:** General-purpose tasks, instruction-following, content generation, structured outputs. GPT-5 responds well to explicit role assignment and markdown-formatted deliverables.

**Worked example — technical writing:**
```
You are a senior technical writer specializing in developer documentation.
Context: We're releasing a new authentication SDK. Audience is backend
developers familiar with OAuth 2.0 but new to our product. They value
copy-pasteable code examples over prose.
Task: Write a quickstart guide (800-1000 words) covering installation,
initialization, token refresh, and error handling. Include one code
snippet per section in Python and Node.js. Anticipate the top 3 failure
modes and add a "Common issues" section.
Format: Markdown with H2 sections, fenced code blocks with language tags,
and a callout block at the top linking to the full API reference.
```

---

## Claude

**Optimal structure:**
```
Given [context], analyze [subject] using [framework], provide [deliverable]
considering [constraints].
```

**When to use:** Long-context analysis, document review, nuanced reasoning, tasks needing careful step-by-step thinking, safety-sensitive content. Claude rewards explicit frameworks and explicit constraints.

**Worked example — analysis:**
```
Given this 40-page product requirements document (attached), analyze the
proposed feature set using the Kano model, provide a prioritized roadmap
deliverable (table format: feature | Kano category | effort estimate |
recommended phase) considering our constraints: 6-month timeline, 4-engineer
team, must ship a public beta by Q3. Flag any features that conflict with
each other or with the stated constraints.
```

---

## Gemini

**Optimal structure:**
```
Compare [A] vs [B] across [dimensions]. Create [output] that [criteria].
```

**When to use:** Comparison tasks, multi-source synthesis, multimodal inputs (text + images), tasks benefiting from Google's search-grounded knowledge. Gemini excels at weighing alternatives.

**Worked example — decision support:**
```
Compare PostgreSQL vs. MongoDB vs. DynamoDB across these dimensions: data
model fit, scaling characteristics, query flexibility, operational burden,
cost at 1TB / 10TB / 100TB, and ecosystem maturity. Create a decision
matrix (markdown table) that a CTO could use to pick a primary datastore
for a SaaS analytics product expected to hit 50M rows/month within 18
months. Include a one-paragraph recommendation with the top pick and the
runner-up.
```

---

## Kimi

**Optimal structure:**
```
You are [expert]. Context: [detailed]. Objective: [precise]. Reason
stepwise, account for edge cases, produce [schema].
```

**When to use:** Long-context Chinese-language tasks, document QA, tasks requiring explicit stepwise reasoning. Kimi handles very long inputs well and rewards edge-case enumeration.

**Worked example — legal/contract review:**
```
You are a contract review expert specializing in SaaS agreements under
English law. Context: The attached MSA has a 36-month initial term, auto-
renews annually, caps liability at 12 months of fees, and grants us an
indemnity that excludes indirect damages. Our risk tolerance is moderate;
we're a Series B startup and cannot absorb uncapped IP indemnity.
Objective: Identify the 5 highest-risk clauses for us, ranked by financial
exposure. Reason stepwise through each clause, account for edge cases
(e.g., what happens if we terminate for cause vs. convenience), and
produce a JSON array where each element has: clause_number, risk_level
(low|medium|high|critical), financial_exposure_estimate, recommended_redline.
```

---

## DeepSeek

**Optimal structure:**
```
Act as [specialist]. Given [technical inputs], solve [problem] using
explicit reasoning + constraints. Return [schema].
```

**When to use:** Technical/engineering problems, math, coding, reasoning-heavy tasks where you want the model to show its work. DeepSeek responds well to "explicit reasoning" instructions and strict output schemas.

**Worked example — algorithm design:**
```
Act as a distributed systems engineer. Given the requirement to build an
idempotent payment webhook receiver that handles 10k req/s with at-least-
once delivery from the payment provider, solve the concurrency + dedup
problem using explicit reasoning about race conditions. Constraints: must
run on Postgres + Redis, no Kafka, p99 latency under 200ms, budget for
one DB write per request. Return a JSON object with: chosen_approach,
race_condition_analysis (array of scenarios), schema_design (SQL DDL),
pseudocode_for_hot_path, and failure_modes_with_mitigations.
```

---

## Qwen (Vision / Multimodal)

**Optimal structure:**
```
Context: [scene/environment]. Core Subject: [detailed focal point].
Visual Style: [aesthetic/artistic medium]. Technical Specs: [lighting,
composition, lens, resolution, aspect ratio].
```

**When to use:** Image generation and image understanding tasks targeting Qwen-VL or Qwen image models. Spatial and technical specs matter more than narrative.

**Worked example — image generation:**
```
Context: A quiet Kyoto teahouse interior at dusk, tatami flooring, shoji
screens softly glowing, a low lacquered table.
Core Subject: A single ceramic teacup, hand-thrown, celadon glaze with
a hairline crack filled with gold (kintsugi), faint steam rising. The
cup is two-thirds full of matcha.
Visual Style: Wabi-sabi still life, muted earth palette, painterly
realism reminiscent of Morandi meets Japanese suiboku-ga.
Technical Specs: Soft north window light from camera left, low-key
lighting with gentle rim light on the cup's right edge. Shallow depth
of field (f/2.8), 85mm lens equivalent, eye-level 3/4 angle. Square 1:1
aspect ratio, 4K resolution, subtle film grain.
```

---

## Google Veo (Video)

**Optimal structure:**
```
Cinematic Framing: [Shot type, angle]. Camera Motion: [Pan, tilt, dolly,
tracking]. Subject Action: [Fluid, continuous movement]. Environment:
[Atmosphere, lighting, film stock]. Temporal constraints: [Duration,
physics consistency].
```

**When to use:** Cinematic video generation. Veo is sensitive to camera language and temporal consistency — be explicit about motion and physics.

**Worked example — short cinematic clip:**
```
Cinematic Framing: Medium-wide shot, slightly low angle, subject framed
left-of-center following rule of thirds.
Camera Motion: Slow dolly-in over 5 seconds (approx. 1.5m travel), then
hold for 3 seconds. No pans or tilts. Stable, gimbal-smooth.
Subject Action: A woman in a charcoal wool coat walks toward camera along
a rain-slicked cobblestone street, umbrella closed despite light rain.
Her gait is steady, unhurried. At second 4 she glances right toward a
lit storefront. Continuous, naturalistic motion — no jump cuts.
Environment: Late evening, Parisian street, sodium-vapor streetlights
casting warm pools of light, light mist. Wet cobblestones reflect
neon signage in soft focus background. Anamorphic lens flares from
practical lights. Film stock: 500T, slight halation on highlights.
Temporal constraints: 8-second clip, 24fps, physics must obey real-world
gravity and momentum (no floating fabric, no impossible weight shifts).
Maintain temporal consistency on the woman's face and coat across all
8 seconds.
```

---

## Minimax / Hailuo AI (Video)

**Optimal structure:**
```
Subject & Micro-expressions: [Highly detailed character + subtle emotional
shifts]. Dynamic Action: [Primary movement + realistic physics]. Camera:
[Specific movement type]. Environmental Realism: [Lighting, shadows,
textures, depth of field].
```

**When to use:** Character-driven video where facial performance and physical realism matter. Hailuo/Minimax is tuned for emotive subjects and naturalistic physics.

**Worked example — character moment:**
```
Subject & Micro-expressions: A man in his early 60s, weathered face,
grey stubble, deep-set brown eyes. He's seated at a kitchen table. Over
the 6-second clip his expression shifts subtly from distracted thought
to a soft, surprised recognition — eyebrows lift 2mm, the corner of his
mouth twitches into the start of a smile. Eyes stay natural, no over-
acting.
Dynamic Action: He slowly sets down a chipped ceramic mug, hand trembling
slightly (age, not fear). The mug meets the table with a soft ceramic
tap. Realistic physics: the liquid inside sloshes minimally and settles,
steam drifts upward and disperses naturally, no looping.
Camera: Locked-off tripod shot, eye-level, 50mm equivalent, very slow
imperceptible push-in (under 10cm over 6s). Static enough to feel
observational.
Environmental Realism: Morning kitchen, indirect window light from camera
right casting soft long shadows. Warm 3200K practical light from an off-
screen stove hood. Visible texture: wood grain on table, faint steam,
dust motes in the light beam. Shallow depth of field, f/2.0, background
kitchen softly out of focus but recognizable. 6 seconds, 24fps.
```

---

## Platform selection guide

If the user hasn't named a platform, pick based on the task:

| Task signal | Default platform |
|---|---|
| General writing, structured outputs, broad instruction-following | ChatGPT / GPT-5 |
| Long-document analysis, careful reasoning, safety-sensitive | Claude |
| Comparisons, multi-source synthesis, search-grounded | Gemini |
| Long Chinese-language context, document QA | Kimi |
| Hard technical/engineering/math problems, visible reasoning | DeepSeek |
| Image generation (any) | Qwen (or platform-native image model) |
| Cinematic video with camera language | Google Veo |
| Character/emotive video with facial performance | Minimax / Hailuo |

Always tell the user which platform you optimized for and why. If their use case could fit two platforms, offer a second variant tuned to the alternative.