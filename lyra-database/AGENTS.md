# lyra-database

**Version 1.0.0** · Alexandru Miron · July 2026

> Note for agents maintaining this skill: this document mirrors `SKILL.md` rule-for-rule. If you change a rule here, change it there too — the two files are kept in sync by hand, not generated. The "When editing" fields call out the three merge-blocking rules (unparameterized SQL in rule 9, external calls inside transactions in rule 17, destructive migrations without rollback in rules 19–20) so reviewers know where to push back hard.

## Abstract

Database engineering rules for Postgres, MySQL, and SQLite — schema design, query construction, optimization, transactions, migrations, and connection pooling.
A handful of rules block merge because they cause data loss or outages; the rest is judgment. Cite the rule number, don't argue taste.

## Invariants

Three properties hold the rest of the skill up. If a change weakens any of them, stop and reconsider.

1. **Parameterized queries are non-negotiable.** No string concatenation, no "trusted input," no exceptions. SQL injection is a data-breach class bug, and the only defense that scales is to never build SQL from strings.
2. **Every multi-step write is a transaction.** If a logical operation spans multiple INSERTs or UPDATEs, they commit together or roll back together. Partial writes are how money disappears.
3. **Migrations use expand-contract.** Schema changes and code changes ship in separate deploys, with a backward-compatible expand phase before the contract phase. Never combine the two; never drop a column in the same release that stops using it.

## Rules

### 1. Match the database to the workload

**The rule:** Postgres for complex queries and rich types (JSONB, full-text). MySQL for read-heavy web workloads. SQLite for embedded, single-process, zero-config. Don't use Mongo or Redis as a primary transactional store.

**When editing:** if someone proposes Redis or Mongo as the source of truth for transactional data, ask where ACID lives. The answer should be a relational database.

**Test for violation:** is the primary store for read/write transactional data something other than Postgres, MySQL, or SQLite?

### 2. Normalize first, denormalize on purpose

**The rule:** 3NF by default. Denormalize only with measured evidence that a join is too slow. Snapshot data (unit_price on an order line) is a business decision, not laziness.

**When editing:** a denormalized column without a benchmark is a smell. Snapshot columns must have a reason tied to a real-world point-in-time value.

**Test for violation:** is there a duplicated column with no benchmark justifying it and no snapshot semantics?

### 3. Enforce integrity at the database level

**The rule:** every constraint the database can enforce, it must. Application validation is defense in depth, not the primary line. A constraint in app code is a constraint that one code path forgot.

**When editing:** if a PR adds validation in app code without an equivalent DB constraint, ask why the database isn't enforcing it.

**Test for violation:** can two concurrent writes produce an invalid state because no DB constraint blocks them?

### 4. Index every foreign key

**The rule:** Postgres and SQLite don't auto-index FKs. MySQL/InnoDB does, but with system-generated names that make `DROP INDEX` painful. An unindexed FK means every JOIN and CASCADE DELETE is a full table scan.

**When editing:** every `REFERENCES` clause should be followed by a `CREATE INDEX` in the same migration.

**Test for violation:** query `pg_indexes` (or equivalent) — is there an FK column with no index?

### 5. Use the narrowest correct type

**The rule:** `TIMESTAMPTZ` for timestamps (never strings), `DECIMAL` for money (never `FLOAT`), `BOOLEAN` for flags (never `INT`). Wider types waste disk, RAM, and bloat every index.

**When editing:** any new column starts at the narrowest viable type and widens only with a reason.

**Test for violation:** is there a `FLOAT` storing money, a string storing a timestamp, or an `INT` storing a boolean?

### 6. Unique constraint on every natural key

**The rule:** if a column uniquely identifies a row in the real world, it gets `UNIQUE` even when a surrogate `id` is the primary key. App-level duplicate checks are race conditions.

**When editing:** when you see a "find or create" pattern in app code, check whether the natural key has a `UNIQUE` constraint backing it.

**Test for violation:** is there a business-unique column without a `UNIQUE` constraint?

### 7. Prefer CHECK over ENUM for mutable value sets

**The rule:** ENUMs require a migration to add or remove a value. CHECK constraints are a one-line `ALTER TABLE`. Use ENUM only for truly closed sets in a mature domain.

**When editing:** new ENUM usage should come with a written argument for why the set is closed. Default to CHECK.

**Test for violation:** is there an ENUM that has been altered in the last year, or could plausibly grow?

### 8. Never SELECT \* in production code

**The rule:** name every column. `SELECT *` fetches columns you don't need, breaks when schema changes, and prevents covering index scans.

**When editing:** production queries list columns explicitly. Ad-hoc exploration is the only acceptable use of `*`.

**Test for violation:** grep the codebase for `SELECT *` outside of tests and migrations.

### 9. Always parameterize — no string concatenation

**The rule:** string concatenation in SQL is injection. No exceptions, no "trusted input."

**When editing:** this is merge-blocking. Any PR that builds SQL by concatenating values, even from "internal" callers, is rejected. Parameterized placeholders only.

**Test for violation:** does the query string contain a value interpolated from a variable rather than a placeholder?

### 10. Eliminate N+1 queries

**The rule:** one query inside a loop is an N+1. Use a JOIN, a batch query, or ORM eager loading.

**When editing:** when you see `await` inside a `for` loop hitting the database, refactor to a single batched query.

**Test for violation:** count DB calls as a function of input size — does it grow linearly when it could be constant?

### 11. Run EXPLAIN before optimizing

