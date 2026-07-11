# lyra-security-appsec

Application security as coding rules built on one model: every vulnerability is a source-to-sink path missing a barrier. Boundary validation (canonicalize-then-validate, allowlists), parameterized sinks for SQL/shell/path/HTML/templates, deny-by-default object-level authorization, solved-problem auth (argon2id, session rotation, JWT algorithm allowlists), SSRF and upload defenses, fail-closed errors, security headers and rate limits, boring crypto — and a review methodology that walks the paths and ranks findings by exploitability × impact.

**Reach for it when:** writing code that touches user input, auth, sessions, files, or money; reviewing a PR for security; triaging a reported vulnerability; or designing an API's defensive posture.

**Don't:** secrets storage and rotation (`lyra-security-secrets`), dependency/build integrity (`lyra-security-supply-chain`), container runtime hardening (`lyra-security-containers`), or general bug hunting (`lyra-bug-hunter`).

_Part of the [skill collection](../README.md)._
