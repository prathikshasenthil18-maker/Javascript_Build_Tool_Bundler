        // shared ModuleInfo — Node 20 / ES2023
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
