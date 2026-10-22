# Refresha

A job application tracker. Log roles as you save and apply, move them through a pipeline of statuses, record follow-ups, and see what needs attention next.

## Repository

| Path | Contents |
| --- | --- |
| [`tracker-frontend/`](tracker-frontend) | The web client: React, TypeScript and Vite, deployed to Cloudflare Pages |

The web client talks to the Refresha API, a separate FastAPI service that is not in this repository. Its interactive documentation is served at `/docs` on the API.

## Quick start

```bash
cd tracker-frontend
npm install
cp .env.example .env
npm run dev
```

You need Node 20.19 or newer (22 recommended) and a running API. Setup, environment variables, project structure, how sessions and billing work, and deployment are all covered in the [web client README](tracker-frontend/README.md).
