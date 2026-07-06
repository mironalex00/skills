# lyra-tdd

lyra-tdd is a language-agnostic TDD skill with a coverage gate that actually catches dummy tests. Use it when writing new code, fixing bugs test-first, or enforcing coverage thresholds across TypeScript, JavaScript, Python, PHP, Go, Rust, Java, C#, and Ruby. It bakes in three things most TDD skills leave as advice: plan-first, 100% branch coverage as a merge gate, and seven anti-dummy-test rules. 
Where laravel-tdd is excellent but Laravel-only, lyra-tdd is portable — and it treats `expect(true)`, tautology tests, and mock-the-mock as bugs, not style nits.

**Reach for it when:** you're writing tests, doing TDD, or enforcing coverage in any of the nine supported languages.

**Don't:** throwaway spikes, pure UI layout, one-off scripts.

_Part of the [skill collection](../README.md)._