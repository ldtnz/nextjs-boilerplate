// Kept apart from settings.ts, which reaches the database, so client
// components can import the limits without pulling Prisma into the bundle.
export const DISPLAY_NAME_MAX = 40;
