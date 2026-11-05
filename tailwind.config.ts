/**
 * Persora — Tailwind CSS configuration (v4).
 *
 * Tailwind v4 drives most theming through the CSS `@theme` layer in
 * `src/app/globals.css`. This file keeps the content scan paths and the
 * ReUI/semantic theme extensions that are easiest to manage in JS.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        // Persora global theme colors (dark / light modes)
        sidebar: {
          dark: "rgb(23 23 23)",
          light: "rgb(247 247 247)",
        },
        workspace: {
          dark: "rgb(18 18 18)",
          light: "rgb(255 255 255)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "slide-up-fade": "slideUpFade 0.3s ease-out forwards",
        "slide-down-fade": "slideDownFade 0.2s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "skeleton-pulse": "skeletonPulse 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUpFade: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDownFade: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        skeletonPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
