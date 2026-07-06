# lyra-e2e-testing

End-to-end testing discipline that keeps the browser layer thin: accessible locators over test IDs, auto-waiting over sleeps, per-test data over shared state, and sharding with merged reports over slow serial runs. 
Twelve rules covering scope, selectors, reliability, isolation, Page Objects, parallelism, and CI artifacts — each with a bad/good pair. Playwright-first, but the rules transfer to Cypress, Selenium, and WebdriverIO.

**Reach for it when:** writing, reviewing, or debugging browser tests; setting up Playwright; eliminating flakiness; wiring e2e into CI; or sharding a slow suite.

**Don't:** pure unit logic (use `lyra-tdd`), API contract testing (use `lyra-api-design`), load testing, or visual regression as the primary suite.

_Part of the [skill collection](../README.md)._