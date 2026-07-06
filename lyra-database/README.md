# lyra-database

Council-refined database engineering rules for **PostgreSQL, MySQL, and SQLite** — twenty-two rules across seven categories, each with an impact level, a WEAK-vs-CORRECT SQL pair, and database-specific tags. Supersedes `mysql-patterns` by generalizing beyond MySQL and adding schema design, transaction management, migration safety, and connection pooling.

## Why

`mysql-patterns` was MySQL-only and skipped the lifecycle stages that cause the worst production incidents: migrations that lock tables, transactions that span external calls, and foreign keys without indexes. `lyra-database` improves on it by:

- **Generalizing to three databases** — PostgreSQL, MySQL, and SQLite — with database-specific syntax tags (`[PG]`, `[MySQL]`, `[SQLite]`) on every example and a quick-reference comparison table.
- **Adding schema design rules** — normalization discipline, foreign key indexing, type selection, natural key uniqueness, CHECK-over-ENUM.
- **Adding query optimization** — EXPLAIN-driven analysis, covering indexes, sargability (no functions on indexed columns), keyset pagination.
- **Adding transaction management** — ACID enforcement, isolation level selection, deadlock retry, no-external-calls-in-transaction.
- **Adding migration safety** — expand-contract pattern, batch backfill, rollback plans for every migration type, zero-downtime strategies per database.
- **Adding connection pooling** — pool sizing formula, per-database configuration, query timeouts on every connection.
- **Shipping a 16-entry anti-patterns reference** — every anti-pattern linked to its rule number and ranked by impact.
- **Integrating with lyra-nodejs** (ORM patterns: Prisma, Drizzle, Knex) and **lyra-performance** (profiling workflow).

## Use when

Writing SQL, designing schemas, optimizing queries, managing transactions, writing migrations, configuring connection pools, reviewing database code, or debugging slow queries in PostgreSQL, MySQL, or SQLite. Block merges on CRITICAL violations.

## Don't use for

NoSQL databases (MongoDB, Redis, DynamoDB) — these are out of scope; treat them as complements to relational stores, not replacements. Columnar analytics databases (ClickHouse, BigQuery) — use a dedicated analytics skill. Database administration tasks (replication setup, backup configuration, server tuning) — this skill covers application-level database engineering, not ops.

## Rules at a glance

| Rule | Impact   | Summary                                  |
| ---- | -------- | ---------------------------------------- |
| 1    | HIGH     | Match database to workload               |
| 2    | CRITICAL | Normalize to 3NF, denormalize on purpose |
| 3    | CRITICAL | Enforce integrity at DB level            |
| 4    | CRITICAL | Every FK gets an index                   |
| 5    | HIGH     | Narrowest correct type                   |
| 6    | HIGH     | Unique constraint on natural keys        |
| 7    | MEDIUM   | CHECK over ENUM                          |
| 8    | HIGH     | No SELECT \*                             |
| 9    | CRITICAL | Always parameterize                      |
| 10   | CRITICAL | Eliminate N+1                            |
| 11   | CRITICAL | Run EXPLAIN before optimizing            |
| 12   | HIGH     | Covering indexes for hot queries         |
| 13   | HIGH     | No functions on indexed columns          |
| 14   | MEDIUM   | Keyset pagination                        |
| 15   | CRITICAL | Wrap multi-step writes in transaction    |
| 16   | HIGH     | Choose isolation level deliberately      |
| 17   | CRITICAL | No external calls in transactions        |
| 18   | CRITICAL | Expand-contract migrations               |
| 19   | CRITICAL | Every migration has rollback plan        |
| 20   | HIGH     | Never lock large tables                  |
| 21   | CRITICAL | Always use connection pools              |
| 22   | CRITICAL | Set query timeouts                       |

**12 CRITICAL rules. 8 HIGH rules. 2 MEDIUM rules. Zero room for "we'll fix it later."**

_Part of the [skill collection](../README.md) — council-synthesized skills that improve on their predecessors._