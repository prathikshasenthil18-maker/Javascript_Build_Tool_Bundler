#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const EXPECTED = { fe: 20, be: 22, branch: "JS_FE20_BE22" };

function parseBranch(name) {
  const m = String(name || "").match(/^JS_FE(\d+)_BE(\d+)$/);
  if (!m) throw new Error("invalid_branch: " + name);
  const fe = Number(m[1]);
  const be = Number(m[2]);
  if (fe === be) throw new Error("same_version_forbidden: " + name);
  return { fe, be, branch: name };
}
function detectBranch() {
  try {
    return execSync("git branch --show-current", { encoding: "utf8" }).trim();
  } catch {
    return process.env.BUNDLER_BRANCH || EXPECTED.branch;
  }
}
function npmCmd() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}
function run(cmd, cwd) {
  console.log("[build]", cmd, cwd ? "(cwd=" + cwd + ")" : "");
  execSync(cmd, {
    stdio: "inherit",
    cwd: cwd || process.cwd(),
    env: process.env,
    windowsHide: true,
    shell: true,
  });
}
function main() {
  const args = new Set(process.argv.slice(2));
  const detected = detectBranch() || EXPECTED.branch;
  const parsed = parseBranch(detected);
  if (parsed.fe === parsed.be) throw new Error("FE_BE_must_differ");
  if (parsed.fe !== EXPECTED.fe || parsed.be !== EXPECTED.be) {
    console.warn("[build] branch versions differ from package embedding", parsed, EXPECTED);
  }
  const report = {
    branch: parsed.branch,
    frontend_node: parsed.fe,
    backend_node: parsed.be,
    host_node: process.versions.node,
    validate: "PASS",
  };
  console.log(JSON.stringify({ ok: true, ...report }, null, 2));
  if (args.has("--validate-only")) return;
  const npm = npmCmd();
  run(npm + " install", path.join(process.cwd(), "frontend_js"));
  run(npm + " run build", path.join(process.cwd(), "frontend_js"));
  run("node --check backend_js/src/server.js");
  run("node --check src/index.js");
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/build-report.json", JSON.stringify(report, null, 2));
  console.log("[build] PASS");
}
main();
