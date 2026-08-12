const http = require("http");
const fs = require("fs");
const path = require("path");
const { expect } = require("chai");
const { createApp } = require("../../backend_js/src/server");
const { request } = require("../helpers/http");

describe("Bundler E2E validation", () => {
  let server;
  const root = path.resolve(__dirname, "../..");
  before((done) => {
    const app = createApp(root);
    server = http.createServer(app.handler).listen(0, "127.0.0.1", done);
  });
  after((done) => server.close(done));

  it("source -> graph -> dev/prod bundle -> assets -> cache -> execute", async () => {
    await request(server, "POST", "/api/v1/clean", {});
    const modules = await request(server, "GET", "/api/v1/modules");
    expect(modules.body.count).to.be.at.least(4);

    const graph = await request(server, "GET", "/api/v1/graph");
    expect(graph.body.dependency_count).to.be.greaterThan(0);

    const dev = await request(server, "POST", "/api/v1/build", { mode: "development" });
    expect(dev.body.status).to.equal("completed");
    expect(dev.body.assets).to.be.at.least(2);
    expect(fs.existsSync(path.join(root, "dist/bundle.js"))).to.equal(true);
    expect(fs.existsSync(path.join(root, "dist/styles.css"))).to.equal(true);
    expect(fs.existsSync(path.join(root, "dist/sample.txt"))).to.equal(true);

    const prod = await request(server, "POST", "/api/v1/build", { mode: "production" });
    expect(prod.body.status).to.equal("completed");
    expect(fs.existsSync(path.join(root, "dist/bundle.js.map"))).to.equal(true);
    const prodJs = fs.readFileSync(path.join(root, "dist/bundle.js"), "utf8");
    expect(prodJs).to.include("sourceMappingURL");

    // cache: rebuild same production sources should produce hits
    const again = await request(server, "POST", "/api/v1/build", { mode: "production" });
    expect(again.body.cache_hits).to.be.greaterThan(0);

    // execute generated bundle
    const result = require(path.join(root, "dist/bundle.js"));
    expect(result.main).to.be.a("function");
    const out = result.main();
    expect(out.message).to.equal("hello Ada");
    expect(out.sum).to.equal(5);
    expect(out.ui).to.include("button");

    // invalidate cache by changing source then rebuilding
    const utilsPath = path.join(root, "src/utils.js");
    const original = fs.readFileSync(utilsPath, "utf8");
    fs.writeFileSync(utilsPath, original + "\n// cache-bust\n", "utf8");
    try {
      const busted = await request(server, "POST", "/api/v1/build", { mode: "production" });
      expect(busted.body.cache_misses).to.be.greaterThan(0);
    } finally {
      fs.writeFileSync(utilsPath, original, "utf8");
    }

    const stats = await request(server, "GET", "/api/v1/build/stats");
    expect(stats.body.modules).to.be.at.least(4);
    const version = await request(server, "GET", "/api/v1/version");
    expect(version.body.branch).to.match(/^JS_FE\d+_BE\d+$/);
  });
});
