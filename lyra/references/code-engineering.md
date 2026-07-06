# Code Engineering — Plan-First + TDD @ 100%

This reference holds the detailed methodology for Lyra's Code Engineering Mode. Read it before ANY code task. SKILL.md has the summary; this file has the mechanics.

## Table of contents

1. [The execution plan template](#the-execution-plan-template)
2. [The 100%-coverage TDD protocol](#the-100-coverage-tdd-protocol)
3. [Anti-dummy-test rules](#anti-dummy-test-rules)
4. [Multi-language & framework matrix](#multi-language--framework-matrix)
5. [Worked example: Red-Green-Refactor in TypeScript](#worked-example-red-green-refactor-in-typescript)
6. [When 100% is genuinely impossible](#when-100-is-genuinely-impossible)

---

## The execution plan template

Every code task — no exceptions — starts with a plan presented to the user for approval. Use this exact template:

```markdown
# Execution Plan: [task title]

## Goal

[1-2 sentences: what this delivers and why]

## Context

- Language: [e.g., TypeScript 5]
- Framework: [e.g., Next.js 16, NestJS, none]
- Existing code: [what's already there, what we're building on]
- Constraints: [performance, compatibility, dependencies]

## Steps (in execution order)

1. **[Step name]** — `path/to/file.ext`
   - What: [what this file/change does]
   - Tests: [what tests will be written first, what behavior they assert]
   - Dependencies: [none | step N]

2. **[Step name]** — `path/to/other-file.ext`
   - What: [...]
   - Tests: [...]
   - Dependencies: step 1

[...]

## Test strategy

- Framework: [Jest / Vitest / Pytest / Pest / Go test / etc.]
- Coverage target: 100% lines, branches, functions
- Test layers: [unit / integration / e2e — which, and why]

## Out of scope

- [explicitly list what we're NOT doing, to prevent scope creep]

## Risks

- [known risks, unknowns, things that might need a decision mid-flight]
```

Present the plan. **Wait for the user to approve or request changes.** Only after approval, proceed to Red-Green-Refactor.

### Plan sizing

- **Small task** (one function, one file): 2-3 steps. One paragraph each.
- **Medium task** (one feature, 2-5 files): 3-6 steps.
- **Large task** (multi-feature, architectural): 6-12 steps, grouped into phases.

Never skip the plan because the task is "small". A 2-step plan takes 30 seconds to write and prevents the most common failure: building the wrong thing fast.

---

## The 100%-coverage TDD protocol

### The cycle: Red → Green → Refactor

1. **Red** — Write a test that captures the next piece of required behavior. Run it. It must fail, and the failure must be meaningful (an assertion failure or a missing-function error — NOT a syntax error or import error).

2. **Green** — Write the minimum production code to make the test pass. No extra features, no speculative abstractions, no "while I'm here" additions. Just enough.

3. **Refactor** — Improve the code's structure without changing behavior. Tests stay green. Apply clean-code and clean-architecture principles here.

Repeat until the feature is complete. Then run coverage.

### Coverage tooling per language

| Language      | Tool                                  | Command                                                   |
| ------------- | ------------------------------------- | --------------------------------------------------------- |
| TypeScript/JS | Vitest / Jest + c8                    | `vitest run --coverage`                                   |
| Python        | Pytest + coverage.py                  | `pytest --cov=src --cov-report=term-missing --cov-branch` |
| PHP           | Pest / PHPUnit + Xdebug               | `php artisan test --coverage --min=100`                   |
| Go            | `go test -cover` + `go tool cover`    | `go test -coverprofile=cover.out ./...`                   |
| Rust          | `cargo tarpaulin` or `cargo llvm-cov` | `cargo tarpaulin --out html`                              |
| Java          | JaCoCo                                | `mvn test jacoco:report`                                  |
| C#            | Coverlet                              | `dotnet test --collect:"XPlat Code Coverage"`             |
| Ruby          | SimpleCov                             | `bundle exec rspec` (with SimpleCov in spec_helper)       |

### What "100% coverage" means here

- **100% lines** — every line of production code executes during tests.
- **100% branches** — every `if/else`, `match/case`, ternary — both sides execute.
- **100% functions** — every function/method is called at least once.

Line coverage alone is insufficient. A function with an untested `if` branch shows 100% line coverage but 50% branch coverage. Track all three.

---

## Anti-dummy-test rules

These are the failure modes that make TDD theater instead of TDD. Reject all of them.

### ❌ Dummy test #1: tautology

```typescript
// BAD — asserts nothing
test("addition works", () => {
  expect(1 + 1).toBe(2);
});
```

This tests the language, not your code. Delete it.

### ❌ Dummy test #2: expect(true)

```typescript
// BAD — always passes
test("function runs", () => {
  myFunction();
  expect(true).toBe(true);
});
```

This proves the function didn't throw. It proves nothing about correctness. Replace with assertions on the function's output.

### ❌ Dummy test #3: testing the mock

```typescript
// BAD — the mock always returns what you told it to
test("service returns data", () => {
  const mock = jest.fn().mockReturnValue({ id: 1 });
  expect(mock()).toEqual({ id: 1 });
});
```

You're testing that the mock returns what you configured it to return. Tautology. Mocks should verify _interactions_ (was the function called with the right args?) or isolate _real_ code from external dependencies — not be the subject of the assertion themselves.

### ❌ Dummy test #4: no assertions

```typescript
// BAD — no expect()
test('renders', () => {
  render(<Component />)
})
```

Add assertions: what should be on the screen? What text, what elements, what state?

### ❌ Dummy test #5: testing implementation, not behavior

```typescript
// BAD — locks in internal details that could change
test("uses a Map internally", () => {
  const cache = new Cache();
  expect((cache as any).store).toBeInstanceOf(Map);
});
```

Test the public behavior (does it cache? does it retrieve? does it evict?), not the private implementation. Implementation tests make refactoring impossible.

### ❌ Dummy test #6: catch-all try/catch

```typescript
// BAD — swallows real failures
test("works", () => {
  try {
    myFunction();
  } catch (e) {
    // ignore
  }
  expect(true).toBe(true);
});
```

If the function throws, you've hidden the bug. Let it throw. Assert on the success path and the error path separately and explicitly.

### ✅ What a real test looks like

```typescript
// GOOD — tests real behavior, meaningful assertions
test("calculateTotal applies 10% discount for orders over $100", () => {
  const order = { items: [{ price: 60, qty: 2 }] }; // total $120
  const result = calculateTotal(order);
  expect(result).toBe(108); // $120 - 10% = $108
  expect(result).not.toBe(120); // explicit guard against missing the discount
});

test("calculateTotal throws on negative price", () => {
  const order = { items: [{ price: -5, qty: 1 }] };
  expect(() => calculateTotal(order)).toThrow("price must be non-negative");
});
```

Each test has a clear name (describes behavior + condition + expected result), real setup, meaningful assertions, and tests both happy and error paths.

---

## Multi-language & framework matrix

For each stack, the plan + tests + code should use that stack's idioms. Quick reference:

| Stack                    | Test framework                   | Idioms                                                                                              |
| ------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| **TypeScript / Node.js** | Vitest or Jest                   | Strict types, `describe/it/expect`, mocks via `vi.fn()` or `jest.fn()`, ESM or CommonJS per project |
| **Next.js**              | Vitest + React Testing Library   | Server components can't use hooks — test client components; use `render()` + `screen` queries       |
| **React**                | React Testing Library            | Test behavior via accessible queries (`getByRole`, `getByLabelText`), not `getByTestId`             |
| **NestJS**               | Jest                             | Use the testing module: `Test.createTestingModule({ providers: [...] })`                            |
| **Python / FastAPI**     | Pytest + httpx                   | `TestClient` for endpoints, fixtures for setup, `parametrize` for data-driven tests                 |
| **Python / Django**      | Django TestCase or pytest-django | ORM fixtures, `Client` for views                                                                    |
| **PHP / Laravel**        | Pest or PHPUnit                  | `RefreshDatabase` trait, ` actingAs()` for auth, `Feature/` and `Unit/` dirs                        |
| **PHP / Symfony**        | PHPUnit                          | KernelTestCase for services, WebTestCase for controllers                                            |
| **Go**                   | standard `testing` + testify     | Table-driven tests: `tests := []struct{...}`, `t.Run(tt.name, ...)`                                 |
| **Rust**                 | `#[test]` + `#[cfg(test)]` mod   | `assert_eq!`, `assert!`, `should_panic` for error paths                                             |
| **Java / Spring**        | JUnit 5 + Mockito                | `@SpringBootTest`, `@MockBean`, `@WebMvcTest` for slice tests                                       |
| **C# / .NET**            | xUnit + Moq                      | `[Fact]`, `[Theory]`, `IClassFixture<>` for shared setup                                            |
| **Ruby / Rails**         | RSpec + FactoryBot               | `describe/context/it`, `expect(...).to`, request specs for endpoints                                |

---

## Worked example: Red-Green-Refactor in TypeScript

**Task:** A `formatPrice` function that takes cents (number) and returns a formatted USD string, with a 10% discount for orders over $100 (10000 cents).

### Plan (presented, approved)

1. `src/formatPrice.ts` — the function
2. `src/formatPrice.test.ts` — the tests (written first)
3. Coverage target: 100%

### Red — write the tests first

```typescript
// src/formatPrice.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats a simple price under $100 without discount", () => {
    expect(formatPrice(999)).toBe("$9.99");
  });

  it("applies 10% discount for prices over $100 (10000 cents)", () => {
    expect(formatPrice(10000)).toBe("$90.00"); // $100 - 10% = $90
    expect(formatPrice(20000)).toBe("$180.00"); // $200 - 10% = $180
  });

  it("does not apply discount at exactly $100 (boundary)", () => {
    expect(formatPrice(10000)).toBe("$90.00"); // OVER 100 -> discount
    expect(formatPrice(9999)).toBe("$99.99"); // under 100 -> no discount
  });

  it("throws on negative input", () => {
    expect(() => formatPrice(-1)).toThrow("cents must be non-negative");
  });

  it("throws on non-integer input", () => {
    expect(() => formatPrice(10.5)).toThrow("cents must be an integer");
  });

  it("formats zero correctly", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});
```

Run: tests fail because `formatPrice` doesn't exist. ✅ Meaningful failure.

### Green — minimum implementation

```typescript
// src/formatPrice.ts
export function formatPrice(cents: number): string {
  if (!Number.isInteger(cents)) throw new Error("cents must be an integer");
  if (cents < 0) throw new Error("cents must be non-negative");

  const threshold = 10000; // $100 in cents
  const discountRate = cents > threshold ? 0.9 : 1;
  const finalCents = Math.round(cents * discountRate);
  return `$${(finalCents / 100).toFixed(2)}`;
}
```

Run: all tests pass. ✅

### Refactor

The code is already clean. No refactor needed. (Refactor is optional per cycle — don't force it.)

### Verify coverage

```bash
vitest run --coverage
```

Output: `formatPrice.ts | 100% | 100% | 100% | 100%` (lines/branches/funcs/statements). ✅

---

## When 100% is genuinely impossible

Some code cannot be 100% covered. Examples:

- Language-level impossible branches (e.g., a TypeScript discriminated union where a case is provably unreachable but the compiler requires it).
- Defensive code guarding against impossible states (still cover if feasible).
- Integration with external systems that can't be fully simulated in CI.

**Protocol when 100% is impossible:**

1. Run coverage. Identify the uncovered lines/branches.
2. For each, write a test that _attempts_ to cover it.
3. If still uncovered, document inline:
   ```typescript
   // uncovered: this branch is unreachable because [reason].
   // Confirmed by [test name] which asserts the precondition holds.
   ```
4. Add a `COVERAGE.md` note in the PR explaining each gap and why it's accepted.
5. Coverage of everything else remains 100%. No "95% is close enough" — either it's 100% or every gap is explicitly justified.

The goal isn't the number 100. The goal is: **every line of production code is justified by a test that would fail without it.** 100% is the proxy; the real invariant is "no untested behavior ships."