# CampusPath AI

CampusPath AI is a working local MVP for helping Moroccan students explore study and career directions, then prepare a Morocco-to-France study application when relevant. The interface is available in French and Latin-script Darija. It combines an editorial orientation catalogue with roadmap-style steps, saved pistes, comparison, and a short transparent questionnaire before the admissions workspace.

It is an independent preparation tool, unaffiliated with Campus France. Matching categories are transparent heuristics, not admission probabilities. An audit reflects the information entered in this app; it does not certify eligibility or submit an application.

## Run locally

Requirements: Node.js 22 or newer, npm, and Python 3.11 or newer. Commands below start from this repository directory.

Install the dependencies once:

```powershell
npm ci
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Copy-Item .env.example .env
```

On macOS/Linux, use `python3 -m venv .venv`, `.venv/bin/python -m pip install -r backend/requirements.txt`, and `cp .env.example .env`.

Start the persistent local preview on Windows:

```powershell
.\scripts\start-dev.ps1
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The script starts a hidden background process and keeps logs under `backend/data/runtime/`. To stop this repository's preview:

```powershell
.\scripts\stop-dev.ps1
```

For a foreground session on any supported platform:

```sh
node scripts/start-dev.mjs
```

The portable launcher reads the root `.env` and starts Next.js on port 3000 and FastAPI on port 8000. Stop a foreground session with Ctrl+C. Keep these ports available; if the interface loads but its data does not, check the API at [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health).

You can also run the services in separate terminals: run `npm run dev` in the repository root, and run `../.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload` from `backend/` (Windows: `..\.venv\Scripts\python.exe`). For this manual method, set backend environment variables in the terminal; FastAPI does not load the root `.env` itself.

## Try the workflow

The default `DEMO_MODE=true` opens a fictional candidate dossier. The demo banner, program labels, and readiness state identify simulated data.

1. Review **Mon profil**, then upload and explicitly review a PDF, PNG, or JPEG in **Mes documents**.
2. Add academic years and grades. The diagnosis normalizes grade scales and coefficients, and identifies missing semesters, gaps, and overlaps.
3. Explore and compare program cards. Inspect each matching dimension, its data coverage, and unresolved claims before confirming a selection.
4. For an unresolved requirement, prepare a clarification message. Record your own external send and reply, then confirm a structured conclusion.
5. Confirm a study project and career project, generate a CV or motivation draft, and review it. Download plain text or use the browser print/PDF action. There is no dedicated server PDF layout engine yet.
6. Use the guided text interview, priorities, application tracking, and final audit to identify the next action.

Changing dossier information invalidates previous document approvals. Required evidence and unresolved critical questions cannot be dismissed simply by completing a task.

Registering an account creates an empty, non-demo dossier. It cannot read the fictional program catalog or use another candidate's documents. No real catalog is imported by default, and no catalog administration/import interface is included yet; a registered account therefore starts with no programs.

## Configuration and storage

| Setting | Local default / purpose |
| --- | --- |
| `DEMO_MODE` | `true`; enables demo creation, SQLite, local files, and HTTP development cookies. |
| `DATABASE_URL` | SQLite at `backend/data/campuspath.db` when unset. SQLAlchemy also supports PostgreSQL through `psycopg`. |
| `STORAGE_BACKEND` | `local`; uploads are stored in `backend/data/uploads/`. Set to `s3` to use the S3 adapter. |
| `API_INTERNAL_URL` | `http://127.0.0.1:8000`; server-side Next.js destination for `/api/*`. |
| `ALLOWED_ORIGINS` | Comma-separated exact origins allowed to make API mutations. Use your own frontend origin outside local development. |
| `S3_BUCKET`, `S3_ENDPOINT_URL` | Bucket and optional S3-compatible endpoint. Authentication uses boto3's standard server-side credential configuration. |

An optional PostgreSQL development service is provided:

```sh
docker compose up -d db
```

Uncomment the corresponding `DATABASE_URL` in `.env` and restart the launcher to use it:

