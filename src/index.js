const { runApp } = require("./app");

function main() {
  const result = runApp();
  return result;
}

if (require.main === module) {
  console.log(JSON.stringify(main()));
}

module.exports = { main };
