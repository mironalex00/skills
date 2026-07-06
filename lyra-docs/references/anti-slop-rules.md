# Anti-slop rules

The documentation must read like a person wrote it. No AI tells, no marketing language, no boilerplate. This file lists the specific patterns to catch and cut.

## Banned vocabulary

Grep for these. Any hit is a blocking finding.

leverage, utilize, seamless, robust, showcase, foster, delve, additionally, moreover, crucial, pivotal, enhance, unlock, elevate, harness, intricate, vibrant, testament, underscore, paradigm, synergy, ecosystem, innovative, cutting-edge, next-generation, world-class, best-in-class, industry-leading, transform, disrupt, game-changing, revolutionary, groundbreaking, state-of-the-art, future-proof, scalable (as filler), powerful (as filler), comprehensive (as filler), deep dive, in the realm of, in the landscape of, at the end of the day, it is worth noting, it should be noted.

Domain terms are allowed when the code uses them. "Robust" in a statistics context, "realm" in an auth context — keep them. The rule is about filler, not about legitimate terminology.

## Structural slop

Rewrite these at the root, do not just delete them.

- Throat-clearing openers: "It is worth noting that...", "In today's fast-paced world...", "It is important to understand...". Cut the opener, start with the claim.
- Negative parallelisms: "Not just X, it is Y", "Not only... but also...". State one claim plainly.
- Rule-of-three padding: "features, benefits, and capabilities". If the third item does not add information, cut it.
- False ranges: "from X to Y" where X and Y are not on a meaningful scale.
- -ing fake-depth tags: "highlighting...", "ensuring...", "symbolizing...", "demonstrating...". These tack onto a sentence to add depth that is not there.

## Filler phrases

Replace or cut.

- "In order to" becomes "to".
- "Due to the fact that" becomes "because".
- "At this point in time" becomes "now".
- "It is important to note that" becomes nothing — just state the thing.
- "The system has the ability to" becomes "the system can".
- "In the event that" becomes "if".

## Excessive hedging

One qualifier per claim. More than one is hedging.

- Bad: "It could potentially possibly be argued that the policy might have some effect."
- Good: "The policy may affect outcomes."

## Formatting tells

- No emojis anywhere. Not in headings, not in bullets, not in callouts.
- Straight quotes only. No curly quotes.
- Sentence-case headings. "How the auth module works", not "How The Auth Module Works".
- No inline-header bold-colon lists. Do not write `- **Foo:** bar`. Write a sentence or a normal list.
- No boldface for emphasis. Bold is for defining a term on first use, nothing else.
- Em-dashes are fine singly. Clustering (three or four in one sentence) is the tell — use commas or periods instead.
- Use plain copulas (is, are, has). Do not write "serves as", "boasts", "features", "offers".

## Boilerplate openers

Never start a section with:

- "This document describes..."
- "In this section, we will..."
- "The following documentation outlines..."
- "Welcome to the documentation for..."

Start with the information. The reader knows what they opened.

## Auto-generated phrasing

Never write:

- "This function is responsible for..."
- "This module handles the responsibility of..."
- "The purpose of this file is to..."
- "This component provides functionality for..."

These are the signature of a model narrating code. Rewrite as observable behavior: "The function returns X (`file:line`)", "The module exports Y and Z (`file:line`)".

## Repetition

A claim appears once. If it is relevant in two files, cite it in one and cross-reference in the other: "See `architecture.md` for how the cache layer fits the request path." Do not restate the same explanation.

The exception is the general index (`docs/README.md`), which summarizes each file in one or two lines. Summaries are not repetition — they are navigation.

## The read-aloud test

Read the file aloud. If a sentence sounds like it could have been written by a model narrating code, rewrite it. If it sounds like a person explaining to a colleague, it passes.

## The grep gate

Before a file lands, run the grep below against it. Any hit is a blocking finding — fix it or justify it as a domain term.

```
grep -iE "leverage|utilize|seamless|robust|showcase|foster|delve|additionally|moreover|crucial|pivotal|enhance|unlock|elevate|harness|intricate|vibrant|testament|underscore|paradigm|synergy|ecosystem|innovative|cutting-edge|next-generation|world-class|best-in-class|industry-leading|transform|disrupt|game-changing|revolutionary|groundbreaking|state-of-the-art|future-proof|deep dive|in the realm of|in the landscape of|at the end of the day|it is worth noting|it should be noted" docs/file.md
```

The list above covers every banned word and phrase in this file. When you add a new entry to the banned vocabulary section, add it to the grep too — the two lists must stay in sync.