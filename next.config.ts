import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Styling is compiled by postcss.config.mjs (@tailwindcss/postcss), which is
  // used by both the webpack and Turbopack pipelines. Do not re-add a
  // `turbopack.rules` Tailwind loader: `next build` runs webpack, so such a
  // rule never executes and Tailwind output is silently dropped.
};

export default nextConfig;

// ---------------------------------------------------------------------------
// Local development bindings
// ---------------------------------------------------------------------------
// Gives `next dev` access to the Cloudflare D1 / R2 bindings declared in
// wrangler.toml (via Miniflare), so authentication and every API route can be
// exercised locally instead of only inside the deployed Worker.
// Skipped automatically during production builds (`next build` /
// `opennextjs-cloudflare build`).
if (process.env.NODE_ENV === "development") {
  try {
    initOpenNextCloudflareForDev();
  } catch (error) {
    console.warn(
      "[persora] Cloudflare local bindings unavailable (D1/R2). " +
        "Run `npx wrangler d1 execute persora-db --local --file=./migrations/schema.sql` first.",
      error,
    );
  }
}
