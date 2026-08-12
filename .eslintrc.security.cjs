module.exports = {
  root: true,
  env: { es2022: true, node: true },
  plugins: ["security"],
  extends: ["plugin:security/recommended-legacy"],
  ignorePatterns: ["node_modules/", "coverage/", "reports/", "frontend_js/dist/", "dist/", "cache/"],
};
