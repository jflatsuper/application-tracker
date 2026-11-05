# Backlog and backend needs

A running log of ideas that aren't built yet, and of what the web client expects
from the API. Keep it current: move things out when they ship, add things when
they come up.

## Nice to have

Not started. Roughly in the order they'd be worth doing.

| Idea | Notes |
| --- | --- |
| Notification preferences per type | Today there is one on/off for browser push. A list (follow-up reminders, digests, billing notices) needs a settings field per type on the API. |
| Import and export applications as CSV | Export is already covered by "Export your data" (JSON). CSV is for spreadsheets. Import needs a bulk-create endpoint. |
| Calendar / follow-up view | A month view of follow-up dates. `follow_up_at` is already on applications, so this can be built from the existing list endpoint. |
| Changelog / "what's new" page | A static page, or driven by announcements. |
| Offline and connection-lost page | There is a 404 page; there is no offline handling. |
| Public landing or status page | Marketing page, separate from the signed-in home. |
| Stronger delete confirmation for paid plans | Block, or warn with the plan name, when a subscription is active. Needs entitlements to be checked first. |

## Backend the web client already calls (ships with pages built)

These pages are built and wired up, but the API has no matching endpoints yet
(forgot and reset password and email verification are the exception, see above).
Until it does, each screen shows "This isn't available right now" (it treats a
404, 405 or 501 as "not available" rather than a user error). The shapes below
are what the client sends and expects; change them here and in
`features/auth/api/authApi.ts` together.

### Forgot and reset password (live)

Built against the real API and tested with it.

| Call | Body | Response |
| --- | --- | --- |
| `POST /v1/auth/forgot-password` | `{ "email": string }` | `202`, always, whether or not the address has an account. `422` for an address the server rejects (such as a `.test` domain). |
| `POST /v1/auth/reset-password` | `{ "token": string (20 to 128 chars), "password": string (8 to 128 chars) }` | `200` with the same session as login (`user` and `tokens`), so the user is signed in straight away. `400` for an invalid or expired token. |

The reset email links to `<web app>/reset-password#token=<token>`. The token is in
the fragment, so it never reaches a server log; a `?token=` query is still
accepted. Invalid tokens take a few seconds to answer because the server hashes
the new password first.

### Email verification (live)

| Call | Body | Response |
| --- | --- | --- |
| `POST /v1/auth/email/verify` | `{ "token": string (20 to 128 chars) }` | `204`. `422` for a token of the wrong length. |
| `POST /v1/auth/email/resend` | none (signed in as a registered user) | `204`, whether or not anything was sent. `401` for a guest. |

The email links to `<web app>/verify-email#token=<token>`, the same shape as the
reset link (`?token=` also works). Tokens are single use. The client doesn't send
a token of the wrong length, and only offers "send a new link" to registered users.

`UserRead` carries `email_verified_at` (a date, or `null` until confirmed). The app
uses it for a banner asking registered users to confirm their address (with a
"Resend email" button), for an "Email status" row on the Account page, and
refreshes it after a successful verification so the banner goes away. Guests and
accounts without an email are never asked.

### Export and delete account

| Call | Success | Errors |
| --- | --- | --- |
| `GET /v1/users/me/export` | `200` JSON with the user's profile, settings, applications and their history; saved as a file by the browser | `429` |
| `DELETE /v1/users/me` | `204`; removes the account and its data, and should end the session | `409` if something must happen first (such as an active subscription), `429` |

### Checkout return pages

The web app has two pages for the payment provider to send people back to.
Configure the checkout session's return URLs as:

- Success: **`<web app>/billing/success`**
- Cancelled: **`<web app>/billing/cancelled`**

The success page doesn't trust the redirect. It checks `GET /v1/billing/entitlements`
every 3 seconds (for up to 30 seconds) until the status is `active` or `trialing`,
because the provider's webhook can arrive after the redirect.

### 429 responses

For any rate-limited response the client shows "Try again in N seconds" from the
`Retry-After` header. A cross-origin API must list it in
`Access-Control-Expose-Headers`, or browsers hide it and the client falls back
to "Wait a moment".
