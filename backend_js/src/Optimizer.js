        // backend Optimizer — Node 24 / ES2024+
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


        class Optimizer {
          minifyJs(code, enabled) {
            if (!enabled) return String(code || "");
            return String(code || "")
              .replace(/\/\*[\s\S]*?\*\//g, "")
              .replace(/(^|[^:])\/\/.*$/gm, "$1")
              .replace(/\s+/g, " ")
              .trim();
          }

          minifyCss(css, enabled) {
            if (!enabled) return String(css || "");
            return String(css || "")
              .replace(/\/\*[\s\S]*?\*\//g, "")
              .replace(/\s+/g, " ")
              .replace(/\s*([:{;,}])\s*/g, "$1")
              .trim();
          }

          treeShake(code, enabled) {
            if (!enabled) return String(code || "");
            // Safe minimal dead-code removal: drop lines marked //#__DROP__
            return String(code || "")
              .split(/\r?\n/)
              .filter((line) => !line.includes("//#__DROP__"))
              .join("\n");
          }

          sourceMap(file, code) {
            // Minimal identity source map for the generated file
            const lines = String(code || "").split(/\r?\n/);
            return JSON.stringify({
              version: 3,
              file,
              sources: [file],
              names: [],
              mappings: "AAAA;" + lines.slice(1).map(() => "AACA").join(";"),
              sourcesContent: [code],
            }, null, 2);
          }
        }

        module.exports = { Optimizer, hasOwn, lastItem, sortDesc };
