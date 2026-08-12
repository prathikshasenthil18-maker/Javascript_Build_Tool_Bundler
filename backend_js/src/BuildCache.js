        const fs = require("fs");
        const path = require("path");
        const crypto = require("crypto");
        // backend BuildCache — Node 18 / ES2022
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


        class BuildCache {
          constructor(cacheDir) {
            this.cacheDir = cacheDir;
            this.hits = 0;
            this.misses = 0;
            fs.mkdirSync(cacheDir, { recursive: true });
          }

          hash(content) {
            return crypto.createHash("sha256").update(String(content || "")).digest("hex");
          }

          pathFor(hash) {
            return path.join(this.cacheDir, hash + ".js");
          }

          get(content) {
            const h = this.hash(content);
            const file = this.pathFor(h);
            if (fs.existsSync(file)) {
              this.hits += 1;
              return { hit: true, hash: h, code: fs.readFileSync(file, "utf8") };
            }
            this.misses += 1;
            return { hit: false, hash: h, code: null };
          }

          set(hash, code) {
            fs.writeFileSync(this.pathFor(hash), String(code || ""), "utf8");
          }

          resetCounters() {
            this.hits = 0;
            this.misses = 0;
          }

          clear() {
            if (!fs.existsSync(this.cacheDir)) return;
            for (const name of fs.readdirSync(this.cacheDir)) {
              if (name === ".gitkeep") continue;
              fs.unlinkSync(path.join(this.cacheDir, name));
            }
            this.resetCounters();
          }

          stats() {
            return { hits: this.hits, misses: this.misses };
          }
        }

        module.exports = { BuildCache, hasOwn, lastItem, sortDesc };
