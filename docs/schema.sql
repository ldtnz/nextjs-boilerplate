-- The whole schema, for a database that has none yet.
--
-- Generated from prisma/migrations by `npm run db:sql` — do not edit by hand.
--
-- Paste this into Turso's SQL console (or any SQLite client) to set up a new
-- database. It expects an empty one: run against a database that already has
-- these tables it will stop at the first "table already exists", which is
-- harmless but means there was nothing to do.
--
-- The alternative, for anyone with the repository checked out, is
-- `npm run db:migrate-turso`, which applies the same files and can be re-run
-- safely at any time.

-- ----- 0_init -----

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "displayName" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Item_createdAt_idx" ON "Item"("createdAt");
