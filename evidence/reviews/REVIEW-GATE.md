# Publication review gate

The user requires **two consecutive complete review runs with no mistakes found** before the initial publication.

## What counts as a run

1. Review every operation in each domain against the original bytecode: methods, paths, argument order, query/body construction, every named field/type/constant/optionality, client authentication, response transformations, and coverage.
2. Review added download/coverage operations and request-model enrichments, not only the initial function inventory.
3. Check generated TypeSpec/OpenAPI against the reviewed records: no extra named parameters/properties, no missing proved fields, preserved uncertainty, correct media types/security, no guessed success/error contracts.
4. Run deterministic generation, the full test suite, coverage validation, TypeSpec compilation, and both OpenAPI JSON/YAML emission.
5. Check publication files and the actual publication set for factual claims, workflow/artifact failures, secrets, private records, and excluded third-party inputs.

## Clean-run rule

- Any factual evidence correction, specification/model correction, newly incorporated operation/field, or build/publication fix resets the consecutive-clean count to zero.
- Do not make preference-only changes. Unknown server schemas and explicitly unresolved client payloads are not mistakes to fill with guesses.
- Review reports must identify the reviewed revision/snapshot and record operation/field counts and real findings, even when none.
- Earlier reports are retained as audit history; their findings must be explicitly resolved or excluded with evidence. A build pass alone does not count as an evidence review.
- Publication proceeds only after two clean full runs on unchanged specification inputs. The final summary must state the remaining unknowns honestly, not claim exhaustive server schemas.

Final status: **satisfied**. Rounds 3 and 4 were consecutive complete clean runs on frozen input digest `b4c599463abc3355ba8051a5c12b038bbd84fdfbeea2ba398f68325f0bf5efdd`, after correcting the two round-2 findings. The user-imposed four-round cap has been reached and review work has stopped. See `FINAL-REVIEW-STATUS.md` and the complete final reports for scope, hash continuity and explicit unknowns.
