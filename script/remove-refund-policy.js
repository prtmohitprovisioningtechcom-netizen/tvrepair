const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

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

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tvrepair",
  });

  await conn.execute("DELETE FROM menu_items WHERE url IN (?, ?) OR label IN (?, ?)", [
    "/refund-policy",
    "/refunds",
    "Refunds",
    "Refund Policy",
  ]);
  await conn.execute(
    "DELETE s FROM seo_metadata s INNER JOIN pages p ON s.entity_id = p.id AND s.entity_type = 'page' WHERE p.slug = 'refund-policy'",
  );
  await conn.execute("DELETE FROM pages WHERE slug = 'refund-policy'");
  await conn.end();
  console.log("Refund policy removed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
