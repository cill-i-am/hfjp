# hfjp Monorepo

Edge-focused apps for hfjp built with Turborepo, pnpm, and Cloudflare Workers.

## Overview

- **Tech stack:** Turborepo, pnpm@9, TypeScript (ESM), Vite, Cloudflare Workers.
- **Apps:**
  - [`apps/api`](./apps/api) – Hono Worker API.
  - [`apps/app`](./apps/app) – TanStack Start SSR web app.
- **Docs:** Repo guidance lives in [`AGENTS.md`](./AGENTS.md); each app has its own `AGENTS.md` with deeper instructions (see below).

## Requirements

- Node ≥ 18 (LTS recommended).
- pnpm 9 (`corepack enable pnpm` or install manually).
- Wrangler CLI (pulled in via devDependencies) for Cloudflare workflows.

Install dependencies once:

```bash
pnpm install
```

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Run `dev` scripts for all packages (handy for local API + app). |
| `pnpm build` | Build every package through Turborepo. |
| `pnpm check-types` | Type-check the workspace. |
| `pnpm format` | Run Prettier on `*.{ts,tsx,md}`. |

Use `--filter @hfjp/api` or `--filter @hfjp/app` to scope root commands. Package-specific commands are documented in their guides:

- [`apps/api/AGENTS.md`](./apps/api/AGENTS.md)
- [`apps/app/AGENTS.md`](./apps/app/AGENTS.md)

## Development Workflow

1. Run `pnpm dev` to start both apps, or run a single package via `pnpm -C apps/<name> dev`.
2. Visit the app on `http://localhost:3000` (Wrangler proxy usually `8787`), API dev server on `http://localhost:3001`.
3. Use Vitest (`pnpm -C apps/app test`) for UI tests; the API currently has no automated tests.
4. Before pushing, run `pnpm build` + `pnpm check-types` to ensure both apps compile cleanly.

## Deployments

- **API:** `pnpm -C apps/api deploy` (builds + `wrangler deploy`).
- **App:** `pnpm -C apps/app build && pnpm -C apps/app wrangler deploy`.
- Cloudflare bindings/secrets live in each app’s `wrangler.jsonc`. Update bindings → rerun the relevant type generation command (see package AGENTS docs).

## Coding Standards

- TypeScript everywhere, `"type": "module"`.
- Prefer named exports; default exports only when required (e.g., Hono app, TanStack route files).
- Avoid Node-only APIs at runtime—Workers expose Web APIs only, even with `nodejs_compat`.
- Format with Prettier (`pnpm format`) and treat type errors as blockers (no repo-wide ESLint yet).

## Documentation Links

- Root guidance: [`AGENTS.md`](./AGENTS.md)
- API-specific guide: [`apps/api/AGENTS.md`](./apps/api/AGENTS.md)
- App-specific guide: [`apps/app/AGENTS.md`](./apps/app/AGENTS.md)

Keep these docs updated whenever you add scripts, bindings, or workflows so other contributors can follow along.
