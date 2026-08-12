        const fs = require("fs");
        const path = require("path");
        const { createModuleInfo } = require("../../shared/src/ModuleInfo");
        // backend ModuleResolver — Node 24 / ES2024+
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


        const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

        class ModuleResolver {
          constructor(root) {
            this.root = root;
          }

          resolveEntry(entry) {
            const full = path.resolve(this.root, entry);
            if (!fs.existsSync(full)) {
              const err = new Error("entry_not_found: " + entry);
              err.code = "ENTRY_MISSING";
              throw err;
            }
            return full;
          }

          #parseDeps(code) {
            const deps = [];
            let m;
            const re = new RegExp(REQUIRE_RE.source, "g");
            while ((m = re.exec(String(code || ""))) !== null) {
              const spec = m[1];
              if (spec.startsWith(".")) deps.push(spec);
            }
            return deps;
          }

          #resolveSpec(fromFile, spec) {
            const base = path.resolve(path.dirname(fromFile), spec);
            const candidates = [base, base + ".js", path.join(base, "index.js")];
            for (const c of candidates) {
              if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
            }
            const err = new Error("module_not_found: " + spec + " from " + fromFile);
            err.code = "MODULE_MISSING";
            throw err;
          }

          discover(entry) {
            const entryFile = this.resolveEntry(entry);
            const seen = new Map();
            const order = [];
            const visit = (file) => {
              const rel = path.relative(this.root, file).replace(/\\/g, "/");
              if (seen.has(rel)) return;
              const code = fs.readFileSync(file, "utf8");
              const specs = this.#parseDeps(code);
              const deps = [];
              seen.set(rel, null); // placeholder to prevent re-entry while resolving
              for (const spec of specs) {
                const depFile = this.#resolveSpec(file, spec);
                const depRel = path.relative(this.root, depFile).replace(/\\/g, "/");
                deps.push(depRel);
                visit(depFile);
              }
              const info = createModuleInfo({ id: rel, file: rel, deps, code });
              seen.set(rel, info);
              order.push(info);
            };
            visit(entryFile);
            return {
              entry: path.relative(this.root, entryFile).replace(/\\/g, "/"),
              modules: order,
              count: order.length,
            };
          }
        }

        module.exports = { ModuleResolver, hasOwn, lastItem, sortDesc };
