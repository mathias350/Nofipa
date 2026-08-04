import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(join(__dirname, "..", ".env"));

const API_BASE = "https://a.klaviyo.com/api";
const REVISION = "2024-10-15";

function loadEnv(path) {
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function apiKey() {
  const key = process.env.KLAVIYO_API_KEY;
  if (!key) {
    console.error("Mangler KLAVIYO_API_KEY i .env");
    process.exit(1);
  }
  return key;
}

async function klaviyoFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey()}`,
      revision: REVISION,
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Klaviyo API ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function listTemplates() {
  const data = await klaviyoFetch("/templates/?page[size]=10");
  for (const t of data.data) {
    console.log(`${t.id}  ${t.attributes.name}`);
  }
}

async function getTemplate(id) {
  const data = await klaviyoFetch(`/templates/${id}/`);
  return data.data;
}

async function preview(id, outPath) {
  const template = await getTemplate(id);
  const html = template.attributes.html;
  const out = outPath || join(__dirname, "..", "previews", `${id}.html`);
  writeFileSync(out, html, "utf8");
  console.log(`Preview gemt (lokalt, ikke live): ${out}`);
}

async function update(id, htmlPath) {
  const html = readFileSync(htmlPath, "utf8");
  await klaviyoFetch(`/templates/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      data: {
        type: "template",
        id,
        attributes: { html },
      },
    }),
  });
  console.log(`Template ${id} er nu opdateret LIVE i Klaviyo.`);
}

const [, , cmd, ...args] = process.argv;

try {
  if (cmd === "list") {
    await listTemplates();
  } else if (cmd === "get") {
    const t = await getTemplate(args[0]);
    console.log(JSON.stringify(t, null, 2));
  } else if (cmd === "preview") {
    await preview(args[0], args[1]);
  } else if (cmd === "update") {
    await update(args[0], args[1]);
  } else {
    console.log("Brug: node scripts/klaviyo.mjs <list|get|preview|update> [args]");
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
