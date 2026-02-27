# Mission Control Frontend (`frontend/`)

This package is the **Next.js** web UI for OpenClaw Mission Control.

- API calls are proxied through the Next.js server (`/api/v1/*` → backend), so the browser only needs to reach the frontend.
- Uses **React Query** for data fetching.
- Supports two auth modes:
  - **local** shared bearer token mode (self-host default)
  - **clerk** mode

## Prerequisites

- Node.js (recommend **18+**) and npm
- Backend running locally (see `../backend/README.md` if present) **or** run the stack via Docker Compose from repo root.

## Local development

From `frontend/`:

```bash
npm install

# set env vars (see below)
cp .env.example .env.local

npm run dev
```

Open http://localhost:3000.

### LAN development

To bind Next dev server to all interfaces:

```bash
npm run dev:lan
```

## Environment variables

All frontend configuration is **runtime** — no rebuild needed to switch settings.
The frontend reads configuration from standard Next.js env files (`.env.local`, `.env`, etc.).

### `BACKEND_URL`

URL the Next.js server uses to proxy API requests to the backend (server-to-server, not exposed to the browser).

- Default: `http://localhost:8000`
- Set via container environment in Docker (see `compose.yml`).

Example:

```env
BACKEND_URL=http://localhost:8000
```

### Authentication mode

Set `AUTH_MODE` to one of:

- `local` (default for self-host)
- `clerk`

For `local` mode:

- users enter the token in the local login screen
- requests use that token as `Authorization: Bearer ...`

For `clerk` mode, configure:

- `CLERK_PUBLISHABLE_KEY`
- optional `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- optional `CLERK_AFTER_SIGN_OUT_URL`

## How the frontend talks to the backend

### API proxy

The Next.js server proxies all `/api/v1/*` requests to the backend at `BACKEND_URL` (read at runtime). The browser never talks to the backend directly.

### Generated API client (Orval + React Query)

We generate a typed client from the backend OpenAPI schema using **Orval**:

- Config: `orval.config.ts`
- Output: `src/api/generated/*`
- Script: `npm run api:gen`

By default, Orval reads:

- `ORVAL_INPUT` (if set), otherwise
- `http://127.0.0.1:8000/openapi.json`

Example:

```bash
# from frontend/
ORVAL_INPUT=http://localhost:8000/openapi.json npm run api:gen
```

### Auth header / Clerk token injection

All Orval-generated requests go through the custom mutator (`src/api/mutator.ts`).
It will:

- set `Content-Type: application/json` when there is a body and you didn't specify a content type
- add `Authorization: Bearer <token>` automatically from local mode token or Clerk session
- parse errors into an `ApiError` with status + parsed response body

## Mobile / responsive UI validation

When changing UI intended to be mobile-ready, validate in Chrome (or similar) using the device toolbar at common widths (e.g. **320px**, **375px**, **768px**).

Quick checklist:

- No horizontal scroll
- Primary actions reachable without precision taps
- Focus rings visible when tabbing
- Modals/popovers not clipped

## Common commands

From `frontend/`:

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run the built app
npm run lint       # eslint
npm run test       # vitest (with coverage)
npm run test:watch # watch mode
npm run api:gen    # regenerate typed API client via Orval
```

## Docker

There is a `frontend/Dockerfile` used by the root `compose.yml`.

All configuration is runtime — the same Docker image works for both `local` and `clerk` auth modes. Set `AUTH_MODE`, `BACKEND_URL`, `CLERK_PUBLISHABLE_KEY`, etc. via container environment variables.

If you're working on self-hosting, prefer running compose from the repo root so the backend/db are aligned with the documented ports/env.

## Troubleshooting

### Frontend loads, but API calls fail (CORS / network errors)

- Confirm backend is up: http://localhost:8000/healthz
- Check the `BACKEND_URL` env var on the frontend container/process points to the correct backend host/port.
- In Docker, `BACKEND_URL` should use the Docker service name (e.g. `http://backend:8000`).

### Wrong auth mode UI

- Ensure `AUTH_MODE` matches on both backend and frontend.
- For local mode, set `AUTH_MODE=local`.
- For Clerk mode, set `AUTH_MODE=clerk` and a real Clerk publishable key via `CLERK_PUBLISHABLE_KEY`.

### Dev server blocked by origin restrictions

`next.config.ts` sets `allowedDevOrigins` for dev proxy safety.

If you see repeated proxy errors (often `ECONNRESET`), make sure your dev server hostname and browser URL match (e.g. `localhost` vs `127.0.0.1`), and that your origin is included in `allowedDevOrigins`.

Notes:

- Local dev should work via `http://localhost:3000` and `http://127.0.0.1:3000`.
- LAN dev should work via the configured LAN IP (e.g. `http://192.168.1.101:3000`) **only** if you bind the dev server to all interfaces (`npm run dev:lan`).
- If you bind Next to `127.0.0.1` only, remote LAN clients won't connect.
