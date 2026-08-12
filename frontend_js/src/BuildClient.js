const API = "/api/v1";

async function getJson(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error("http_" + res.status);
  return res.json();
}

async function postJson(path, body) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error("http_" + res.status);
  return res.json();
}

export const BuildClient = {
  health: () => getJson("/health"),
  version: () => getJson("/version"),
  config: () => getJson("/config"),
  modules: () => getJson("/modules"),
  graph: () => getJson("/graph"),
  status: () => getJson("/build/status"),
  stats: () => getJson("/build/stats"),
  build: (body) => postJson("/build", body || {}),
  clean: () => postJson("/clean", {}),
};
