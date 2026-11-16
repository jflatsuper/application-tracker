# Refresha extension

A Chrome extension for Refresha. **It is part of the Pro plan**: signed-out and
free accounts see a sign-in or upgrade screen and nothing else.

- **Save this page**: click the icon on a job posting, check the prefilled
  company, role and location, and save it as Saved or Applied.
- **Add jobs automatically when I apply**: when an application goes through on a
  supported job site, it is added as Applied, with a notification and **Undo**.

## Build and load

```bash
cp .env.example .env     # set the API and web app addresses
npm install
npm run build
```

Then open `chrome://extensions`, turn on **Developer mode**, choose **Load
unpacked** and pick the `dist/` folder. Rebuild and press the reload icon after
any change. The addresses are read when you build, so rebuild after editing
`.env`.

`npm test` runs the tests and `npm run typecheck` checks types.

## How it works

| Part | File | What it does |
| --- | --- | --- |
| Popup | `src/popup/` | Sign-in, the upgrade screen, the save form and the auto-add switch. |
| Page reader | `src/content/extract.ts` | Injected only when you click the icon (`activeTab`). Reads the posting. |
| Watcher | `src/content/watch.ts` | Injected only on allowed job sites while auto-add is on. |
| Worker | `src/background/index.ts` | Receives "application submitted", adds the job, shows notifications, registers the watcher. |
| API | `src/shared/api.ts` | The extension's own sign-in and tokens. |

**Reading a posting**: structured `JobPosting` data first (exact), then the page
headline, then the company named in the job board's address. Whatever can't be
found is left blank for you to fill in. "Read with AI" uses Refresha's parser.

**Spotting an application**: the watcher remembers the posting you're viewing
(in that tab's own storage, never sent anywhere). When a page shows confirmation
wording such as "your application was submitted", and either that posting was
seen or the address looks like a confirmation page, it tells the worker. The
worker adds the job, or moves a Saved twin to Applied, never creating a duplicate.
A job it can't fully read is added with a "check the details" note.

**Sites** (one list: `scripts/sites.mjs`): Greenhouse, Lever, Ashby, Workable.
Adding one means adding its address there. LinkedIn and Indeed are not included
yet and need their own care.

## The Pro gate

Every path checks the plan (`GET /v1/billing/entitlements`, `plan_code === "pro"`,
cached for 5 minutes):

- the popup shows the upgrade screen instead of anything usable;
- `trackJob` refuses with `ProRequiredError` before it touches applications, so
  the worker can't add anything for a free account;
- the watcher is registered only for Pro accounts, and is removed when the plan
  drops or you sign out.

This is a product gate in the client. The API itself does not restrict the
application endpoints to Pro (the web app uses them on every plan), so it is not
a security boundary. Enforcing it for real needs a server-side check.

## Sign-in and permissions

The extension tries these in order:

1. **Its own session**, if you've signed in with email or connected it manually
   (below). Tokens live in `chrome.storage`, independent of the website.
2. **Your website session.** If you're signed in on the Refresha website (with
   Google, LinkedIn or email), the browser sends that site's cookie when the
   extension asks the API for a token, and the extension borrows it. No login
   screen, and nothing long-lived is stored: only a short-lived access token.
   **Signing out of the website signs the extension out too**: the popup checks
   every time it opens, and the extension re-checks at least once a minute before
   it does anything. The popup shows no Sign out button in this mode.
   (The extension's own sign-in, from email or the manual connect, is separate
   and stays until you press Sign out in the popup.)
3. **Otherwise** the popup offers: sign in on the website (then "check again"),
   email and password, or **Connect it manually**.

Borrowing the website session was checked in Chrome with the API on `localhost`
(a request from the extension carried the cookie and got tokens back). Other
browsers and a production setup are not verified, which is why the other ways in
stay. In production the API must be on the same site as the web app (for example
`api.example.com` and `app.example.com`), as the web app already needs.

### Connecting manually (one-time setup)

The fallback for when the website session isn't picked up. The popup opens
`<web app>/extension/connect`, you press **Connect extension**, and the page
hands the session to the extension. The web app only hands a session to an
extension ID it was built to trust, and the extension only accepts it from the
web app's exact address.

1. In `tracker-extension/.env`, keep `VITE_EXTENSION_KEY` (it is in
   `.env.example`). It pins the extension's ID to `doanhgclbjgfkinmplmkiakhalmmbfll` on every machine.
2. In the **web app's** `.env`, set `VITE_EXTENSION_ID=doanhgclbjgfkinmplmkiakhalmmbfll` and rebuild it
   (`VITE_APP_URL` here must match the address the web app is served from).
3. For the Chrome Web Store, build without `VITE_EXTENSION_KEY`: the store
   assigns its own ID. Add that ID to the web app's list (comma-separated, so the
   development ID can stay).
- Permissions: `activeTab` and `scripting` (read the page you click on),
  `storage`, `notifications`, and access to the API. Access to the job sites is
  **optional** and requested only when you switch auto-add on.

## Before publishing

- The Chrome Web Store needs a developer account, screenshots and a privacy
  statement. The web app's privacy policy needs a short section on the extension
  (what is read, when, and that nothing is sent before you click or apply).
- The "submitted" detection is based on common confirmation wording and has been
  tested against sample pages, not live sites. Try it on a real Greenhouse,
  Lever, Ashby and Workable application and adjust `src/shared/submitted.ts` if
  a site words its confirmation differently.
