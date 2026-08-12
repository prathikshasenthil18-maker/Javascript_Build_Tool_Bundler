        // backend Transformer — Node 20 / ES2023
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


        class Transformer {
          transform(moduleInfo) {
            const code = String(moduleInfo.code || "");
            // Minimal transform: strip block comments starting with /*#__PURE__*/ markers only,
            // preserve valid CommonJS JavaScript for assigned Node syntax.
            const cleaned = code.replace(/\/\*\s*#__PURE__\s*\*\//g, "");
            if (cleaned.includes("\0")) {
              throw new Error("transform_failed: invalid null byte in " + moduleInfo.id);
            }
            return { id: moduleInfo.id, code: cleaned };
          }
        }

        module.exports = { Transformer, hasOwn, lastItem, sortDesc };
