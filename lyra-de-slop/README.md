# lyra-de-slop

Removes AI-generation artifacts from code and prose without changing behavior: narration comments, `any` escape hatches, dead code, debug statements, defensive theater, single-caller abstractions, nesting pyramids — plus AI-register documentation ("comprehensive", emoji headers, changelog bullets restating the diff). Diff-scoped to your branch by default so the cleanup stays reviewable, with a mandatory typecheck + test verification after every sweep.

**Reach for it when:** tidying a branch after AI-assisted work, before opening a PR, or when docs read like a model wrote them.

**Don't:** behavioral bug fixing (`lyra-bug-hunter`), structural refactoring (`lyra-clean-code` / `lyra-clean-architecture`), or rewriting prose for voice and audience beyond artifact removal.

_Part of the [skill collection](../README.md)._
