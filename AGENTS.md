<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project instructions

This repository started from a personal boilerplate distilled from a
production Next.js PWA. The conventions below are what that project settled on
after a lot of iteration — several of them exist because the alternative was
tried and broke on a real phone. Follow them unless there is a reason not to,
and when there is, say so.

## Working with the owner

- **The owner writes in Italian: reply in Italian.** Everything that lands in
  the repository — code, comments, UI copy, commit messages, docs — is in
  **English**.
- **Commit locally; push only when asked.** Finishing a change means it is
  verified and committed, not pushed. Wait for an explicit "pusha" / "push".
- **Work on `main`.** Do not create feature branches unless asked: only `main`
  is deployed, and extra branches create extra preview deployments.
- **Never commit secrets** — `.env` is git-ignored and stays that way. If a
  secret appears in chat, never write it into a tracked file, and suggest
  rotating it.
- **Production database changes are run by the owner.** You do not have the
  Turso credentials. When a change needs a migration on Turso, say so plainly
  and give the exact command (`npm run db:migrate-turso`) or the SQL to paste.
- When the owner reports a problem, reproduce it before fixing it; when they
  report several in a row, keep a list and address every one.

## Stack

- **Next.js 16** (App Router, Turbopack for dev, webpack for build), **React 19**
- **TypeScript**, strict
- **Tailwind CSS v4**, configured in CSS (`src/app/globals.css`) — no
  `tailwind.config`, no component library. Components are written by hand.
- **Prisma 5** on **SQLite** locally and **Turso** (libSQL) when hosted, through
  `@prisma/adapter-libsql`; `src/lib/prisma.ts` picks one from the environment.
- **zod** for request validation, **lucide-react** for icons
- **Serwist** for the service worker: installable PWA, offline fallback page
- **Node's built-in test runner** with `tsx` — no Jest, no Vitest

## Where things are

```
src/app/                 routes, pages, layout, globals.css, manifest, sw.ts
src/app/api/             route handlers
src/components/          UI components, one per file, PascalCase
src/lib/                 everything that is not a component: data, hooks, helpers
prisma/schema.prisma     the schema
prisma/migrations/       numbered SQL migrations: 0_init, 1_..., 2_...
scripts/                 command-line tools (tsx), each with a header comment
tests/                   *.test.ts, run by `npm test`
docs/schema.sql          every migration as one file — generated, never edited
```

`Item` (model, `src/lib/items.ts`, `/api/items`, `ItemList`, `tests/api-items`)
is the starter's worked example. Copy its shape for real entities, then delete it.

## Code and comments

- **Comments say why, not what.** The code says what it does. A comment earns
  its place by recording what a reader cannot recover: which of two plausible
  designs was chosen and what went wrong with the other, a platform constraint,
  the bug an odd-looking line prevents. Write them as prose sentences. Do not
  "simplify" a line without reading the comment above it.
- **Every exported function, hook and component gets a doc comment** saying what
  it is for and anything surprising about using it.
- Match the surrounding code: naming, density of comments, idiom.
- Hooks are `use-*.ts` in `src/lib`; pure helpers are plain modules in `src/lib`.
- A file that reaches the database (Prisma) must never be imported by a client
  component. Constants a client also needs go in a separate module — see
  `src/lib/settings-limits.ts`.
- **Dates:** never `new Date(someFreeText)`. V8 parses things like
  `"some time in 2021"` as 1 January 2021 without complaint. Parse
  user-supplied dates strictly (ISO `YYYY-MM-DD`) and reject the rest. Store
  dates as UTC midnight and format them with `timeZone: "UTC"`, or half of them
  show up as the day before.

## UI and design

The look: dark only, near-black background, surfaces stepping up in small
increments (`surface`, `surface-2`, `surface-3`), soft rounded corners
(`rounded-xl` for controls, `rounded-2xl`/`rounded-3xl` for panels), small type
(`text-xs`/`text-sm`), Geist. Colour is for meaning, not decoration: `accent-2`
(green) for positive state, red for destructive, `accent-ai` (magenta) only for
things an AI produced.

- **Use the tokens** (`bg-surface-2`, `text-muted`, …), not raw hex. New tokens
  go in `:root` and `@theme inline` in `globals.css`.
- **Every dialog is `Modal`** (or `ConfirmDialog` for yes/no). They share the
  `.app-modal-overlay` / `.app-modal-panel` classes, focus trapping and the
  scroll lock. Do not build a one-off overlay.
- **Use `Select`, not a native `<select>`** — the native list is the OS's and
  ignores the dark theme.
- **Settings pages are stacks of `SettingsSection`.**
- Copy is short, plain and specific. A row that has nothing to show is
  dropped, not filled with "unavailable".
- Respect `prefers-reduced-motion`: every animation class in `globals.css` is
  switched off under it; new ones must be too.

## Mobile and PWA — the hard-won rules

Each of these was a real bug on a real iPhone.

- **Look at it at phone width.** 360 and 390px, and a tablet (768–1023px), not
  only desktop. Layouts that work at 1280 routinely do not.
- **Hover is for pointers.** Tailwind v4 already wraps `hover:` in
  `@media (hover: hover)`; hand-written `:hover` CSS must be gated the same way,
  or a tapped element stays lit. Anything that stands in for hover on touch
  (tap-to-reveal) must check `hasHoverPointer()` from `src/lib/pointer.ts` and
  stay off on pointer devices.
