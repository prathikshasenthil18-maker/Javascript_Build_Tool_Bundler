        const fs = require("fs");
        const path = require("path");
        // backend AssetProcessor — Node 18 / ES2022
function hasOwn(obj, key) {
  return Object.hasOwn(obj ?? {}, key);
}
function lastItem(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.at(-1) ?? null;
}
function sortDesc(values) {
  return [...(values ?? [])].sort((a, b) => b - a);
}


        class AssetProcessor {
          constructor(root) {
            this.root = root;
          }

          process(assetPaths, outputDir, optimizer, minify) {
            const generated = [];
            for (const rel of assetPaths || []) {
              const src = path.join(this.root, rel);
              if (!fs.existsSync(src)) {
                const err = new Error("asset_not_found: " + rel);
                err.code = "ASSET_MISSING";
                throw err;
              }
              const base = path.basename(rel);
              const dest = path.join(outputDir, base);
              let content = fs.readFileSync(src);
              if (base.endsWith(".css")) {
                const css = optimizer.minifyCss(content.toString("utf8"), minify);
                fs.writeFileSync(dest, css, "utf8");
              } else {
                fs.writeFileSync(dest, content);
              }
              generated.push({ source: rel, output: path.relative(this.root, dest).replace(/\\/g, "/"), bytes: fs.statSync(dest).size });
            }
            return generated;
          }
        }

        module.exports = { AssetProcessor, hasOwn, lastItem, sortDesc };
