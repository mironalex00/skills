# lyra-nodejs

Node.js backends grounded in the event loop mental model — sixteen tight rules derived from the single-threaded reality, not a snippet collection. Framework choice, async patterns, streams, worker threads, security, and database integration all flow from one fact: one JS thread, one call stack, non-blocking I/O via libuv. Push business logic behind ports and test it with in-memory fakes; if a unit test needs to mock `pg` or `express`, the boundary is wrong.

**Reach for it when:**

- Starting a new Node backend, or reviewing one that stalls, leaks, or crashes under load.
- Choosing between Express, Fastify, and NestJS, or arguing async, streams, or workers.

**Don't:**

- Expect browser-JS rules to apply — the event loop punishes every synchronous mistake.
- Use it for frontend, build tooling, or non-Node runtimes.

_Part of the [skill collection](../README.md)._