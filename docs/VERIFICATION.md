# Verification — 2026-09-13

The delivered local MVP was verified on Windows, Node.js 24 and Python 3.12, with SQLite and local file storage. All profiles and uploads used for these checks were fictional.

## Independent re-verification (2026-09-13, Linux, Node.js 22, Python 3.12)

The full suite was re-run from a clean checkout on Linux: ESLint, TypeScript, production build, Ruff and the backend suite all passed. A separate black-box probe of the running Next.js/FastAPI pair (about 40 checks through the proxy on port 3000 and directly on port 8000) and a headless Chromium pass over the twelve views at 1366 px and 390 px confirmed the security and workflow behaviour described above. Two defects were found and fixed; see `docs/AUDIT-2026-09-13.md` for the complete record.

- Uploads between roughly 9.5 MiB and the 10 MiB limit failed with a generic HTTP 500 through the Next.js proxy, because Next.js 16 buffers proxied bodies up to 10 MB by default (`proxyClientMaxBodySize`). The limit is now raised to 12 MB in `next.config.ts`, so the FastAPI 413 message reaches the browser and files under the limit upload correctly.
- A JSON body containing a non-finite number (`NaN`) made the default request validation handler crash with HTTP 500 while echoing the raw body. `RequestValidationError` now shares the French 422 handler; a regression test was added (60 tests).

## Automated checks

| Check                                        | Result                                         |
| -------------------------------------------- | ---------------------------------------------- |
| ESLint (`npm run lint`)                      | Passed                                         |
| TypeScript (`npm run typecheck`)             | Passed                                         |
| Next.js production build (`npm run build`)   | Passed; root page and not-found page generated |
| Python Ruff (`python -m ruff check backend`) | Passed                                         |
| Backend domain and API suite (`npm test`)    | 59 passed                                      |

Two third-party deprecation warnings remain in Starlette's test client: its httpx integration and the AnyIO BlockingPortal alias. They do not fail the tests. These are dependency maintenance items.

The complete API scenario selects fictional program p2, reviews missing evidence, links the French level to a reviewed language document, fills transcript coverage, confirms a future test cycle, approves the narrative and current drafts, reaches `READY_DEMO`, then records an externally submitted application. No external application is sent.

Regression checks include weighted grades and missing data, invalid/NaN values, timeline inconsistencies, unknown and expired deadlines, unverified language evidence, cycle/category caps, unchangeable candidate-side procedure limits, private document access, session/origin enforcement, duplicate uploads, clarification transitions, and invalidation after source changes or withdrawal. A PDF extraction test confirms that upload and document review alone preserve the original profile; replacing an extracted field requires the separate import confirmation.

## Interactive browser review

The working Next.js/FastAPI preview was inspected with browser automation:

- Dashboard, profile, academic analysis, program search and comparison, explicit selection, and CV generation.
- Motivation generation remains gated when narrative/research/evidence is incomplete.
- Real file chooser upload of a small fictional PDF, detected-email proposal, current-versus-proposed comparison, and explicit document review.
- French/Darija switching, including generated audit blockers and next actions.
- Mobile audit at 390 × 844: no horizontal page overflow (document width 375 px, viewport 390 px); desktop dashboard also visually inspected.
- Read-only WebMCP readiness summary returns the current blockers; unexpected input keys are rejected.
- Local frontend returns HTTP 200 and `/api/health` reports version 0.1.0 and demo mode.

This is an interactive QA record, not a committed automated browser regression suite. Exhaustive accessibility, load, penetration, and cross-browser tests remain future work. Browser PDF export is offered but print-dialog output was not validated as a separate PDF artifact.

## Orientation space (2026-09-18)

The orientation catalogue, roadmap view and stylesheet were completed and checked:

- `npx tsc --noEmit` and `npx eslint src --max-warnings=0` are clean.
- `npx next build` (Next.js 16.3.5, Turbopack) compiles and prerenders the routes.
- Backend suite: 88 tests pass, including `tests/test_orientation.py` (auth, foreign-origin rejection, id normalisation, full-state persistence).
- Browser review of the running preview: catalogue, domain and level filters, empty search state, four-question questionnaire opening, roadmap detail structure, saved-roadmap controls, side-by-side comparison flow, and the node map with its branch fork and step inspector.
- The orientation questionnaire and guided interview let the student answer progressively or choose “Je ne sais pas encore”, “Je préfère ne pas répondre” or “Passer”; an unanswered orientation questionnaire returns to the full catalogue instead of an unexplained empty recommendation state.
- Dashboard and program views expose qualitative coherence categories with the supporting strength/risk or prerequisite text instead of presenting a raw compatibility score.
- The orientation page now uses an editorial vertical catalogue, structural separators, a functional “Par où commencer ?” panel, and semantic olive/completion states. It avoids decorative gradient/glow treatments and repeated icon-card grids.
- Loading, empty, save-failure, validation, long-text wrapping, and connection-recovery states are implemented. Mobile layout rules collapse the catalogue and roadmap inspector without requiring horizontal page scrolling; comparison tables retain intentional horizontal scrolling.
- Every `orient-*` class used by the view has a matching rule in `src/app/orientation.css`.

The catalogue holds eight roadmaps written in French and Moroccan darija. Durations and costs are deliberately qualitative, and each roadmap links to official portals (MESRSI, CursusSup, OFPPT/Takwine, ONOUSC, ANAPEC) reviewed on the date carried by `ORIENTATION_REVIEWED_AT`. Admission thresholds, dates and fees are not reproduced in the app, since they change every year and per institution.

## Integration limits

PostgreSQL configuration and the S3 adapter exist, but live service operation was not verified here; the Docker engine was unavailable. OCR, live admissions research/catalog ingestion, and a live LLM provider are not connected. Drafts use deterministic templates and the fixture programs are explicitly fictional. No public deployment was performed.

## Next priorities

1. Add an administrator-reviewed real catalog and cycle maintenance with official dated sources.
2. Validate PostgreSQL/S3 in staging, add migrations, backups, account recovery and deletion, observability, and security review.
3. Connect and evaluate OCR/structured generation while retaining source references and explicit candidate review.
4. Add automated browser regression coverage, accessibility testing, and a dedicated PDF exporter.
