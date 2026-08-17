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
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "tvrepair";

  const conn = await mysql.createConnection({ host, port, user, password, database });

  const exactList = [
    "TV Repair",
    "LED TV Repair",
    "Smart TV Repair",
    "TV Repair in Noida",
    "LED TV Repair in Noida",
    "TV Repair Near Me",
    "LED TV Repair near me",
    "TV Backlight Repair",
    "LED TV Backlight Repair",
    "TV Power Supply Repair",
    "LED TV Motherboard Repair",
    "TV Motherboard Repair",
    "TV Display Repair",
    "LED TV Display Repair",
    "TV Display Replacement",
    "LED TV Display Replacement"
  ];

  const allowedSlugsMap = new Map();
  for (const name of exactList) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    allowedSlugsMap.set(slug, name);
  }

  const [allServices] = await conn.execute("SELECT id, name, slug FROM services");
  
  const toDelete = [];
  const toUpdate = [];

  for (const service of allServices) {
    if (allowedSlugsMap.has(service.slug)) {
      const correctName = allowedSlugsMap.get(service.slug);
      if (service.name !== correctName) {
        toUpdate.push({ id: service.id, newName: correctName });
      }
    } else {
      toDelete.push(service.id);
    }
  }

  // Delete unwanted services
  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} unused services...`);
    // Delete from related tables first to avoid FK constraints just in case
    const placeholders = toDelete.map(() => '?').join(',');
    await conn.execute(`DELETE FROM service_faqs WHERE service_id IN (${placeholders})`, toDelete);
    await conn.execute(`DELETE FROM seo_metadata WHERE entity_type='service' AND entity_id IN (${placeholders})`, toDelete);
    await conn.execute(`DELETE FROM services WHERE id IN (${placeholders})`, toDelete);
  } else {
    console.log("No extra services found to delete.");
  }

  // Update names if necessary
  if (toUpdate.length > 0) {
    console.log(`Updating names for ${toUpdate.length} services...`);
    for (const update of toUpdate) {
      await conn.execute("UPDATE services SET name = ? WHERE id = ?", [update.newName, update.id]);
      console.log(`Updated ID ${update.id} to "${update.newName}"`);
    }
  }

  await conn.end();
  console.log("Cleanup complete. Exact list is preserved.");
}

main().catch(console.error);
