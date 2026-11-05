import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  // Override default ignores.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
