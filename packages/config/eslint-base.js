/** Shared flat-config rules, meant to be spread into an app's eslint.config.mjs
 *  alongside framework-specific configs (e.g. next/core-web-vitals). */
export const baseRules = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  "prefer-const": "warn",
};