- **Do not autofocus inputs on touch.** It raises the keyboard over the dialog
  and the first touch elsewhere is spent dismissing it. Focus only when
  `hasHoverPointer()` is true.
- **Inputs are `text-base` below `sm`.** Under 16px iOS zooms the page in on
  focus.
- **Full-screen overlays need `height: 100dvh`, not just `inset-0`.** In an
  installed PWA on iOS `fixed inset-0` comes out one status bar short and
  leaves a band at the bottom. `.app-modal-overlay` already does this.
- **The page must not scroll behind a dialog.** `overflow: hidden` on the body
  is ignored by iOS Safari; `useScrollLock` pins the body instead and is
  already called by `useDialogFocus`, so every `Modal` gets it.
- **Glass must not depend on the blur.** iOS drops `backdrop-filter` in some
  stacks; a panel must be readable from its tint alone (`.app-modal-panel` is
  94% opaque for this reason).
- **Safe areas:** top edges pad by `env(safe-area-inset-top)`, bottom-anchored
  elements by `env(safe-area-inset-bottom)`.
- **Horizontal scrollers** get `useHorizontalWheel` (a mouse wheel only sends
  vertical deltas) and `overscroll-x-contain`.

## React pitfalls this codebase has hit

- **React rewrites `className` on every render.** For state set imperatively on
  the DOM (outside React), use a `data-*` attribute, not a class.
- **Tailwind `peer-*` only reaches siblings.** For a nested target use
  `group` / `group-focus-within`.
- **An effect that reads a ref once runs before late-mounting nodes exist.** A
  node that appears after the first render (behind a `mounted` flag, after
  data loads, inside a portal) needs a callback ref or the flag in the
  effect's dependencies — see `useHorizontalWheel`.
- **Portals need a mounted flag** or must only render after a user action:
  the server has no `document.body`.
- **No `setState` synchronously inside an effect** where it can be derived
  during render instead — the linter flags it, and it is usually right.
- **A popover that closes on outside `mousedown` will eat clicks on a portalled
  list** (mousedown fires before click, unmounting the list). Mark portalled
  panels with a data attribute and ignore them in the outside check, as
  `Select` does with `data-select-panel`.

## Data: Prisma, migrations, Turso

- Schema changes are **a new numbered folder** in `prisma/migrations`
  (`N_short_name/migration.sql`) **plus** the matching edit to
  `schema.prisma`. Never edit an applied migration.
- **Migrations are additive.** Add columns `NOT NULL DEFAULT …` (or nullable);
  do not rewrite tables in place. That is what lets an older database be
  brought forward by running only what it is missing.
- After adding one: `npm run db:sql` (regenerates `docs/schema.sql` — a test
  fails until you do), `npx prisma generate`, `npm run db:migrate` locally.
- **Turso needs the migration separately** — `npm run db:migrate-turso` (safe to
  re-run), or paste the new SQL into the Turso console. The owner runs this;
  tell them, every time.
- Select columns explicitly for anything sent to the client (see `ITEM_SELECT`)
  so payloads do not grow with every new column.
- Singleton settings live in the `Settings` row (id 1), read through
  `getSettings()`, which creates it on first read.

## API routes

- Validate every body with zod; a malformed or invalid body is a **400** with a
  message, never a 500.
- Ids from the URL go through `parseId`.
- Use `updateMany` / `deleteMany` and check `count` → **404**. `update` and
  `delete` throw on a missing row, which surfaces as a 500.
- Mark data routes and pages that read live data `dynamic = "force-dynamic"`.
- Client writes go through `send()` from `src/lib/offline.ts` (null instead of a
  throw when offline) and are optimistic with a rollback and
  `notifyWriteFailed()` on failure — never a silent no-op.

## Authentication

**There is none in the starter.** Every route answers anyone who can reach the
deployment. Add it before anything is deployed publicly: check the session at
the top of every route handler and gate pages in the server component. For a
single-user app, a TOTP login works well: a code from an authenticator app, a
session cookie signed with a `SESSION_SECRET` env var, and the TOTP secret kept
in the database rather than in the environment.

## Tests

- `npm test` runs every `tests/**/*.test.ts` with Node's test runner.
  `tests/setup.ts` gives each run a fresh temporary SQLite database built from
  the migrations — developer and production data are never touched.
- **Route tests call the real handlers** with a real `NextRequest` and the real
  database (see `tests/api-items.test.ts`). Routes are where a mistake costs
  rows, so they are tested as routes.
- Mock only what a test runner cannot provide — e.g. a session read through
  `next/headers` — with `mock.module` (the test script carries
  `--experimental-test-module-mocks`). A module can only be mocked once per
  process.
- Tests must not depend on each other's rows or on run order; assert on what
  the test itself created.

## Before you commit

```bash
npm run check    # lint + typecheck + tests
npm run build    # when routes, config or the service worker changed
```

Verify rather than assume: if a change affects layout, look at it in a browser
at the widths that matter (Playwright with Chromium is available for
screenshots); if it affects a query, run it against rows that include the
awkward case; if it fixes a bug, reproduce the bug first and show the fix
against it. Remove any throwaway probe pages or scripts before committing.

## Commit messages

- Subject: imperative, specific, under ~70 characters, no prefix tags.
  ("Hold the page still behind a dialog", not "fix: modal scroll".)
- Body: prose. **Why** the change was needed, what was wrong, what was
  considered and rejected, and **what was measured** before and after — numbers
  where there are numbers.
- One logical change per commit.
