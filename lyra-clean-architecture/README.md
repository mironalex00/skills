# lyra-clean-architecture

One decision tree for Clean Architecture, Hexagonal (Ports & Adapters), and DDD. Walk it top-down — NONE → Layered → Hexagonal → DDD — and stop at the first level that fits. The Dependency Rule is the unifying principle: dependencies point inward, toward business policy. Default to less. Push back when someone reaches for Hexagonal on a CRUD app or DDD on a prototype.

**Reach for it when:** someone says "architecture", "clean architecture", "hexagonal", "ports and adapters", "onion", "DDD", "bounded context", "decouple from the database", "make this testable", or "refactor this monolith".

**Don't:** use it as a license to add ports, layers, and aggregates you don't yet need.

*Part of the [13-skill collection](../README.md).*