import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // OpenNext's bundled Worker output. Generated, minified, and never edited
    // by hand — but it was being linted, and it accounted for 47 of the 62
    // files reported and 1,934 of 2,109 warnings. Real problems in src/ were
    // buried under noise about code nobody wrote.
    ".open-next/**",
  ]),
]);

export default eslintConfig;
