# Memory schema

The council persists every session to disk so future councils can read what past councils concluded. Memory is what turns five one-shot advisors into an accumulating institution.

## File layout

```
.lyra/council/
├── sessions/
│   └── council-{YYYY-MM-DD-HHMM}-{shortid}.json
└── index.jsonl
```

The `.lyra/` directory lives at the project root. If there is no project (the user is running the council outside a project directory), fall back to `~/.lyra/council/` with the same layout. The skill writes to whichever exists; if neither exists, it creates `.lyra/council/` in the current working directory.

Session IDs sort chronologically by prefix and include a short random suffix to avoid collisions when two councils convene in the same minute: `council-2026-07-15-1432-a1b2`. The suffix is four hex characters from a hash of the topic, or random if no topic.

## Session file schema

Each session file is a single JSON object. Fields:

```
{
  "id": "council-2026-07-15-1432-a1b2",
  "timestamp": "2026-07-15T14:32:00Z",
  "topic": "Beginner Claude course at $297",
  "tags": ["pricing", "course", "launch"],

  "question_raw": "Should I build a $297 course on Claude Code for beginners? My audience is mostly non-technical solopreneurs.",
  "question_framed": "The user is deciding whether to build a $297 beginner course on Claude Code for a non-technical solopreneur audience. Context: ... What is at stake: ...",
  "context_files": ["CLAUDE.md", "memory/audience.md"],

  "prior_sessions": [
    {"id": "council-2026-07-10-0915-x3y4", "topic": "...", "verdict_summary": "..."}
  ],

  "advisors": {
    "contrarian":      {"response": "...", "word_count": 240, "timed_out": false},
    "first_principles":{"response": "...", "word_count": 280, "timed_out": false},
    "expansionist":    {"response": "...", "word_count": 220, "timed_out": false},
    "outsider":        {"response": "...", "word_count": 260, "timed_out": false},
    "executor":        {"response": "...", "word_count": 250, "timed_out": false}
  },

  "anonymization_map": {
    "contrarian": "C",
    "first_principles": "A",
    "expansionist": "E",
    "outsider": "B",
    "executor": "D"
  },

  "peer_reviews": [
    {"reviewer_letter": "A", "strongest": "Response D", "blind_spot": "Response B", "all_missed": "..."},
    {"reviewer_letter": "B", "strongest": "...",        "blind_spot": "...",        "all_missed": "..."},
    {"reviewer_letter": "C", "strongest": "...",        "blind_spot": "...",        "all_missed": "..."},
    {"reviewer_letter": "D", "strongest": "...",        "blind_spot": "...",        "all_missed": "..."},
    {"reviewer_letter": "E", "strongest": "...",        "blind_spot": "...",        "all_missed": "..."}
  ],

  "verdict": {
    "agrees": ["The beginner solopreneur angle has real demand", "The Claude Code framing will not resonate with non-technical buyers"],
    "clashes": ["Price point — Contrarian says $297 is too high given competition; Expansionist says it is too low for the value"],
    "blind_spots": ["The Outsider's point that 'Claude Code' means nothing to the target buyer is the single most important insight"],
    "recommendation": "Do not build the course yet. Validate with a lower-commitment offer first, reframed around the outcome not the tool.",
    "first_action": "Run a $97 live workshop called 'How to automate your first business task with AI' to 50 people."
  },

  "references": ["council-2026-07-10-0915-x3y4"],
  "advisor_set": "default"
}
```

The `advisor_set` field records which five advisors were used. `"default"` is the canonical five. For a lyra-docs per-file review it would be `"lyra-docs-per-file"` with the five review-axis personas.

## Index file

`.lyra/council/index.jsonl` is append-only. One JSON object per line, no trailing comma, no pretty-printing. Fields are the subset needed to decide whether to open the full session:

```
{"id":"council-2026-07-15-1432-a1b2","timestamp":"2026-07-15T14:32:00Z","topic":"Beginner Claude course at $297","tags":["pricing","course","launch"],"recommendation":"Do not build the course yet. Validate with a lower-commitment offer first, reframed around the outcome not the tool.","first_action":"Run a $97 live workshop called 'How to automate your first business task with AI' to 50 people.","references":["council-2026-07-10-0915-x3y4"]}
```

Append a line only after the session file is written. If the write fails, do not append — a missing index entry means the session does not exist for query purposes, which is correct.

## Query patterns

The skill queries memory by reading the index and filtering in memory. The index is small (one line per session, a few hundred bytes); reading the whole file is fine for any realistic session count.

To find sessions by tag, grep the index for the tag string. Tags are stored as a JSON array, so the tag appears as `"tag"` inside the line:

```
grep '"pricing"' .lyra/council/index.jsonl
```

To find sessions by topic, grep case-insensitively for a topic substring:

```
grep -i 'course' .lyra/council/index.jsonl
```

To find sessions by date, grep for the date prefix:

```
grep '2026-07-15' .lyra/council/index.jsonl
```

To find sessions that reference a prior session, grep for the prior session's ID:

```
grep 'council-2026-07-10-0915' .lyra/council/index.jsonl
```

After the grep returns matching lines, parse each as JSON, then open the corresponding session file under `sessions/` for the full advisor responses, peer reviews, and verdict. Feed the verdict and first action of each relevant prior session into the advisor prompt as prior-session notes.

## What to feed advisors from prior sessions

Do not dump the full prior session into the advisor prompt. Feed a compressed note per prior session:

```
Prior session council-2026-07-10-0915-x3y4 (topic: "Pricing for the automation workshop"):
- Recommendation: price at $97 to validate demand before raising.
- First action: run the workshop once at $97 before considering a higher tier.
```

Three lines per prior session. If more than three prior sessions match, take the three most recent. Advisors do not need the full transcript — they need the conclusion and the reasoning behind it, so they can build on it or contradict it.

## Immutability

Session files are write-once. Never edit a session after it is written. If a decision is revisited, write a new session that lists the prior session's ID in its `references` field. The chain of references is the audit trail: reading a new session, then the prior sessions it references, reconstructs how the thinking evolved.

If a session was written with an error (wrong topic, malformed JSON), do not fix it in place. Write a new session with a corrected topic and a reference to the broken one. The broken one stays as a record of what actually happened.

## What does not go in memory

The council does not save: the user's raw input beyond what is in `question_raw`, the contents of context files that were read (those live in the workspace already), or any PII the user included in their question. If the raw question contains secrets, redact them before writing the session file and note the redaction in the `question_raw` field: `"question_raw": "Should I use API key sk-... in production? [redacted]"`.

Memory is for the council's conclusions and reasoning, not for exfiltrating workspace contents.