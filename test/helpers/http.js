const http = require("http");
function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = body == null ? null : JSON.stringify(body);
    const req = http.request(
      {
        host: addr.address,
        port: addr.port,
        path,
        method,
        headers: payload
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try { json = text ? JSON.parse(text) : null; } catch { json = text; }
          resolve({ statusCode: res.statusCode, body: json });
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}
module.exports = { request };
