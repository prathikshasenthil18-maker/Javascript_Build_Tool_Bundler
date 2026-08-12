        // src/utils — Node 18 / ES2022
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

        function add(a, b) {
          return Number(a) + Number(b);
        }
        function formatName(name) {
          return String(name || "world");
        }
        module.exports = { add, formatName, hasOwn, lastItem, sortDesc };
