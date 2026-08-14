# Job Application Tracker API

The Week 1–2 Python refresh project from the job search plan. It's deliberately not a throwaway exercise: this is the same tracker from the strategy doc's §03, except as a real API instead of a spreadsheet — so what you build here, you actually use for the next 8 weeks.

It's also the foundation for the Week 3–4 flagship AI/ML project: once this is solid, the plan is to add a `/applications/{id}/score` endpoint that does RAG-based fit scoring of a job description against your CV. Building that on top of a service you already understand deeply beats starting the AI project from a blank file.

Stack: FastAPI, SQLAlchemy 2.0 (async), Postgres via `asyncpg`, Pydantic v2. Tests run against in-memory SQLite so you don't need Postgres running just to test.

## Setup

```bash
cd ~/Documents/Work/Learning/FastAPI_Refresh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

docker compose up -d          # starts Postgres
uvicorn app.main:app --reload # tables auto-create on startup
```

Open http://127.0.0.1:8000/docs — that's a working, interactive API. Try creating an application from today's real job hunting through the Swagger UI before you do anything else.

Run tests any time with:

```bash
pytest
```

## What's already built

- Full CRUD on `/applications` — create, list (with `track` / `tier` / `status` filters), get, update, delete
- Async end to end: async SQLAlchemy session, async route handlers, `asyncpg` driver
- One reference test (`tests/test_applications.py::test_create_and_get_application`) showing the pattern: override `get_db`, hit the app through `httpx.AsyncClient`, assert on the response

## Exercises (day by day)

**Day 1** — Get it running. Log every real application you send today through the API instead of a spreadsheet.

**Day 2** — Implement `crud.get_stats` (stubbed with hints in `app/crud.py`) and wire up `GET /applications/stats`. This is the number your Friday review in the strategy doc actually needs: response rate by track. Group-by + a conditional count — a good, real async SQLAlchemy exercise.

**Day 3** — Fill in the three TODO tests in `tests/test_applications.py` — filtering, updates, and the 404 path. Chasing 100% coverage isn't the point; covering the paths that would actually break in production is.

**Day 4** — Swap `Base.metadata.create_all` for real Alembic migrations. `create_all` is fine for a toy project, not for something you'd put on a CV.

**Day 5** — Add simple API-key auth (a header check is enough) — your CV claims "authentication" work; make sure you can talk through a real implementation of it.

**Week 2** — Containerize with a `Dockerfile`, deploy to Fly.io or Render's free tier, and link the live API + repo from your portfolio site. A dead `localhost` project doesn't count as a portfolio piece; a live one with a Swagger UI you can pull up in an interview does.
