function createBuildRequest(payload) {
  const p = payload || {};
  return {
    mode: p.mode === "production" ? "production" : "development",
    entry: p.entry || null,
    clean: Boolean(p.clean),
    at: new Date().toISOString(),
  };
}
module.exports = { createBuildRequest };
