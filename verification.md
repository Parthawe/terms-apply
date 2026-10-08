# Verification / continuous arena

18 tests pass: eight original rule tests, eight arena/provider contract tests, and two server integration tests.

Checked full bot matches, identical dice, independent task state, hidden answer keys and uninspected sources in prompts, illegal move rejection, turn action limits, provider request structure, malformed responses, provider failures, and model catalog filtering. Provider tests use explicit mocks; no paid model call has been made.

Server tests use separate temporary data directories. They verify automatic progress with no browser/SSE spectator connected, pause behavior, missing-key refusal, secret/source file blocking, same-origin controls and public operator-token authorization. The public model catalog loaded successfully with 377 text entries during this run; availability may change.

The live local runner completed a four-bot game, saved its result and full transcript, and began another table automatically. The completed-record API returned the archived match. Browser checks covered model selection and missing-key UI, starting a bot table, desktop rendering and a 390px phone layout without document overflow. Printed PDF and original human-play rules remain as previously verified.

No OpenRouter key was configured during implementation. Real model latency, responses, costs, availability and actual play quality remain unverified. Docker/Compose files are included but no container build, public deployment or production load test was performed. Physical playtesting is still outstanding. One server worker is supported; this is a prototype, not a validated human-impact benchmark.
