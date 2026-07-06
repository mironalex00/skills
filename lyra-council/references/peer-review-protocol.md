# Peer review protocol

The peer review round is what makes the council more than "ask five times and average." Advisors answer independently. Reviewers evaluate those answers without knowing which advisor wrote which. The chairman then sees both rounds and resolves them. This file is the exact protocol.

## Anonymization

After all five advisor responses are collected, assign each a letter A through E. The mapping must be randomized per session, not positional. A fixed mapping (always Contrarian = A, First Principles = B, ...) lets reviewers infer the source from the angle, which defeats the point.

A simple shuffle: take the five advisor keys, generate a random permutation, assign letters in permutation order. Record the mapping in the session file under `anonymization_map` so the chairman can de-anonymize later.

The reviewers never see the mapping. The chairman sees it.

## The reviewer prompt

Each of the five reviewers is spawned as a separate subagent in parallel, using the Task tool. They do not know which advisor they are — every reviewer gets the same prompt and the same five anonymized responses. The point of spawning five reviewers rather than one is that each may catch a different blind spot; one reviewer tends to converge on a single read.

The reviewer prompt:

```
You are reviewing the output of a five-advisor LLM council. Five advisors independently answered this question:

---
{framed_question}
---

Here are their anonymized responses:

Response A:
{response_a}

Response B:
{response_b}

Response C:
{response_c}

Response D:
{response_d}

Response E:
{response_e}

Answer these three questions. Reference responses by letter. Be specific — "Response C is strongest because it names the failure mode concretely" beats "Response C is good."

1. Which response is the strongest, and why? Pick one.
2. Which response has the biggest blind spot, and what is the blind spot?
3. What did all five responses miss that the council should consider?

Keep your review under 200 words. Be direct. Do not defer to a response because it sounds authoritative — evaluate on the quality of the reasoning.
```

## The three questions, and why these three

The first question (strongest) forces the reviewer to commit to a ranking. Without it, reviews collapse into "each response has merits" and the chairman has nothing to work with.

The second question (biggest blind spot) forces the reviewer to find a weakness in the strongest response, not just praise it. This is what produces the blind-spots section of the verdict — weaknesses that only emerge when one response is read against the others.

The third question (what all five missed) is the most valuable. It asks the reviewer to step outside the five responses entirely and name what none of them considered. This is where the council catches things no individual advisor caught. If a reviewer cannot name anything, they say so — but they should try before giving up.

## Anti-deference rules

Reviewers must not defer to a response because of its tone, length, or apparent authority. A response that sounds confident can be wrong; a response that hedges can be right. Evaluate the reasoning, not the rhetoric.

Reviewers must not try to guess which advisor wrote which response. If a reviewer writes "Response C is clearly the Contrarian because it focuses on flaws," discard that line of the review and ask the reviewer to evaluate Response C on its merits. Guessing the source defeats anonymization.

Reviewers must not invent a sixth angle. Their job is to evaluate the five responses in front of them, not to add their own analysis of the question. The third question (what all five missed) is the exception — there, the reviewer names what was omitted, but does not write a full sixth response.

## Handling timeouts and short rounds

If an advisor timed out in step 4, the round has four responses, not five. Anonymize as A through D, and adjust the reviewer prompt accordingly. Note the timeout in the session file (`advisors.{name}.timed_out: true`).

If two or more advisors timed out, the round is too thin to peer-review meaningfully. Do not proceed to synthesis. Tell the user the council could not convene a full round, save a partial session file marked `"incomplete": true`, and stop. A partial council is worse than no council — it produces a confident-sounding verdict from an incomplete picture.

## What the chairman does with the reviews

The chairman sees the five advisor responses de-anonymized (it knows which advisor wrote what) and the five peer reviews still anonymized (it does not know which reviewer wrote which review). The asymmetry is deliberate: the chairman needs to weigh the advisor's identity against its angle (a Contrarian point and an Expansionist point in tension is more informative than two unnamed points), but the reviews are most useful when the chairman cannot defer to "the reviewer who agreed with the Contrarian."

The chairman's synthesis pulls strongest-response picks, blind-spot findings, and all-missed findings across the five reviews, resolves them against the advisor responses, and produces the verdict. The blind-spots section of the verdict is built almost entirely from the peer review round — that is where blind spots surface.