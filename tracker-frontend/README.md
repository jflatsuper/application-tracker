# Refresha web client

The web app for Refresha, a job application tracker. Log roles as you save and apply, move them through a pipeline of nine statuses, record follow-ups, and see what needs attention next.

It is a single-page app that talks to the Refresha API. The API is a separate service and is not part of this repository.

## Features

- **Applications**: create, edit, delete; server-side pagination and status filtering; status changes and follow-ups recorded as a per-application history.
- **Job posting parser**: fill the create form from a link (free, no AI) or from pasted text. Paid plans parse with Refresha's AI; free accounts can bring their own Anthropic key, which is used directly from the browser and never sent to Refresha.
- **Home dashboard**: totals, a status pipeline, upcoming follow-ups and recently updated applications. Signed-out visitors see a landing page.
- **Accounts**: email and password, Google and LinkedIn sign-in, and guest accounts that can be claimed later by registering.
- **Profile**: name, settings (default follow-up interval, email digest, timezone), billing (plans, upgrade through hosted checkout, cancel and resume) and usage.
- **Pricing**: a public plans page.
- Light and dark themes that follow the system setting, keyboard-accessible menus and forms, and route-level error and 404 pages.

## Stack

React 19 · TypeScript · Vite 8 (with the React Compiler) · React Router 8 (data router) · TanStack Query 5 · React Hook Form + Zod 4 · Sass · react-toastify · deployed on Cloudflare Pages.

## Getting started

**Prerequisites:** Node `^20.19` or `>=22.12` (`.nvmrc` pins 22) and a running Refresha API.

```bash
npm install
cp .env.example .env     # then edit VITE_API_BASE_URL if your API is not on localhost:8000
npm run dev
```

The app and the API must be opened on the **same host name** in development: use `localhost` for both, or `127.0.0.1` for both. The sign-in cookie is not shared between the two, and Google and LinkedIn sign-in only work on `localhost`.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Base URL of the API including the `/api` prefix and no trailing slash, e.g. `http://localhost:8000/api`. Read at **build time**, so changing it needs a rebuild. |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run typecheck` | Type-check only |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |
| `npm run cf:preview` | Build and serve with Cloudflare Pages' local runtime |
| `npm run deploy` | Build and upload to Cloudflare Pages with Wrangler |

## Project structure

```
src/
  main.tsx            entry point
  app/                app shell: App, router, layout (header, guest banner), error pages
  features/           one folder per area of the product
    applications/     list, create, edit, history, status chips, form schemas
    auth/             session, sign-in and registration pages, route protection
    billing/          plans, entitlements, checkout, cancel and resume
    home/             dashboard and landing page
    parser/           job posting parser, including the bring-your-own-key client
    profile/          account, settings, billing and usage pages; developer tools
  shared/             components (forms, table, pagination, icons) and libs (API client, formatting)
  styles/             design tokens (light and dark) and base styles
  assets/icons/       SVG icons, rendered through the Icon component
  constants/  types/  dev/
```

Each feature is split into `pages/`, `components/`, `hooks/` and `api/` where it needs them, with its schemas and helpers at the feature root.

**Conventions**

- Dependencies point one way: `shared` imports from nothing else in the app, `features` import from `shared` and occasionally from each other, and `app` imports from both.
- Imports that cross a folder boundary use the `@/` alias; imports inside a feature are relative.
- Colours, spacing, radii and motion come from the CSS variables in `styles/tokens.scss`. Components do not hard-code values.
- Add an icon by dropping an SVG into `assets/icons/` and registering it in `assets/icons/index.ts`.

## How it talks to the API

- Every request goes through `shared/libs/apiClient.ts`, which sends credentials and the bearer token and raises an `ApiError` with the status and the server's `detail`.
- **Sessions.** The access token is kept in memory only. The refresh token is an httpOnly cookie set by the API. A `has_session` flag in `localStorage` tells the app whether to try refreshing on load. A 401 triggers one shared refresh and a single retry; if that fails the user is signed out.
- **Sign-in with Google or LinkedIn** redirects to the API and returns to `/auth/complete`, which trades the cookie for an access token.
- **Guests** are created only when the user chooses "Continue as guest". Registering while a guest keeps their applications.
- **Pagination.** The applications list requests one page at a time (`limit` and `offset`). The home screen loads all applications, up to 1,000, to compute its totals.
- **Billing.** Upgrading opens the provider's hosted checkout. Cancel and resume return immediately and take effect when the provider's webhook arrives, so the app shows the new state and polls briefly until the API agrees.
- **Bring your own key.** The app fetches the current prompt, schema and model from the API, then calls `api.anthropic.com` directly. The key is stored per user in `sessionStorage`, or in `localStorage` if the user chooses "Remember on this device", and is only ever sent to Anthropic.

## Deployment

The site is a static build served by Cloudflare Pages, deployed from Git.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `tracker-frontend` |
| Build variable | `VITE_API_BASE_URL` |

- `wrangler.jsonc` sets the Pages output directory. There is deliberately no `404.html`: without one Pages serves `index.html` for unknown paths and React Router handles them.
- `public/_headers` sets security headers and long-term caching for hashed assets.
- Serve the app and the API from the **same parent domain**, for example `app.example.com` and `api.example.com`. The refresh cookie is `SameSite`, so a different site will not receive it. Preview deployments on `*.pages.dev` are different sites, so sign-in does not work on them.
- The API must allow the app's origin in its CORS settings, set the cookie `Secure`, and have the production redirect URLs registered with Google and LinkedIn.

## Development tools

In development only, **Profile → Developer** can add sample applications (60 at once, or 10 with full histories) to the signed-in account and remove them again. These pages and their code are not part of the production build.

## Known limitations

- There are no automated tests yet.
- The API has no sort parameter, so the applications list cannot be sorted.
- Updating payment details is not available in the app; there is no customer portal endpoint.
- No Content-Security-Policy is set. It would need to name the API origin, which differs per environment.
