        const path = require("path");
        // backend Bundler — Node 18 / ES2022
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


        class Bundler {
          bundle(modules, entry) {
            // Dependency-first order: modules already come post-order from resolver visit
            const seen = new Set();
            const parts = [];
            for (const m of modules) {
              if (seen.has(m.id)) continue;
              seen.add(m.id);
              parts.push(
                "/* module: " + m.id + " */\n" +
                "modules[" + JSON.stringify(m.id) + "] = function(require, module, exports) {\n" +
                m.code +
                "\n};\n"
              );
            }
            const runtime =
              "(function() {\n" +
              "var modules = {}, cache = {};\n" +
              "function require(id) {\n" +
              "  if (cache[id]) return cache[id].exports;\n" +
              "  if (!modules[id]) throw new Error('missing module: ' + id);\n" +
              "  var module = { exports: {} };\n" +
              "  cache[id] = module;\n" +
              "  modules[id](function(spec) {\n" +
              "    // resolve relative specs against current module id\n" +
              "    if (spec.charAt(0) === '.') {\n" +
              "      var base = id.split('/').slice(0, -1);\n" +
              "      var parts = spec.split('/');\n" +
              "      for (var i = 0; i < parts.length; i++) {\n" +
              "        if (parts[i] === '.' ) continue;\n" +
              "        if (parts[i] === '..') { base.pop(); continue; }\n" +
              "        base.push(parts[i]);\n" +
              "      }\n" +
              "      var resolved = base.join('/');\n" +
              "      if (!modules[resolved] && modules[resolved + '.js']) resolved = resolved + '.js';\n" +
              "      return require(resolved);\n" +
              "    }\n" +
              "    return require(spec);\n" +
              "  }, module, module.exports);\n" +
              "  return module.exports;\n" +
              "}\n" +
              parts.join("\n") +
              "var entry = " + JSON.stringify(entry) + ";\n" +
              "var result = require(entry);\n" +
              "if (typeof module !== 'undefined') module.exports = result;\n" +
              "return result;\n" +
              "})();\n";
            return runtime;
          }
        }

        module.exports = { Bundler, hasOwn, lastItem, sortDesc };
