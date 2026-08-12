module.exports = {
  root: true,
  parserOptions: { ecmaVersion: 20, sourceType: "script" },
  env: { es2022: true, node: true, mocha: true, browser: true },
  ignorePatterns: ["node_modules/", "coverage/", "reports/", "frontend_js/dist/", "dist/", "cache/", "tool-fixtures/"],
  rules: { "no-unused-vars": "warn", "no-undef": "error", "no-console": "off" },
  overrides: [{ files: ["frontend_js/src/**/*.js"], parserOptions: { sourceType: "module", ecmaVersion: 18 } }],
};
