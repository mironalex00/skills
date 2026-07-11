# lyra-bug-hunter

Adversarial bug hunting for runtime behavior. Four roles check each other — Recon maps risk, the Hunter finds defects with a concrete runtime trigger, the Skeptic tries to kill every finding, the Referee confirms only what survives with evidence. Confirmed bugs get fixed one commit at a time with verification and auto-revert; everything else ships in an honest report, dismissed findings included. Scopes to the whole tree, a path, a branch diff, a PR, or staged files.

**Reach for it when:** you want bugs found and proven (not vibes), a behavior-focused PR review, a pre-merge regression check, or a security-flavored sweep.

**Don't:** style cleanup (`lyra-de-slop`), architecture review (`lyra-analyze-codebase`), or fixing a bug you've already diagnosed (`lyra-debug`).

_Part of the [skill collection](../README.md)._
