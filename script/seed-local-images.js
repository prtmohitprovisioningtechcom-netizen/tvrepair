const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const {
  SERVICE_FILES,
  downloadAll,
  upsertMedia,
  rewriteContent,
  localUrl,
} = require("./local-images");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const FEATURE_FILES = ["tv-soldering.jpg", "tv-living.jpg", "tv-watching.jpg"];

async function main() {
  const files = await downloadAll();
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tvrepair",
  });

  const mediaIds = {};
  for (const file of Object.values(files)) {
    mediaIds[file.filename] = await upsertMedia(conn, file, file.filename.replace(".jpg", "").replace(/-/g, " "));
  }

  const [services] = await conn.execute("SELECT id, slug, image_id FROM services");
  for (const service of services) {
    const filename = SERVICE_FILES[service.slug];
    if (!filename || !mediaIds[filename]) continue;
    await conn.execute("UPDATE services SET image_id = ? WHERE id = ?", [mediaIds[filename], service.id]);
  }

  const [sections] = await conn.execute("SELECT id, type, content FROM page_sections");
  for (const section of sections) {
    let content = section.content;
    if (typeof content === "string") {
      try {
        content = JSON.parse(content);
      } catch {
        continue;
      }
    }
    content = rewriteContent(content);
    if (section.type === "features" && Array.isArray(content.items)) {
      content.items = content.items.map((item, i) => ({
        ...item,
        image: item.image && !String(item.image).includes("unsplash.com")
          ? item.image
          : localUrl(FEATURE_FILES[i % FEATURE_FILES.length]),
      }));
    }
    await conn.execute("UPDATE page_sections SET content = ? WHERE id = ?", [JSON.stringify(content), section.id]);
  }

  const [settings] = await conn.execute("SELECT setting_key, setting_value FROM settings WHERE setting_value LIKE '%unsplash.com%'");
  for (const row of settings) {
    const next = rewriteContent(row.setting_value);
    if (next !== row.setting_value) {
      await conn.execute("UPDATE settings SET setting_value = ? WHERE setting_key = ?", [next, row.setting_key]);
    }
  }

  await conn.end();
  console.log(`Saved ${Object.keys(files).length} local photos and linked them in admin media.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
