# Refresha web client

The web app for Refresha, a job application tracker. Log roles as you save and apply, move them through a pipeline of nine statuses, record follow-ups, and see what needs attention next.

It is a single-page app that talks to the Refresha API. The API is a separate service and is not part of this repository.

## Features

- **Applications**: create, edit, delete; server-side pagination and status filtering; status changes and follow-ups recorded as a per-application history.
- **Job posting parser**: fill the create form from a link (free, no AI) or from pasted text. Paid plans parse with Refresha's AI; free accounts can bring their own Anthropic key, which is used directly from the browser and never sent to Refresha.
- **Home dashboard**: totals, a status pipeline, upcoming follow-ups and recently updated applications. Signed-out visitors see a landing page.
- **Accounts**: email and password, Google and LinkedIn sign-in, and guest accounts that can be claimed later by registering.
- **Profile**: name, settings (default follow-up interval, email digest, timezone), billing (plans, upgrade through hosted checkout, cancel and resume) and usage.
- **Pricing**: a public plans page, plus pages for returning from checkout (`/billing/success`, `/billing/cancelled`).
- **Account safety**: forgot and reset password and email verification (live), plus export or delete your data, which needs API endpoints that aren't there yet; see [docs/backlog.md](docs/backlog.md).
- **Notifications**: a bell, a full history page, in-app toasts and browser push.
- **Search and sharing**: each public page (home, pricing, privacy, terms, contact) and the sign-in pages get their own HTML file at build time with their own title, description and social tags, so link previews and crawlers that don't run JavaScript see them. Also writes `robots.txt` and a sitemap and ships a social-preview image. Per-page tags live in `src/constants/pageSeo.ts`. Set `VITE_SITE_URL` to turn on canonical links and the sitemap.
- **Cookies**: a banner (Choose / Essential only / Accept all) and a settings dialog with a toggle per kind of non-essential cookie; answers are kept in this browser for 12 months and the footer's "Cookie settings" reopens them. Categories are one list in `src/constants/cookies.ts`; add an entry and load the thing only once `isAllowed("<id>")` is true. Today there is one, **analytics**: the Google tag, loaded only when `VITE_GOOGLE_TAG_ID` is set and the visitor accepts, with a page view per route change (path only).
- **Legal and help**: privacy policy, terms of service and a contact page (shown when `VITE_SUPPORT_EMAIL` is set).
- Light and dark themes that follow the system setting, keyboard-accessible menus and forms, and route-level error and 404 pages.

Ideas that aren't built yet, and the API the client expects, are logged in [docs/backlog.md](docs/backlog.md).

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
  app/                app shell: App, router, layout (header, footer, banners, loading skeleton) and error pages
  features/           one folder per area of the product
    applications/     list, create, edit, history, status chips, form schemas
    auth/             session, sign-in, registration, password reset and email verification, route protection
    billing/          plans, entitlements, checkout, checkout return pages, cancel and resume
    home/             dashboard and landing page
    legal/            privacy policy, terms of service and the contact page
    notifications/    bell and history page, announcements, toasts, browser push
    parser/           job posting parser, including the bring-your-own-key client
    profile/          account, settings, billing and usage pages; export and delete account; developer tools
  shared/             components (button, panel, banner, alert, form fields, table, pagination, icons, loading/empty/error states, page meta tags) and libs (API client, formatting)
  styles/             design tokens (light and dark) and base styles
  assets/icons/       SVG icons, rendered through the Icon component
  constants/          nav links, site address and per-page SEO tags (plain data, also read by the build)
  types/  dev/
vite/                 build plugin that writes robots.txt, the sitemap and each public page's HTML head
public/               static files: favicons, social image, manifest, service worker
docs/                 backlog and the API the client expects
```

Each feature is split into `pages/`, `components/`, `hooks/` and `api/` where it needs them, with its schemas and helpers at the feature root.

**Shared components.** `shared/components/` holds only folders, one per component, named in lowercase (kebab-case for several words). Inside, the component file keeps its PascalCase name, next to its stylesheet and an `index.ts` that re-exports the one default export:

```
shared/components/
  button/
    Button.tsx
    button.scss
    index.ts          export { default } from "./Button";
```

Import the default through the folder: `import Button from "@/shared/components/button"`. Anything else (a named export such as `PanelTitle`, or another file in the folder) is imported by its full path: `import { PanelTitle } from "@/shared/components/panel/Panel"`. The `index.ts` never re-exports more than that default. Feature and app components are plain files in their own `components/` folders, with no barrels.

Use the shared components instead of repeating classes: `Button` (variants, sizes, links), `Panel` with `PanelTitle`, `PanelText` and `PanelActions`, `Banner`, `Alert`, `Field` and the form controls, `EmptyState`, `ErrorState` and `LoadingState`, and `ErrorPage`.

**Conventions**

- Dependencies point one way: `shared` imports from nothing else in the app (apart from static data in `assets`, `types` and `constants`), `features` import from `shared` and occasionally from each other, and `app` imports from both. A feature never imports from `app`; things the app shell owns are passed in (for example `AuthProvider` takes a `fallback`).
- Imports that cross a folder boundary use the `@/` alias; imports inside a feature are relative.
- Colours, spacing, radii and motion come from the CSS variables in `styles/tokens.scss`. Components do not hard-code values.
- Buttons and links that look like buttons are always the `Button` component, never a hand-written `btn` class.
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
