        const { getVersionInfo } = require("../../shared/src/VersionInfo");
        const { createBuildRequest } = require("../../shared/src/BuildRequest");
        const { BuildOrchestrator } = require("./BuildOrchestrator");
        // backend BuildApi — Node 22 / ES2024+
function hasOwn(obj, key) {
  return Object.hasOwn(obj ?? {}, key);
}
function lastItem(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.at(-1) ?? null;
}
function sortDesc(values) {
  return (values ?? []).toSorted((a, b) => b - a);
}
function findLastActive(items) {
  return (items ?? []).findLast((item) => item?.active) ?? null;
}
function deferred() {
  return Promise.withResolvers();
}


        class BuildApi {
          constructor(root) {
            this.orch = new BuildOrchestrator(root);
          }

          health() {
            const snap = this.orch.discover();
            return {
              status: "healthy",
              bundler: "available",
              modules: snap.discovery.count,
            };
          }

          version() {
            return getVersionInfo();
          }

          config() {
            return this.orch.loadConfig();
          }

          modules() {
            const snap = this.orch.discover();
            return {
              entry: snap.discovery.entry,
              count: snap.discovery.count,
              modules: snap.discovery.modules.map((m) => ({ id: m.id, deps: m.deps })),
            };
          }

          graph() {
            const snap = this.orch.discover();
            return snap.graph;
          }

          build(body) {
            const req = createBuildRequest(body || {});
            return this.orch.build(req);
          }

          status() {
            return this.orch.lastStatus;
          }

          stats() {
            return this.orch.lastStats || {
              modules: 0,
              dependencies: 0,
              output_files: 0,
              assets: 0,
              output_size: 0,
              duration_ms: 0,
              cache_hits: 0,
              cache_misses: 0,
              warnings: 0,
              errors: 0,
            };
          }

          clean() {
            return this.orch.clean();
          }
        }

        module.exports = { BuildApi, hasOwn, lastItem, sortDesc };
