/**
 * Persora — cn() class-merging utility.
 *
 * Merges Tailwind classes with tailwind-merge and clsx. The Persora typography
 * tokens (text-{family}-{weight}) are registered as their own conflict group so
 * they behave like font-size utilities: merging a typography token with a
 * semantic text-color token (e.g. text-text-secondary) keeps BOTH classes, while
 * two typography tokens do not clash (the last one wins).
 *
 * Reference: uploads/typography.txt — Token naming: text-{family}-{weight}
 */

import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Every Persora typography token family. */
const TYPOGRAPHY_FAMILIES = [
  "large-title",
  "display-1",
  "display-2",
  "display-3",
  "display-4",
  "title-1",
  "title-2",
  "title-3",
  "headline",
  "body",
  "body-2",
  "caption-1",
  "caption-2",
] as const;

/** All four weights for every family. */
const TYPOGRAPHY_TOKENS: string[] = [];
for (const family of TYPOGRAPHY_FAMILIES) {
  for (const weight of ["regular", "medium", "semibold", "bold"]) {
    TYPOGRAPHY_TOKENS.push(`text-${family}-${weight}`);
  }
}

/**
 * Custom tailwind-merge instance that treats Persora typography tokens as
 * font-size utilities so they compose with semantic text-color tokens.
 */
const cn = extendTailwindMerge({
  extend: {
    classGroups: {
      // Typography tokens are treated as font-size utilities.
      "text-size": [
        ...TYPOGRAPHY_TOKENS,
        { "text-*:*": [] },
      ],
    } as any,
  },
});

export { cn };
export { TYPOGRAPHY_TOKENS };