**The rule:** never guess at query performance. Read the plan. `Seq Scan` on a large table means add an index. Stale row estimates mean run `ANALYZE`.

**When editing:** a PR that adds an index should cite the EXPLAIN plan that motivated it. A PR that "optimizes" a query should show the before and after plan.

**Test for violation:** is there an index added without a query plan justifying it?

### 12. Design covering indexes for hot queries

**The rule:** a covering index includes every column the query needs, so the database answers from the index alone. Highest-leverage optimization for read-heavy workloads.

**When editing:** for queries that show up in the slow log, ask whether the index could cover them entirely.

**Test for violation:** is there a hot query whose columns could fit in a covering index but currently heap-fetches?

### 13. Never wrap indexed columns in functions

**The rule:** a function on an indexed column makes the index unusable. Rewrite as a sargable range query.

**When editing:** when you see `WHERE f(col) = x`, ask whether it can be rewritten as `WHERE col <op> g(x)`.

**Test for violation:** grep for function calls wrapping column names inside `WHERE` clauses.

### 14. Use keyset pagination for deep pages

**The rule:** `OFFSET 100000 LIMIT 20` scans 100,020 rows. Keyset pagination seeks directly to the last-seen value — O(1) regardless of depth.

**When editing:** OFFSET/LIMIT is fine for shallow UI paging but breaks past a few thousand rows. Switch to keyset for any API that could page deep.

**Test for violation:** is there a paginated endpoint using OFFSET that could be called repeatedly past page 100?

### 15. Wrap every multi-step write in a transaction

**The rule:** if a logical operation requires multiple INSERTs or UPDATEs, they either all succeed or all fail. No partial writes.

**When editing:** every multi-statement write path opens a transaction and commits or rolls back as a unit.

**Test for violation:** can a crash between two writes leave the database in an inconsistent state?

### 16. Choose isolation level deliberately

**The rule:** the default is a decision someone else made. For money movement, use `SERIALIZABLE` and retry on conflict. Acquire locks in a consistent order to minimize deadlocks.

**When editing:** when a transaction touches financial state, confirm the isolation level is explicit and the code retries on serialization failure.

**Test for violation:** is there a money-moving transaction at the default isolation level with no retry logic?

### 17. Keep external calls out of transactions

**The rule:** a transaction holds locks and a pool connection. An HTTP call that hangs for 30s exhausts the pool and takes the service down with it. Charge first, then open the transaction and write.

**When editing:** this is merge-blocking. Any HTTP, RPC, or filesystem call inside a `BEGIN`/`COMMIT` block is rejected. Reorder so the external call happens before the transaction opens.

**Test for violation:** is there a network or filesystem call between `BEGIN` and `COMMIT`?

### 18. Use expand-contract for schema changes

**The rule:** never combine a schema change and a code change in one deploy. Expand first (backward-compatible), deploy code that uses it, then contract in a later release.

**When editing:** a migration that adds a column and immediately changes app behavior to depend on it is a smell. The expand migration and the code that uses it ship separately.

**Test for violation:** does a single deploy both change the schema and change the code that relies on the new shape?

### 19. Every migration ships with a rollback plan

**The rule:** if you can't describe the rollback in one sentence, you're not ready to deploy. Never drop a column in the same deploy that stops using it — wait one release cycle.

**When editing:** this is merge-blocking for destructive migrations. A `DROP COLUMN` or `DROP TABLE` without a documented, tested rollback is rejected. Forward-only is acceptable only with an explicit acknowledgment.

**Test for violation:** is there a destructive migration with no rollback procedure written down?

### 20. Never lock a large table during migration

**The rule:** table rewrites block all writes. For tables over ~1M rows, use zero-downtime strategies: Postgres 11+ adds columns with defaults instantly; MySQL needs `pt-online-schema-change` or `gh-ost`; SQLite requires a 12-step table rebuild.

**When editing:** any migration touching a table over a million rows needs a documented zero-downtime strategy, not a plain `ALTER TABLE`.

**Test for violation:** does the migration plan acknowledge the table size and the chosen strategy?

### 21. Always use a connection pool

**The rule:** opening a connection per query is 10–100x slower than reusing pooled ones. Size the pool to the database, not the app. Postgres formula: `pool_size = (cores * 2) + spindles`. Use PgBouncer for many app instances.

**When editing:** every code path that talks to the database goes through the pool. Direct `connect()` calls outside the pool are rejected.

**Test for violation:** is there a code path that opens its own database connection instead of using the pool?

### 22. Set query timeouts on every connection

**The rule:** a query that runs forever holds a connection, blocks locks, and cascades failures. Set a timeout at the connection level so even a forgotten app-level timeout is protected.

**When editing:** every pooled connection is configured with a `statement_timeout` (or equivalent) at checkout. The default "no timeout" is a bug.

**Test for violation:** can a query run indefinitely without being killed by the database?

## Maintenance notes

- The rules mirror `SKILL.md` one-to-one. If you renumber or reword a rule, update both files in the same commit.
- The three merge-blocking rules (9, 17, 19) are the spine of the skill — they're what a reviewer should fall back to when a PR gets adversarial. Don't soften them.
- The quick reference table in `SKILL.md` is the only place Postgres/MySQL/SQLite dialect differences are spelled out; this file stays dialect-neutral.
- Examples live in `SKILL.md`, not here. If a rule needs a new example, add it there and reference it by rule number from here if needed.
- When the underlying databases change behavior (a new Postgres release making an instant-ADD-COLUMN faster, for example), update rule 20 and its "When editing" note rather than adding a new rule.