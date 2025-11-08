# AGENTS.md

This file covers repo-wide workflows for the Turborepo. Package-specific guidance now lives beside each app.

## Overview

- Monorepo: Turborepo + pnpm workspace (Node >= 18, `pnpm@9` only).
- Apps:
  - `apps/api` – Cloudflare Worker API built with Hono.
  - `apps/app` – TanStack Start (React) SSR app targeting Cloudflare Workers.
- Hosting: Both apps deploy to Cloudflare Workers (edge runtime, Web APIs only).
- Documentation split: keep high-level awareness here, follow the app-scoped `AGENTS.md` files for details.

## Repo Layout

- `apps/api` – worker entry + API routes (see `apps/api/AGENTS.md`).
- `apps/app` – SSR client/server bundle (see `apps/app/AGENTS.md`).
- `packages/*` – shared packages (none yet).
- Root tooling/config: `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `.vscode/*`.

## Per-app Guides

- `apps/api/AGENTS.md` – commands, routing, bindings, and deployment notes for the Hono API.
- `apps/app/AGENTS.md` – loader/server-function patterns, testing, and SSR details for the TanStack app.

## Commands

- `pnpm dev` – runs `dev` in every package (non-cached).
- `pnpm build` – builds everything through Turborepo.
- `pnpm check-types` – repo-wide type-check.
- `pnpm format` – Prettier 3 over `*.{ts,tsx,md}`.
- Use `--filter @hfjp/api` / `--filter @hfjp/app` (or `-C apps/<name>`) for package-specific tasks; see each package’s `AGENTS.md` for their exact scripts.

## Cloudflare Workers

- Both apps ship as Workers with `@cloudflare/vite-plugin`. Preview/dev happens through Wrangler via the package `dev` scripts.
- Secrets/persistence must go through Wrangler bindings (KV, D1, R2, Durable Objects, Queues). No filesystem access at runtime even with `nodejs_compat`.
- Logs: `pnpm -C apps/<name> wrangler tail --format pretty`. Deploy via each package’s documented script.

## Coding Conventions

- TypeScript + ESM (`"type": "module"`) everywhere; strict compiler options with bundler resolution.
- Prefer named exports; keep default exports only when frameworks require them.
- Run `pnpm format` before committing. No repo-wide ESLint yet—treat type errors as blockers.
- Edge safety: use Web Platform APIs (`Request`, `fetch`, `crypto.subtle`, `caches`); avoid Node globals like `process`, `Buffer`, `fs`.

## Testing

- UI/app tests: `pnpm -C apps/app test` (Vitest, jsdom).
- API currently has no tests—add Vitest/Hono coverage if you expand functionality and document the commands in `apps/api/AGENTS.md`.
- Repo-level type checks via `pnpm check-types`.

## Common Workflows

- Local dev for both apps: `pnpm dev` (ports documented in each package guide).
- Build all outputs before CI/deploy: `pnpm build`.
- Deployments: run the package-specific deploy commands (see per-app guides) after a successful build/type-check.

## Pitfalls & Tips

- Port conflicts: app dev server defaults to `3000`, API dev server to `3001`, Workers preview to `8787`. Adjust in Vite/Wrangler configs if needed.
- Turbo outputs still use template defaults—tune `turbo.json` if you add new packages or want better caching.
- Install dependencies with `pnpm add [-D] <pkg> -w` (or scoped with `-C apps/<name>`); never mix npm/yarn.

## Definition of Done (for agents)

- Match existing style/folder layout.
- Keep changes minimal and targeted.
- Use pnpm + Turborepo tasks (no npm/yarn scripts).
- Update this root `AGENTS.md` if you alter repo-level tooling; update the package guides for app-specific changes.
