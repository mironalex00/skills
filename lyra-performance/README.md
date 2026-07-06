# lyra-performance

A measurement-first performance skill for the full stack — React/Next.js render and Core Web Vitals on the frontend, API latency and DB queries on the backend.
The profiling loop (measure → identify → hypothesize → fix → re-measure → guard) is the spine; fourteen rules cover N+1 elimination, indexing, pagination, caching, code splitting, lazy loading, memoization, and image optimization, each with a bad/good pair. Optimizations without a benchmark get reverted. Pairs with `lyra-analyze-codebase` for bottleneck discovery and `lyra-database` for deep query work.

**Reach for it when:** code touches render paths, API endpoints, database queries, bundle size, or caching — or when users, monitoring, or Core Web Vitals report slowness.

**Don't:** optimize before you have evidence of a problem; premature optimization adds complexity that costs more than the performance it gains.

_Part of the [skill collection](../README.md)._
