        // shared ModuleInfo — Node 18 / ES2022
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

        function createModuleInfo(input) {
          const id = input?.id;
          const file = input?.file;
          if (!id || !file) throw new Error("invalid_module_info");
          return {
            id: String(id),
            file: String(file),
            deps: Array.isArray(input.deps) ? input.deps.map(String) : [],
            hash: String(input.hash || ""),
            code: input.code == null ? null : String(input.code),
          };
        }
        module.exports = { createModuleInfo, hasOwn, lastItem, sortDesc };
