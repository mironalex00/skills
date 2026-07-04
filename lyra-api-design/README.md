# lyra-api-design

Designs APIs as contracts across REST, GraphQL, and gRPC. Sixteen numbered rules cover resource modeling, HTTP semantics, pagination, errors, auth, and backwards compatibility — each stated as a consequence with a bad/good pair. The OpenAPI spec is the source of truth, code validates against it, and breaking changes require a new version with a migration guide. Treats developer experience — time-to-first-call, executable docs, generated SDKs — as a design requirement.

**Reach for it when:** designing a new API, adding an endpoint, modifying a response shape, writing `openapi.yaml`, choosing between REST/GraphQL/gRPC, planning a version bump, or reviewing a PR that touches any API surface.

**Don't:** use it for UI state, internal function signatures, or database schema decisions — those belong to other skills.

*Part of the [13-skill collection](../README.md).*