import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  // Self-hosted images build with DOCKER_BUILD=1 and run the standalone
  // server, which bundles only the files the app actually needs. Serverless
  // platforms build their own way, so the option stays off for them.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  // Ship the SQLite file with the bundle when one exists next to the sources.
  // A serverless function's filesystem is read-only, so those deployments keep
  // the real database on Turso and ignore this; self-hosted installs read and
  // write the file directly.
  outputFileTracingIncludes: {
    "/**": ["./prisma/dev.db"],
  },
  // @serwist/next adds a webpack config (it builds the service worker for
  // production with it). Next 16 runs `next dev` on Turbopack and would
  // otherwise flag that config as a likely mistake.
  turbopack: {},
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // A service worker in development slows hot reload and caches the very
  // thing being edited, so it is only generated for production builds.
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
