# Geo-blocking gateway

The production site must be served by the Cloudflare Worker in `worker/index.js`. The Worker runs before every HTML, JavaScript, CSS, image, and other static asset. It uses Cloudflare's country result for the visitor public IP and falls back to the free `https://ipwho.is/{ip}` API when the edge result is unavailable. Only `EG` is allowed while geo-blocking is enabled. Unknown countries and lookup failures are denied and redirected to Google.

Only the exact `/admin` document, its payload, APIs, and generated allowlist of required assets are exempt. Unknown `/admin/*` paths and non-admin Nuxt assets still pass through geo-blocking. Admin assets require a short-lived, signed, IP/browser-bound bootstrap cookie. The dashboard toggle is available only to a signed-in `superadmin` and updates a strongly consistent Durable Object; it is not stored in the browser.

## Required secrets

Configure these before deployment:

```powershell
npx wrangler login
npx wrangler secret put SESSION_SIGNING_SECRET
npx wrangler secret put DASHBOARD_ADMIN_PASSWORD
```

Use at least 32 random bytes for `SESSION_SIGNING_SECRET`. The geo-control API accepts a Firebase ID token and verifies its signature, project, issuer, expiry, and `role: "superadmin"` claim inside the Worker. `DASHBOARD_ADMIN_PASSWORD` remains required only by the legacy `/admin/api/session` endpoint; it is not used by the dashboard geo toggle.

For local development, copy `.dev.vars.example` to `.dev.vars`; `.dev.vars` is ignored by Git.

## Test, develop, and deploy

```powershell
npm run test:geo
npm run geo:dev
npm run geo:deploy
```

The free `ipwho.is` endpoint allows 1,000 fallback lookups per day. Results are cached for 24 hours using a SHA-256 digest of the IP; the raw IP is not persisted. Normal production traffic uses Cloudflare's edge country value and does not consume this API quota.

`firebase.json` deliberately publishes only `firebase-disabled/`, never `.output/public`, and redirects both Firebase Hosting aliases to the Worker while preserving the requested path. This prevents a Firebase deployment from exposing the application around the Worker. Do not change the Hosting `public` directory back to `.output/public`.

`workers_dev` is enabled, so a deployment produces a protected `workers.dev` URL. To use the existing public domain, connect that domain to this Worker in Cloudflare and ensure every domain alias is proxied. Do not leave another host serving `.output/public`. If a Worker Route is used in front of an origin, configure its limit-exceeded behavior as fail closed.
