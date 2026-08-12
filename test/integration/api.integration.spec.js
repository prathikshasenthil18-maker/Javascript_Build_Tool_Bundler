const http = require("http");
const path = require("path");
const { expect } = require("chai");
const { createApp } = require("../../backend_js/src/server");
const { request } = require("../helpers/http");

describe("Build API integration", () => {
  let server;
  const root = path.resolve(__dirname, "../..");
  before((done) => {
    const app = createApp(root);
    server = http.createServer(app.handler).listen(0, "127.0.0.1", done);
  });
  after((done) => server.close(done));

  it("health + version + config", async () => {
    const health = await request(server, "GET", "/api/v1/health");
    expect(health.body.status).to.equal("healthy");
    expect(health.body.modules).to.be.at.least(4);
    const version = await request(server, "GET", "/api/v1/version");
    expect(version.body.application).to.equal("JavaScript Build Tool / Bundler");
    expect(version.body.bundler).to.equal("ready");
    expect(version.body.frontend_node).to.not.equal(version.body.backend_node);
    const config = await request(server, "GET", "/api/v1/config");
    expect(config.body.entry).to.equal("src/index.js");
  });

  it("modules graph build stats", async () => {
    const modules = await request(server, "GET", "/api/v1/modules");
    expect(modules.body.count).to.be.at.least(4);
    const graph = await request(server, "GET", "/api/v1/graph");
    expect(graph.body.module_count).to.equal(modules.body.count);
    await request(server, "POST", "/api/v1/clean", {});
    const build = await request(server, "POST", "/api/v1/build", { mode: "development" });
    expect(build.body.status).to.equal("completed");
    const stats = await request(server, "GET", "/api/v1/build/stats");
    expect(stats.body.modules).to.equal(build.body.modules);
    expect(stats.body.output_files).to.be.greaterThan(0);
  });
});
