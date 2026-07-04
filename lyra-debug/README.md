# lyra-debug

A debugging discipline built on the scientific method, language-agnostic and tool-light. Every bug is a hypothesis to falsify, every fix a one-variable experiment with a regression test written first. It enforces binary-search localization, log-then-trace for prod-only bugs, and 5-Whys root-cause analysis so the same class of bug doesn't come back. Twelve tight rules, one 10-step loop, no ceremony. Works across TS, JS, Python, PHP, Go, Rust, Java, C#, and Ruby.

**Reach for it when:** any bug, crash, error, exception, test failure, flaky behavior, prod incident, or "it doesn't work" report — in any supported language.

**Don't:** exploration spikes (use `lyra-tdd`'s spike exemption), performance profiling, or reviewing someone else's fix (use `lyra-code-review`).

*Part of the [13-skill collection](../README.md).*