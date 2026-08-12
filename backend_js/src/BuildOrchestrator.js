        const fs = require("fs");
        const path = require("path");
        const { ModuleResolver } = require("./ModuleResolver");
        const { ModuleGraph } = require("./ModuleGraph");
        const { Transformer } = require("./Transformer");
        const { Bundler } = require("./Bundler");
        const { AssetProcessor } = require("./AssetProcessor");
        const { Optimizer } = require("./Optimizer");
        const { BuildCache } = require("./BuildCache");
        const { createBuildResult } = require("../../shared/src/BuildResult");
        // backend BuildOrchestrator — Node 20 / ES2023
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


        class BuildOrchestrator {
          constructor(root) {
            this.root = root;
            this.lastStats = null;
            this.lastStatus = { state: "idle" };
            this.lastDiscovery = null;
            this.lastGraph = null;
          }

          loadConfig() {
            const file = path.join(this.root, "config", "build.config.json");
            return JSON.parse(fs.readFileSync(file, "utf8"));
          }

          discover(entry) {
            const cfg = this.loadConfig();
            const resolver = new ModuleResolver(this.root);
            const discovery = resolver.discover(entry || cfg.entry);
            const graph = new ModuleGraph().build(discovery, { circular: cfg.circular || "error" });
            this.lastDiscovery = discovery;
            this.lastGraph = graph;
            return { discovery, graph, config: cfg };
          }

          clean() {
            const cfg = this.loadConfig();
            const outDir = path.join(this.root, cfg.output || "dist");
            const cacheDir = path.join(this.root, "cache");
            if (fs.existsSync(outDir)) {
              for (const name of fs.readdirSync(outDir)) {
                if (name === ".gitkeep") continue;
                fs.rmSync(path.join(outDir, name), { recursive: true, force: true });
              }
            }
            new BuildCache(cacheDir).clear();
            this.lastStatus = { state: "cleaned" };
            return { status: "cleaned" };
          }

          build(request) {
            const started = Date.now();
            this.lastStatus = { state: "building" };
            const cfg = this.loadConfig();
            const mode = request?.mode || cfg.mode || "development";
            const production = mode === "production";
            const minify = production ? true : Boolean(cfg.minify);
            const sourceMap = production ? true : cfg.sourceMap !== false;
            const useCache = cfg.cache !== false;
            const entry = request?.entry || cfg.entry;
            const outDir = path.join(this.root, cfg.output || "dist");
            fs.mkdirSync(outDir, { recursive: true });

            const cache = new BuildCache(path.join(this.root, "cache"));
            if (request?.clean) this.clean();
            cache.resetCounters();

            const resolver = new ModuleResolver(this.root);
            const discovery = resolver.discover(entry);
            const graph = new ModuleGraph().build(discovery, { circular: cfg.circular || "error" });
            this.lastDiscovery = discovery;
            this.lastGraph = graph;

            const transformer = new Transformer();
            const optimizer = new Optimizer();
            const transformed = [];
            for (const mod of discovery.modules) {
              let code = transformer.transform(mod).code;
              code = optimizer.treeShake(code, production);
              if (useCache) {
                const cached = cache.get(mod.id + "\n" + code + "\n" + mode);
                if (cached.hit) {
                  transformed.push({ id: mod.id, code: cached.code, deps: mod.deps });
                  continue;
                }
                cache.set(cached.hash, code);
                transformed.push({ id: mod.id, code, deps: mod.deps });
              } else {
                cache.misses += 1;
                transformed.push({ id: mod.id, code, deps: mod.deps });
              }
            }

            let bundleCode = new Bundler().bundle(transformed, discovery.entry);
            bundleCode = optimizer.minifyJs(bundleCode, minify);
            const bundlePath = path.join(outDir, "bundle.js");
            fs.writeFileSync(bundlePath, bundleCode, "utf8");
            const outputs = [{ file: "dist/bundle.js", bytes: Buffer.byteLength(bundleCode) }];

            if (sourceMap) {
              const map = optimizer.sourceMap("bundle.js", bundleCode);
              fs.writeFileSync(path.join(outDir, "bundle.js.map"), map, "utf8");
              outputs.push({ file: "dist/bundle.js.map", bytes: Buffer.byteLength(map) });
              fs.writeFileSync(bundlePath, bundleCode + "\n//# sourceMappingURL=bundle.js.map\n", "utf8");
            }

            const assets = new AssetProcessor(this.root).process(cfg.assets || [], outDir, optimizer, minify);
            for (const a of assets) outputs.push({ file: a.output, bytes: a.bytes });

            const cacheStats = cache.stats();
            const duration = Date.now() - started;
            const result = createBuildResult({
              status: "completed",
              mode,
              modules: discovery.count,
              assets: assets.length,
              output_files: outputs.length,
              duration_ms: duration,
              cache_hits: cacheStats.hits,
              cache_misses: cacheStats.misses,
              warnings: (graph.warnings || []).length,
              errors: 0,
              outputs,
            });
            this.lastStats = {
              modules: discovery.count,
              dependencies: graph.dependency_count,
              output_files: outputs.length,
              assets: assets.length,
              output_size: outputs.reduce((n, o) => n + o.bytes, 0),
              duration_ms: duration,
              cache_hits: cacheStats.hits,
              cache_misses: cacheStats.misses,
              warnings: (graph.warnings || []).length,
              errors: 0,
              mode,
            };
            fs.mkdirSync(path.join(this.root, "reports"), { recursive: true });
            fs.writeFileSync(path.join(this.root, "reports", "build-latest.json"), JSON.stringify(result, null, 2));
            this.lastStatus = { state: "completed", mode };
            return result;
          }
        }

        module.exports = { BuildOrchestrator, hasOwn, lastItem, sortDesc };
