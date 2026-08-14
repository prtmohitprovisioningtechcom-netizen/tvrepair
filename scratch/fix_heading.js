import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const db = await createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await db.query("SELECT * FROM page_sections WHERE type = 'image_text'");
    for (const row of rows) {
      if (typeof row.content === "string") {
        const content = JSON.parse(row.content);
        if (content.heading && content.heading.includes("Repair first")) {
          content.heading = "Expert TV Repair Services";
          await db.query("UPDATE page_sections SET content = ? WHERE id = ?", [JSON.stringify(content), row.id]);
          console.log("Updated section id:", row.id);
        }
      } else {
         if (row.content.heading && row.content.heading.includes("Repair first")) {
          row.content.heading = "Expert TV Repair Services";
          await db.query("UPDATE page_sections SET content = ? WHERE id = ?", [JSON.stringify(row.content), row.id]);
          console.log("Updated section id:", row.id);
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    db.end();
  }
}

main();
