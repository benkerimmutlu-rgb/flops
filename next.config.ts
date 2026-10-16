import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Cache Components' static-shell prerendering is overkill for an MVP
  // that's almost entirely client-state-driven (localStorage, random picks,
  // usePathname nav) — turned off to avoid wrapping every page in Suspense
  // for no real benefit yet.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
