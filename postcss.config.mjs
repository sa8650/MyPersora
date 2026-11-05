/**
 * Persora — PostCSS configuration.
 *
 * Tailwind CSS v4 is compiled through the `@tailwindcss/postcss` plugin.
 * This file is REQUIRED: without it Next.js never runs Tailwind, and the
 * emitted stylesheet contains only the raw `@import "tailwindcss"` /
 * `@apply ...` text (no utility classes at all), which is why the deployed
 * site renders as unstyled text.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
