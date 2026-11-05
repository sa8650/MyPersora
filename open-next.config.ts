// Persora — OpenNext for Cloudflare configuration.
//
// Adapts the Next.js 15 App Router application for deployment on
// Cloudflare Workers. D1 and R2 bindings are supplied via wrangler.toml
// and accessed at runtime through `env.DB` and `env.R2_BUCKET`.

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
