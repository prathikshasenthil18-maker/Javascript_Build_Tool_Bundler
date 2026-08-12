function createBuildResult(input) {
  return {
    status: String(input?.status || "FAIL"),
    mode: String(input?.mode || "development"),
    modules: Number(input?.modules || 0),
    assets: Number(input?.assets || 0),
    output_files: Number(input?.output_files || 0),
    duration_ms: Number(input?.duration_ms || 0),
    cache_hits: Number(input?.cache_hits || 0),
    cache_misses: Number(input?.cache_misses || 0),
    warnings: Number(input?.warnings || 0),
    errors: Number(input?.errors || 0),
    outputs: Array.isArray(input?.outputs) ? input.outputs : [],
    error: input?.error || null,
  };
}
module.exports = { createBuildResult };
