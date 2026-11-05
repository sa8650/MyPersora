/**
 * Persora — Patch OpenNext-generated worker.js to serve static assets.
 *
 * The @opennextjs/cloudflare adapter generates a worker that does NOT serve
 * static assets from `.open-next/assets/`. Without this patch, requests to
 * /_next/static/css/* and /_next/static/chunks/* return 404 on Cloudflare
 * Workers, resulting in a blank/white page.
 *
 * This script inserts an env.ASSETS.fetch() fallback before the middleware
 * handler so static assets are served correctly.
 *
 * Usage: node scripts/patch-worker.js
 * Run after `opennextjs-cloudflare build` regenerates .open-next/worker.js.
 */

import { readFile, writeFile } from "node:fs/promises";

const WORKER_PATH = ".open-next/worker.js";

const ASSET_SERVING_BLOCK = `
            // Serve static assets (.open-next/assets/) via env.ASSETS binding.
            // Without this, /_next/static/css/* and /_next/static/chunks/* return 404,
            // resulting in a blank/white page on Cloudflare Workers.
            if (url.pathname.startsWith("/_next/static/") || url.pathname === "/favicon.ico") {
                const assetResponse = await env.ASSETS.fetch(request);
                if (assetResponse.status !== 404) {
                    return assetResponse;
                }
            }

`;

async function patch() {
  const content = await readFile(WORKER_PATH, "utf8");

  // Already patched?
  if (content.includes("env.ASSETS.fetch(request)")) {
    console.log("[persora] worker.js already patched for static asset serving.");
    return;
  }

  const target = `            // - \`Request\`s are handled by the Next server\n            const reqOrResp = await middlewareHandler(request, env, ctx);`;
  const replacement = ASSET_SERVING_BLOCK + `            // - \`Request\`s are handled by the Next server\n            const reqOrResp = await middlewareHandler(request, env, ctx);`;

  if (!content.includes(target)) {
    console.error(
      "[persora] Could not find expected target block in worker.js. " +
        "The adapter output may have changed. Manual patching required.",
    );
    process.exit(1);
  }

  const updated = content.replace(target, replacement);
  await writeFile(WORKER_PATH, updated, "utf8");
  console.log("[persora] worker.js patched for static asset serving.");
}

patch().catch((err) => {
  console.error("[persora] Patch failed:", err);
  process.exit(1);
});
