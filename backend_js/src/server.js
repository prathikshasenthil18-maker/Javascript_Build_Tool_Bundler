const http = require("http");
const path = require("path");
const { BuildApi } = require("./BuildApi");
const { BACKEND_NODE, BRANCH } = require("./version");

function send(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(raw);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

function createApp(root) {
  const api = new BuildApi(root);
  async function handler(req, res) {
    if (req.method === "OPTIONS") return send(res, 204, {});
    const url = new URL(req.url, "http://127.0.0.1");
    const p = url.pathname;
    try {
      if (req.method === "GET" && p === "/api/v1/health") return send(res, 200, api.health());
      if (req.method === "GET" && p === "/api/v1/version") return send(res, 200, api.version());
      if (req.method === "GET" && p === "/api/v1/config") return send(res, 200, api.config());
      if (req.method === "GET" && p === "/api/v1/modules") return send(res, 200, api.modules());
      if (req.method === "GET" && p === "/api/v1/graph") return send(res, 200, api.graph());
      if (req.method === "GET" && p === "/api/v1/build/status") return send(res, 200, api.status());
      if (req.method === "GET" && p === "/api/v1/build/stats") return send(res, 200, api.stats());
      if (req.method === "POST" && p === "/api/v1/build") {
        const body = await readBody(req);
        return send(res, 200, api.build(body));
      }
      if (req.method === "POST" && p === "/api/v1/clean") return send(res, 200, api.clean());
      return send(res, 404, { error: "not_found", path: p });
    } catch (err) {
      return send(res, 500, {
        error: err.code || "server_error",
        message: err.message || String(err),
        cycles: err.cycles || null,
      });
    }
  }
  return { handler, api };
}

function start(port) {
  const root = path.resolve(__dirname, "../..");
  const app = createApp(root);
  const server = http.createServer(app.handler);
  const listenPort = Number(port || process.env.PORT || 3000);
  server.listen(listenPort, "127.0.0.1", () => {
    console.log("[bundler-backend] listening", listenPort, "BE Node", BACKEND_NODE, BRANCH);
  });
  return server;
}

if (require.main === module) start();
module.exports = { createApp, start };
