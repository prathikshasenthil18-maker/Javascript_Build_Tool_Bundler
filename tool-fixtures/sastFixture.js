const { exec } = require("child_process");
function runDiagnostics(hostname) { exec("ping -c 1 " + hostname); }
function evaluateExpression(expr) { return eval(expr); }
module.exports = { runDiagnostics, evaluateExpression };
