function ok(data) { return { ok: true, data: data || {}, error: null }; }
function fail(code, message) {
  return { ok: false, data: null, error: { code: code || "error", message: String(message || "") } };
}
module.exports = { ok, fail };
