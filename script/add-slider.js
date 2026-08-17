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

async function run() {
  loadEnv();
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tvrepair"
  });

  console.log("Checking home page...");
  const [pages] = await conn.query("SELECT id FROM pages WHERE slug = 'home'");
  if (!pages.length) {
    console.log("Home page not found");
    return;
  }
  const pageId = pages[0].id;

  const [sections] = await conn.query("SELECT sort_order FROM page_sections WHERE page_id = ? AND type = 'features'", [pageId]);
  let sortOrder = 3;
  if (sections.length) {
    sortOrder = sections[0].sort_order;
    // Shift everything down
    await conn.execute("UPDATE page_sections SET sort_order = sort_order + 1 WHERE page_id = ? AND sort_order >= ?", [pageId, sortOrder]);
  }

  // Pre-fill with a placeholder image so it's visible on the frontend
  const content = { images: ["/uploads/tv-hero.jpg"] };
  await conn.execute(
    "INSERT INTO page_sections (page_id, type, title, content, settings, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [pageId, "offer_slider", "Offer Slider", JSON.stringify(content), JSON.stringify({ padding: "lg" }), sortOrder, 1]
  );
  
  await conn.end();
  console.log("Offer slider added to home page successfully!");
  process.exit(0);
}

run().catch(console.error);
