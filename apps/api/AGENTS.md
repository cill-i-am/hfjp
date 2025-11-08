# AGENTS – API

Guidance for agents touching `apps/api` (`@hfjp/api`), the Cloudflare Worker API built with Hono.

## Scope & Layout
- Entry worker: `apps/api/src/index.ts` (export a default `Hono` instance).
- Config touchpoints: `wrangler.jsonc` (bindings, deploy target), `vite.config.ts` (dev server + Cloudflare plugin), `tsconfig.json` (Bundler module resolution, JSX for `hono/jsx`).
- Assets live under `public/` and are served via Vite; `dist/`, `.wrangler/`, `.turbo/` are generated.

## Commands (pnpm only)
- `pnpm -C apps/api dev` – Vite + Wrangler dev. Vite UI proxy runs on `http://localhost:3001`, the Worker itself is reachable on `http://localhost:8787`.
- `pnpm -C apps/api build` – Production bundle in `dist/`.
- `pnpm -C apps/api preview` – Serves the last build via Wrangler.
- `pnpm -C apps/api deploy` – Builds then `wrangler deploy`.
- `pnpm -C apps/api cf-typegen` – Regenerate `CloudflareBindings` after editing `wrangler.jsonc`.
- Clean: `pnpm -C apps/api clean` (rimraf bundle + caches).

## Coding Guidelines
- TypeScript + ESM only (`"type": "module"`). Target modern Workers (`lib: ["ESNext"]`, `moduleResolution: "Bundler"`).
- Use Web Platform APIs (Request, Response, fetch, URL, crypto.subtle). `compatibility_flags: ["nodejs_compat"]` exists but avoid Node-only modules (`fs`, `path`, `net`) to keep deployments edge-safe.
- Prefer small, composable handlers. Validate inputs and return via `c.json`, `c.text`, or explicit `Response`.
- Named exports for helpers; keep default export for the Hono app instance in `src/index.ts`.
- Formatting: Prettier 3 via `pnpm format` at repo root before committing.

## Routes & Structure
- Quick endpoints: extend the `app` instance in `src/index.ts`.
- Larger features: create files under `src/routes/*` and mount with `app.route("/prefix", router)`.
- Shared utilities live in `src/lib/*` (create if needed) to avoid bloating the entry file.

## Environment Bindings
- Declare KV/D1/Queues in `wrangler.jsonc`, then run `pnpm -C apps/api cf-typegen` so `CloudflareBindings` stays in sync.
- Type handlers with `const app = new Hono<{ Bindings: CloudflareBindings }>()` to get typed access via `c.env`.
- Never commit secrets; use Wrangler secrets (`wrangler secret put`) outside this repo.

## Observability & Debugging
- Local logs come from the dev server terminal; for deployed workers use `pnpm -C apps/api wrangler tail --format pretty`.
- `wrangler.jsonc` already enables observability + traces; keep the sampling fields intact unless you coordinate with ops.

## Deployment Checklist
- `pnpm -C apps/api build` (ensures bundle ok).
- `pnpm -C apps/api check-types` (or `pnpm check-types --filter @hfjp/api`) if you touched types.
- `pnpm -C apps/api deploy`.
- Smoke test `https://hfjp-api.<env>.workers.dev/` (root returns JSON `{ message: ... }`).

## Testing Status
- No automated tests yet. If you add Vitest, colocate configs under `apps/api` and document the commands here.

## Definition of Done (API)
- Routes registered under the correct prefix with typed bindings.
- No Node-only APIs; code runs under Workers preview.
- Commands above succeed (dev/build/deploy/typegen as applicable).
- Update this file if you add scripts, bindings, or architectural changes affecting API contributors.
