import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: Do not add a `turbopack.rules` entry that loads Tailwind via
  // `@tailwindcss/turbopack`. `next build` uses webpack by default, so that
  // rule never ran and Tailwind was never compiled. Styling is now handled by
  // `postcss.config.mjs` (@tailwindcss/postcss), which works for BOTH
  // webpack and Turbopack builds.
};

export default nextConfig;
