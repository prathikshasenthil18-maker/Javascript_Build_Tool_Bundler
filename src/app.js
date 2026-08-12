const { add, formatName } = require("./utils");
const { renderButton } = require("./components/Button");

function runApp() {
  const name = formatName("Ada");
  const sum = add(2, 3);
  return {
    message: "hello " + name,
    sum,
    ui: renderButton("Go"),
  };
}

module.exports = { runApp };
