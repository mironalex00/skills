# lyra-context-optimization

Token-efficiency tactics for LLM agents and pipelines — cache-stable prefixes, observation masking, disciplined compaction, just-in-time retrieval, sub-agent partitioning, and explicit budgets with threshold triggers. Everything is measurement-first: identify what dominates the window, apply the matching tactic, and prove it paid for itself.

**Reach for it when:** token costs or a context limit constrain a task, cache hit rates are poor, an agent drowns in its own tool outputs, or you're designing prompt structure for a long-running agent.

**Don't:** diagnosing why output quality already dropped (context poisoning/degradation is a diagnosis problem), prompt wording and instruction design (`lyra`), or persistent memory architecture.

_Part of the [skill collection](../README.md)._