```dotenv
DATABASE_URL=postgresql+psycopg://campuspath:campuspath_local_dev_only@127.0.0.1:5433/campuspath
```

These credentials and the Compose service are for local development only. PostgreSQL uses its own database; changing the URL does not migrate the SQLite data. PostgreSQL container execution has not been verified in the current environment.

Setting `DEMO_MODE=false` fails at startup unless PostgreSQL and S3 storage are configured. Session cookies then require HTTPS. This guard prevents silently falling back to demo storage; it is not a production readiness certification. Production still needs deployment configuration, database migrations, operational monitoring, backups and recovery, retention/deletion flows, distributed rate limiting, and an independent security review. Schema initialization currently uses SQLAlchemy `create_all`, not a migration system.

## Integration status

| Area | Implemented behavior and limit |
| --- | --- |
| Document extraction | Conservative text-PDF extraction can propose a labelled email from the first ten pages. Images and scanned PDFs require manual entry. No OCR service is connected; a proposal never verifies itself. |
| Drafting | CV and motivation content comes from deterministic templates and supplied candidate/program data. A typed OpenAI-compatible structured-output adapter exists, but routes do not initialize or call it. Adding an API key alone does not enable it. |
| Research | Source/status/date fields and manual clarification tracking are implemented. `ManualResearchProvider` explicitly reports that external research is not connected. There is no crawler or live admissions catalog. |
| Correspondence and applications | Approvals and external-event records are persisted. The app sends no email and performs no Campus France or institution submission. |
| Interview | A transparent text rubric offers prompts and feedback. There is no audio assessment or admission prediction. |
| Storage | Local SQLite/files are usable for development. PostgreSQL and S3 adapters are present; live service interoperability and deployment have not been certified. |

Morocco reference rules were researched on **2026-09-11** from official Campus France pages, with some direct pages returning HTTP 403. The app keeps the cycle unconfirmed and its deadline empty until reviewed. Reference examples include the [formation basket and motivations](https://www.maroc.campusfrance.org/3le-panier-de-formations-et-les-motivations), [connected institutions](https://www.maroc.campusfrance.org/les-etablissements-connectes-avec-campus-france), and [published cycle calendar](https://www.maroc.campusfrance.org/calendrier-de-la-procedure-de-candidature-20262027). These references do not validate the fictional demo institutions or programs. Recheck the applicable cycle, route, and candidate scope before real use.

## Verify changes

```sh
npm run lint
npm run typecheck
npm run build
npm test
```

From `backend/`, run the virtual environment's Python:

```sh
../.venv/bin/python -m pytest -q
../.venv/bin/python -m ruff check app tests
```

On Windows, replace `../.venv/bin/python` with `..\.venv\Scripts\python.exe`. `npm test` runs the same backend suite from the repository root. The backend suite has 59 passing tests covering domain rules, authorization, evidence review, revisions, validation, uploads, and workflow gates, including the complete reviewed-demo path to manual submission tracking. No automated browser test suite is included yet. See [verification results](docs/VERIFICATION.md) for the browser checks and integration limits.

## Repository map

```text
src/app/                 Next.js shell, hash navigation, global/responsive styles
src/components/          Dashboard, profile, documents, programs, workflow views
src/lib/                 API client, Zod snapshot schema, French/Darija strings
backend/app/main.py      FastAPI routes, sessions, ownership checks, mutations
backend/app/schemas.py   Pydantic contracts and invariant validation
backend/app/domain.py    Diagnosis, matching, priorities, completeness, audit
backend/app/database.py  SQLAlchemy tables and initialization
backend/app/storage.py   Local and S3 storage adapters
backend/app/ai.py        Conservative extraction, deterministic drafts, LLM boundary
backend/app/research.py  Manual research boundary
backend/app/seed.py      Fictional demonstration data and empty-account defaults
backend/tests/           Domain and API regression tests
scripts/                Local start/stop launchers
compose.yaml            Optional local PostgreSQL service
docs/ARCHITECTURE.md     Data flow, trust boundaries, and extension points
```

See [the architecture notes](docs/ARCHITECTURE.md) for implementation details and remaining integration work.
