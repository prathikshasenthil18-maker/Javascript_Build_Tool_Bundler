const path = require("path");
const { expect } = require("chai");
const { ModuleResolver } = require("../../backend_js/src/ModuleResolver");
const { ModuleGraph } = require("../../backend_js/src/ModuleGraph");

describe("ModuleResolver + ModuleGraph", () => {
  const root = path.resolve(__dirname, "../..");
  it("discovers modules from entry without hard-coding names", () => {
    const discovery = new ModuleResolver(root).discover("src/index.js");
    expect(discovery.count).to.be.at.least(4);
    const ids = discovery.modules.map((m) => m.id);
    expect(ids).to.include("src/index.js");
    expect(ids).to.include("src/app.js");
    expect(ids).to.include("src/utils.js");
    expect(ids).to.include("src/components/Button.js");
  });
  it("builds graph and detects cycles", () => {
    const discovery = new ModuleResolver(root).discover("src/index.js");
    const graph = new ModuleGraph().build(discovery, { circular: "error" });
    expect(graph.module_count).to.equal(discovery.count);
    expect(graph.dependency_count).to.be.greaterThan(0);
    const cyclic = {
      entry: "a.js",
      modules: [
        { id: "a.js", deps: ["b.js"], code: "" },
        { id: "b.js", deps: ["a.js"], code: "" },
      ],
    };
    expect(() => new ModuleGraph().build(cyclic, { circular: "error" })).to.throw(/circular_dependency/);
  });
});
