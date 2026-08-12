        // src/utils — Node 20 / ES2023
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

        function add(a, b) {
          return Number(a) + Number(b);
        }
        function formatName(name) {
          return String(name || "world");
        }
        module.exports = { add, formatName, hasOwn, lastItem, sortDesc };
