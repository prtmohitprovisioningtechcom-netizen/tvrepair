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

  const requiredServices = [
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

  for (let i = 0; i < requiredServices.length; i++) {
    const name = requiredServices[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if exists
    const [rows] = await conn.execute("SELECT id FROM services WHERE slug = ?", [slug]);
    if (rows.length > 0) {
      console.log(`Service '${name}' already exists (slug: ${slug}). Skipping.`);
      continue;
    }

    const desc = `Professional ${name} service by experienced technicians.`;
    const fullDesc = `${desc} Helix technicians inspect the set at your home, explain the fault in plain language, and complete the repair on-site whenever parts are available.`;
    const benefits = JSON.stringify(["Doorstep diagnosis", "Clear estimate before parts", "Warranty on workmanship"]);
    const symptoms = JSON.stringify(["No display", "No power", "Sound issues", "Smart features not loading"]);
    
    // Get max sort_order
    const [maxSortRows] = await conn.execute("SELECT MAX(sort_order) as max_sort FROM services");
    const sortOrder = (maxSortRows[0].max_sort || 0) + 1;

    const [res] = await conn.execute(
      "INSERT INTO services (name, slug, short_description, description, benefits, symptoms, is_featured, status, sort_order) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        name,
        slug,
        desc,
        fullDesc,
        benefits,
        symptoms,
        0, // not featured by default
        "published",
        sortOrder
      ]
    );
    const serviceId = res.insertId;

    await conn.execute(
      "INSERT INTO service_faqs (service_id, question, answer, sort_order) VALUES (?,?,?,0), (?,?,?,1)",
      [
        serviceId,
        `How quickly can you attend a ${name.toLowerCase()} request?`,
        "In Noida and Delhi we typically arrive the same day when you book before mid-afternoon.",
        serviceId,
        `Do you repair all brands for ${name.toLowerCase()}?`,
        "Yes. Samsung, LG, Sony, Mi, TCL, Panasonic and most other brands are covered.",
      ]
    );

    await conn.execute(
      "INSERT INTO seo_metadata (entity_type, entity_id, seo_title, meta_description, focus_keyword, robots_index, robots_follow, schema_type) VALUES ('service',?,?,?,?,1,1,'Service')",
      [serviceId, `${name} | Doorstep Service | Helix TV Care`, `Professional ${name.toLowerCase()} at home across Delhi NCR.`, name.toLowerCase()]
    );

    console.log(`Added service '${name}' (slug: ${slug}).`);
  }

  await conn.end();
  console.log("Done.");
}

main().catch(console.error);
