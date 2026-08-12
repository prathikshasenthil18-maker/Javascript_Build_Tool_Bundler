const path = require("path");
const fs = require("fs");
const { expect } = require("chai");
const { BuildOrchestrator } = require("../../backend_js/src/BuildOrchestrator");
const { Transformer } = require("../../backend_js/src/Transformer");
const { Optimizer } = require("../../backend_js/src/Optimizer");
const { BuildCache } = require("../../backend_js/src/BuildCache");

describe("Transformer Optimizer Cache Orchestrator", () => {
  const root = path.resolve(__dirname, "../..");
  it("transforms and minifies", () => {
    const t = new Transformer().transform({ id: "x.js", code: "const a = 1; /*#__PURE__*/ a;" });
    expect(t.code).to.include("const a");
    const opt = new Optimizer();
    const min = opt.minifyJs("function  hello ( ) { return  1 ; }", true);
    expect(min.length).to.be.below("function  hello ( ) { return  1 ; }".length);
    expect(opt.minifyCss("body {  color:  red; }", true)).to.equal("body{color:red;}");
  });
  it("cache hit/miss based on content", () => {
    const dir = path.join(root, "cache");
    const cache = new BuildCache(dir);
    cache.clear();
    const first = cache.get("hello");
    expect(first.hit).to.equal(false);
    cache.set(first.hash, "transformed");
    const second = cache.get("hello");
    expect(second.hit).to.equal(true);
    expect(second.code).to.equal("transformed");
  });
  it("development and production builds write outputs", () => {
    const orch = new BuildOrchestrator(root);
    orch.clean();
    const dev = orch.build({ mode: "development" });
    expect(dev.status).to.equal("completed");
    expect(fs.existsSync(path.join(root, "dist/bundle.js"))).to.equal(true);
    expect(fs.existsSync(path.join(root, "dist/styles.css"))).to.equal(true);
    expect(fs.existsSync(path.join(root, "dist/sample.txt"))).to.equal(true);
    const prod = orch.build({ mode: "production" });
    expect(prod.status).to.equal("completed");
    expect(fs.existsSync(path.join(root, "dist/bundle.js.map"))).to.equal(true);
    const prodCode = fs.readFileSync(path.join(root, "dist/bundle.js"), "utf8");
    const devCode = fs.readFileSync(path.join(root, "dist/bundle.js"), "utf8");
    void devCode;
    expect(prodCode).to.include("sourceMappingURL");
  });
});
