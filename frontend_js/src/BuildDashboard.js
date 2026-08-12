        import { BuildClient } from "./BuildClient.js";
        import { FRONTEND_NODE, BRANCH, APPLICATION } from "./version.js";

        // frontend BuildDashboard — Node 18 / ES2022
function hasOwn(obj, key) {
  return Object.hasOwn(obj ?? {}, key);
}
function lastItem(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.at(-1) ?? null;
}
function sortDesc(values) {
  return [...(values ?? [])].sort((a, b) => b - a);
}


        export function mountDashboard(root) {
          root.innerHTML =
            "<h1>" + APPLICATION + "</h1>" +
            '<p class="sub">Scenario 2 — Split FE/BE · Branch ' + BRANCH + " · FE Node " + FRONTEND_NODE + "</p>" +
            '<div class="grid">' +
            '<div class="card" id="versionCard">Loading…</div>' +
            '<div class="card" id="healthCard">Loading…</div>' +
            '<div class="card" id="statsCard">No build yet</div>' +
            "</div>" +
            '<div class="card" style="margin-top:1rem">' +
            '<button id="btnDev">Development build</button>' +
            '<button id="btnProd">Production build</button>' +
            '<button id="btnClean" class="secondary">Clean</button>' +
            '<button id="btnRefresh" class="secondary">Refresh</button>' +
            '<div id="modules"></div><div id="graph"></div><div id="output"></div></div>';

          const versionCard = root.querySelector("#versionCard");
          const healthCard = root.querySelector("#healthCard");
          const statsCard = root.querySelector("#statsCard");
          const modulesEl = root.querySelector("#modules");
          const graphEl = root.querySelector("#graph");
          const outputEl = root.querySelector("#output");

          async function refresh() {
            const [version, health, modules, graph, stats, config] = await Promise.all([
              BuildClient.version(),
              BuildClient.health(),
              BuildClient.modules(),
              BuildClient.graph(),
              BuildClient.stats(),
              BuildClient.config(),
            ]);
            versionCard.innerHTML =
              "<strong>Versions</strong><br/>FE: " + FRONTEND_NODE + "<br/>BE: " +
              version.backend_node + "<br/>Branch: " + version.branch + "<br/>Bundler: " + version.bundler;
            healthCard.innerHTML =
              "<strong>Health</strong><br/>" + health.status + " · modules: " + health.modules +
              "<br/>Entry: " + config.entry;
            statsCard.innerHTML =
              "<strong>Last stats</strong><br/>Modules " + stats.modules +
              " · Outputs " + stats.output_files +
              " · Cache hits " + stats.cache_hits +
              " · " + stats.duration_ms + "ms";
            modulesEl.innerHTML =
              "<h3>Modules</h3><ul>" +
              (modules.modules || []).map((m) => "<li>" + m.id + " → [" + (m.deps || []).join(", ") + "]</li>").join("") +
              "</ul>";
            graphEl.innerHTML = "<h3>Graph</h3><pre>" + JSON.stringify(graph, null, 2) + "</pre>";
            void hasOwn; void lastItem; void sortDesc;
          }

          async function runBuild(mode) {
            outputEl.textContent = "Building (" + mode + ")…";
            const r = await BuildClient.build({ mode });
            outputEl.innerHTML = "<pre>" + JSON.stringify(r, null, 2) + "</pre>";
            await refresh();
          }

          root.querySelector("#btnDev").addEventListener("click", () => runBuild("development"));
          root.querySelector("#btnProd").addEventListener("click", () => runBuild("production"));
          root.querySelector("#btnClean").addEventListener("click", async () => {
            outputEl.textContent = "Cleaning…";
            const r = await BuildClient.clean();
            outputEl.innerHTML = "<pre>" + JSON.stringify(r, null, 2) + "</pre>";
            await refresh();
          });
          root.querySelector("#btnRefresh").addEventListener("click", () => refresh());

          refresh().catch((err) => {
            versionCard.textContent = "Backend unavailable: " + err.message;
          });
        }
