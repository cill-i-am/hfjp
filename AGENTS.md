# AGENTS.md

This file gives agents concise, actionable guidance for working in this monorepo. Its scope is the entire repository.

## Overview

- Monorepo: Turborepo + pnpm workspace
- Apps:
  - `apps/api`: Cloudflare Worker API built with Hono
  - `apps/app`: Web app built with TanStack Start (React) targeting Cloudflare Workers
- Hosting: Cloudflare Workers for both API and web app
- Package manager: `pnpm@9` (do not use npm/yarn)
- Node: `>=18` (edge-targeted code must still use Web APIs)

## Layout

- `apps/api` – Hono Worker API
  - Entry: `apps/api/src/index.ts:1`
  - Config: `apps/api/wrangler.jsonc:1`, `apps/api/vite.config.ts:1`, `apps/api/tsconfig.json:1`
- `apps/app` – TanStack Start (SSR) app
  - Routes (file-based): `apps/app/src/routes/*`
  - Router: `apps/app/src/router.tsx:1`
  - Config: `apps/app/wrangler.jsonc:1`, `apps/app/vite.config.ts:1`, `apps/app/tsconfig.json:1`
- Root tooling: `package.json:1`, `turbo.json:1`, `pnpm-workspace.yaml:1`

## Commands

- Root (runs via Turborepo):
  - `pnpm dev` – Runs `dev` in all packages (non-cached, persistent)
  - `pnpm build` – Runs `build` in all packages
  - `pnpm check-types` – Typecheck across packages
  - `pnpm format` – Prettier format `*.{ts,tsx,md}`
  - Filters: append `--filter @hfjp/api` or `--filter @hfjp/app`
- API (`apps/api/package.json:1`):
  - `pnpm -C apps/api dev` – Dev server (Vite + Cloudflare plugin → Wrangler dev)
  - `pnpm -C apps/api build` – Build worker bundle
  - `pnpm -C apps/api preview` – Preview built worker locally
  - `pnpm -C apps/api deploy` – Build then `wrangler deploy`
  - `pnpm -C apps/api cf-typegen` – Generate `env` binding types (`CloudflareBindings`)
- App (`apps/app/package.json:1`):
  - `pnpm -C apps/app dev` – Dev server on port `3000`
  - `pnpm -C apps/app build` – Build SSR app for Workers
  - `pnpm -C apps/app preview` – Preview built app
  - `pnpm -C apps/app test` – Run Vitest
  - Deploy: `pnpm -C apps/app build && pnpm -C apps/app wrangler deploy`

Notes:
- Both apps use `@cloudflare/vite-plugin`, so `vite dev` will drive a Workers-like dev via Wrangler. The app dev server is configured for `3000` in `apps/app/vite.config.ts:8`. The API dev server is configured for `3001` in `apps/api/vite.config.ts:5`.

## Cloudflare Workers

- Wrangler config:
  - API: `apps/api/wrangler.jsonc:1` – `main: ./src/index.ts`
  - App: `apps/app/wrangler.jsonc:1` – `main: @tanstack/react-start/server-entry`, `compatibility_flags: ["nodejs_compat"]`
- Logs & debugging:
  - `pnpm -C apps/* wrangler dev` (via `dev` scripts) for local
  - `pnpm -C apps/* wrangler tail --format pretty` for live logs after deploy
- Env bindings & types:
  - Add bindings (KV/D1/Queues/etc.) in the app’s `wrangler.jsonc`
  - Generate types for API with `pnpm -C apps/api cf-typegen` (env interface `CloudflareBindings`)
  - For app, use `pnpm -C apps/app wrangler types --env-interface CloudflareBindings` if you add bindings

Important: Even with `nodejs_compat`, Workers do not provide a filesystem. Avoid `fs`, `path`, or other Node-only APIs in production code. Use Cloudflare KV, D1, R2, Durable Objects, or Queues for persistence.

## Coding Conventions

- Language & modules:
  - TypeScript everywhere; ESM only (`"type": "module"`)
  - Strict TS; bundler module resolution
  - App path alias: `@/*` → `apps/app/src/*` (see `apps/app/tsconfig.json:22`)
- Formatting:
  - Prettier 3 – run `pnpm format` before committing
- Linting:
  - No repo-wide ESLint yet; prefer type errors + Prettier formatting
- Exports:
  - Prefer named exports
- Edge safety:
  - Use Web Platform APIs (Request/Response, fetch, crypto.subtle, caches)
  - Do not use Node-only globals/APIs in Worker code

## API (Hono) Guidelines

- Entry point: `apps/api/src/index.ts:1`
  - Example root route returns JSON via `c.json({ ... })`
- Add routes:
  - For quick endpoints, extend `app` in `index.ts`
  - For larger APIs, create `apps/api/src/routes/*.ts` and mount with `app.route('/prefix', router)`
- Handler style:
  - Return `Response`/`c.json`/`c.text`, avoid side effects
  - Validate inputs; keep handlers small and composable
- Workers constraints:
  - No `fs`/`net`/`tls`; use Cloudflare bindings for storage

## Web App (TanStack Start) Guidelines

- File-based routing:
  - Add routes under `apps/app/src/routes` using `createFileRoute()`
  - Do not edit `apps/app/src/routeTree.gen.ts` (generated)
- Router & root shell:
  - Router factory: `apps/app/src/router.tsx:1`
  - Root document and head: `apps/app/src/routes/__root.tsx:1`
- SSR on Workers:
  - Vite Cloudflare plugin is enabled; SSR environment set in `apps/app/vite.config.ts:13`
  - Keep server-only logic isolated to route/loaders/server functions; avoid Node-only APIs
- Styling:
  - Tailwind v4 via `@tailwindcss/vite`; global styles `apps/app/src/styles.css`
- Generated/ephemeral:
  - `routeTree.gen.ts`, `.wrangler`, `.tanstack`, `dist/` are generated – do not edit/commit

## Testing

- App: `pnpm -C apps/app test`
- API: No tests yet (consider adding Vitest with Hono integration)

## Common Workflows

- Run both apps in dev:
  - `pnpm dev` (or individually as above)
  - Open `http://localhost:3000` for the app and `http://localhost:8787` for API (if directly hitting the Worker)
- Build everything: `pnpm build`
- Deploy API: `pnpm -C apps/api deploy`
- Deploy App: `pnpm -C apps/app build && pnpm -C apps/app wrangler deploy`

## Pitfalls & Tips

- Filesystem use:
  - The example `todos.json` in the app demos is for local/dev only (`.gitignore` excludes it). Use KV/D1/etc. in production.
- Port conflicts:
  - App dev uses `3000` (see `apps/app/vite.config.ts:9`); Wrangler typically uses `8787`. Change if needed in Vite/Wrangler configs.
- Turbo caching:
  - Current `turbo.json:1` still has defaults from a Next.js template. Adjust `outputs` per package if you expand the repo.
- Package installs:
  - Always use `pnpm add [-D] <pkg> -w` at the root or with `-C apps/<name>` for app-scoped deps

## Definition of Done (for agents)

- Match existing style and folder layout
- Keep changes minimal and focused on the task
- Use pnpm and Turborepo tasks
- Update this `AGENTS.md` if you add new packages, scripts, or deployment steps

