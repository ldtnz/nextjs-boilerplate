# App Boilerplate

A personal starting point for new apps: a proven stack, design system and set
of code conventions, taken from a production app with everything specific to
it left out.

It runs as it is — a small list app (add, tick off, delete, a settings page) —
so every layer has a worked example to copy before it is replaced.

## What is in it

- **Next.js 16** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4** with a dark design system in `src/app/globals.css`
- **Prisma** on **SQLite** locally, **Turso** when hosted on a serverless platform
- **PWA**: web manifest, service worker (Serwist), offline fallback page,
  iOS safe-area handling
- Ready-made UI: `Modal`, `ConfirmDialog`, `Select`, `PageHeader`,
  `SettingsSection`, `EmptyState`, `OfflineNotice`
- Hooks for the hard parts: focus trapping and scroll lock in dialogs
  (`useDialogFocus`), horizontal wheel scrolling, pointer detection, offline
  handling
- **Tests** on Node's built-in runner, including route handlers against a real
  temporary database
- **`AGENTS.md`**, the instructions for coding agents: the conventions,
  the design rules, and the mobile/PWA lessons learned the hard way

Not included: authentication. See "Authentication" in `AGENTS.md` before
deploying anything public.

## Getting started

```bash
npm install
cp .env.example .env
npm run db:migrate        # creates prisma/dev.db from the migrations
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build (webpack, generates the service worker) |
| `npm run check` | Lint, typecheck and tests — run before every commit |
| `npm test` | Tests only |
| `npm run db:migrate` | Apply migrations to the local SQLite file |
| `npm run db:migrate-turso` | Apply migrations to Turso (safe to re-run) |
| `npm run db:sql` | Regenerate `docs/schema.sql` after adding a migration |

## Starting a new project from it

1. Create the new repository from this one (GitHub: **Use this template**, or
   clone and push to a new remote).
2. Rename: `APP_NAME`, `APP_DESCRIPTION` in `src/lib/app.ts`, and `name` in
   `package.json`.
3. Replace the icons in `public/` and `src/app/favicon.ico` (192, 512, 512
   maskable, 180 for iOS).
4. Model the real data in `prisma/schema.prisma` and a new migration, following
   `Item`. Then delete `Item`: its model, `src/lib/items.ts`, `/api/items`,
   `ItemList`, and its tests.
5. Add authentication if the app will be reachable by anyone else.

## Deploying

- **Vercel + Turso:** create a Turso database, set `TURSO_DATABASE_URL` and
  `TURSO_AUTH_TOKEN` in the Vercel project, and apply the schema once with
  `npm run db:migrate-turso` — or paste `docs/schema.sql` into the Turso SQL
  console.
- **Self-hosted Node:** `npm run build && npm start` with `DATABASE_URL`
  pointing at a SQLite file on persistent storage.
