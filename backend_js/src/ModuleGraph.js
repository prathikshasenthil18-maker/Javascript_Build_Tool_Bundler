        // backend ModuleGraph — Node 22 / ES2024+
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


        class ModuleGraph {
          build(discovery, options) {
            const modules = discovery.modules || [];
            const byId = new Map(modules.map((m) => [m.id, m]));
            const edges = [];
            for (const m of modules) {
              for (const d of m.deps || []) {
                edges.push({ from: m.id, to: d });
                if (!byId.has(d)) {
                  const err = new Error("missing_dependency: " + d + " required by " + m.id);
                  err.code = "MISSING_DEP";
                  throw err;
                }
              }
            }
            const cycles = this.#detectCycles(modules);
            const circularMode = (options && options.circular) || "error";
            const warnings = [];
            if (cycles.length) {
              const msg = "circular_dependency: " + cycles[0].join(" -> ");
              if (circularMode === "error") {
                const err = new Error(msg);
                err.code = "CYCLE";
                err.cycles = cycles;
                throw err;
              }
              warnings.push(msg);
            }
            return {
              entry: discovery.entry,
              nodes: modules.map((m) => m.id),
              edges,
              module_count: modules.length,
              dependency_count: edges.length,
              warnings,
              cycles,
            };
          }

          #detectCycles(modules) {
            const adj = new Map(modules.map((m) => [m.id, m.deps.slice()]));
            const WHITE = 0, GRAY = 1, BLACK = 2;
            const color = new Map([...adj.keys()].map((n) => [n, WHITE]));
            const stack = [];
            const cycles = [];
            function dfs(node) {
              color.set(node, GRAY);
              stack.push(node);
              for (const next of adj.get(node) || []) {
                if (color.get(next) === GRAY) {
                  const idx = stack.indexOf(next);
                  cycles.push(stack.slice(idx).concat(next));
                } else if (color.get(next) === WHITE) dfs(next);
              }
              stack.pop();
              color.set(node, BLACK);
            }
            for (const n of adj.keys()) if (color.get(n) === WHITE) dfs(n);
            return cycles;
          }
        }

        module.exports = { ModuleGraph, hasOwn, lastItem, sortDesc };
