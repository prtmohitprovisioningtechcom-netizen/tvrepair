const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { downloadAll, upsertMedia, localUrl, SERVICE_FILES } = require("./local-images");

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

const IMG = {
  tv: localUrl("tv-hero.jpg"),
  tech: localUrl("tv-soldering.jpg"),
  living: localUrl("tv-living.jpg"),
};

async function main() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "tvrepair";

  const root = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await root.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await root.end();

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  await conn.query(schema);

  const files = await downloadAll();
  const mediaIds = {};
  for (const file of Object.values(files)) {
    mediaIds[file.filename] = await upsertMedia(conn, file, file.filename.replace(".jpg", "").replace(/-/g, " "));
  }

  const hash = await bcrypt.hash("Admin@12345", 12);
  const [userRes] = await conn.execute(
    "INSERT INTO users (name, email, password_hash, role, status) VALUES (?,?,?,?,?)",
    ["Site Admin", "admin@helixtvcare.com", hash, "admin", "active"],
  );
  const adminId = userRes.insertId;

  const settings = {
    "business.name": "India LED TV Repair Center",
    "business.logo": "",
    "business.favicon": "",
    "business.phone": "085109 51545",
    "business.whatsapp": "918510951545",
    "business.email": "service@helixtvcare.com",
    "business.address": "Shop No 05, Gali No 15, Sector 47, Noida, Uttar Pradesh 201304",
    "business.city": "Noida",
    "business.pincode": "201304",
    "business.maps_url": "https://maps.google.com/?q=Shop+No+05,+Gali+No+15,+Sector+47,+Noida",
    "business.working_hours": "Open 24 hours",
    "contact.emergency": "085109 51545",
    "social.facebook": "https://facebook.com",
    "social.instagram": "https://instagram.com",
    "social.youtube": "https://youtube.com",
    "social.linkedin": "https://linkedin.com",
    "social.twitter": "https://x.com",
    "seo.default_title": "India LED TV Repair Center | Doorstep TV Repair in Delhi NCR",
    "seo.default_description": "Professional LED, LCD, OLED, QLED and Smart TV repair at your doorstep across Noida, Delhi, Ghaziabad, Gurgaon and Faridabad.",
    "seo.default_og_image": IMG.tv,
    "seo.ga": "",
    "seo.gtm": "",
    "seo.gsc": "",
    "footer.copyright": `© ${new Date().getFullYear()} India LED TV Repair Center. All rights reserved.`,
  };
  for (const [key, value] of Object.entries(settings)) {
    const group = key.split(".")[0];
    await conn.execute(
      "INSERT INTO settings (setting_key, setting_value, group_name) VALUES (?,?,?)",
      [key, value, group],
    );
  }

  async function addPage(title, slug, isHome, excerpt, sections, seo) {
    const [res] = await conn.execute(
      "INSERT INTO pages (title, slug, template, status, is_homepage, excerpt, published_at) VALUES (?,?,?,?,?,?,NOW())",
      [title, slug, "default", "published", isHome ? 1 : 0, excerpt],
    );
    const pageId = res.insertId;
    for (const [i, section] of sections.entries()) {
      await conn.execute(
        "INSERT INTO page_sections (page_id, type, title, content, settings, sort_order, is_visible) VALUES (?,?,?,?,?,?,1)",
        [pageId, section.type, section.title || null, JSON.stringify(section.content || {}), JSON.stringify(section.settings || { padding: "lg" }), i],
      );
    }
    await conn.execute(
      "INSERT INTO seo_metadata (entity_type, entity_id, seo_title, meta_description, focus_keyword, canonical_url, robots_index, robots_follow, schema_type) VALUES (?,?,?,?,?,?,1,1,?)",
      [isHome ? "homepage" : "page", pageId, seo.title, seo.desc, seo.kw, `/${isHome ? "" : slug}`, seo.schema || "WebPage"],
    );
    return pageId;
  }

  await addPage(
    "Home",
    "home",
    true,
    "Professional doorstep TV repair across Delhi NCR.",
    [
      {
        type: "hero",
        title: "Hero",
        content: {
          eyebrow: "Delhi NCR · Doorstep service",
          heading: "Professional TV Repair Service at Your Doorstep",
          description: "Repair your LED, LCD, OLED, QLED and Smart TV with experienced technicians, genuine parts and clear pricing.",
          primaryLabel: "Book a Repair",
          primaryHref: "/book-service",
          secondaryLabel: "Call Now",
          secondaryHref: "tel:08510951545",
          image: IMG.tv,
          availabilityText: "Technicians available 7 days a week · Typical arrival under 90 minutes in Noida & Delhi",
          badges: ["Same-day visit", "Genuine spare parts", "90-day workmanship warranty", "All major brands"],
          showBookingForm: true,
        },
      },
      { type: "trust_badges", content: { items: ["Samsung", "LG", "Sony", "Mi", "TCL", "Panasonic", "OnePlus", "Vu"] } },
      {
        type: "features",
        content: {
          heading: "Why households choose us",
          items: [
            { title: "Board-level diagnosis", body: "We isolate panel, backlight, power and software faults before recommending parts.", image: localUrl("tv-soldering.jpg") },
            { title: "Transparent estimates", body: "You approve the repair after inspection. No surprise add-ons on the invoice.", image: localUrl("tv-living.jpg") },
            { title: "Local technicians", body: "Noida, Greater Noida, Delhi, Ghaziabad, Gurgaon and Faridabad coverage.", image: localUrl("tv-watching.jpg") },
          ],
        },
      },
      { type: "services_grid", content: { heading: "TV repair services", limit: 8 } },
      { type: "statistics", content: { items: [{ value: "12,400+", label: "TVs repaired" }, { value: "4.9/5", label: "Customer rating" }, { value: "90 min", label: "Average arrival" }, { value: "7 days", label: "Service window" }] } },
      {
        type: "image_text",
        content: {
          heading: "Expert TV Repair Services",
          body: "Most no-power, no-display and sound faults are recoverable. Our technicians carry common boards, LED strips and tools so many jobs finish in a single visit.",
          image: IMG.tech,
          buttonLabel: "See how we work",
          buttonHref: "/about",
        },
      },
      { type: "testimonials", content: { heading: "What customers say", featuredOnly: true } },
      { type: "faq", content: { heading: "Questions, answered", category: "general" } },
      {
        type: "cta",
        content: {
          heading: "Need a technician today?",
          body: "Share the TV brand and the fault. We will confirm a visit window and send a specialist.",
          primaryLabel: "Book a Repair",
          primaryHref: "/book-service",
          secondaryLabel: "WhatsApp Us",
          secondaryHref: "https://wa.me/919876543210",
        },
      },
    ],
    { title: "Helix TV Care | Doorstep TV Repair in Delhi NCR", desc: "Expert LED, LCD, OLED and Smart TV repair at home. Same-day technicians across Noida, Delhi, Ghaziabad, Gurgaon and Faridabad.", kw: "tv repair noida", schema: "LocalBusiness" },
  );

  await addPage("About", "about", false, "About Helix TV Care", [
    { type: "text", content: { heading: "A specialist TV repair company, not a marketplace of unknown vendors.", body: "Helix TV Care started as a Noida workshop focused on panel, backlight and mainboard faults. We now run a coordinated doorstep network across Delhi NCR with the same diagnostic discipline." } },
    { type: "image_text", content: { heading: "Workshop support when on-site is not enough", body: "Complex panel and motherboard jobs move to the bench. You still get a single point of contact and a written estimate.", image: IMG.living, buttonLabel: "Book service", buttonHref: "/book-service" } },
    { type: "features", content: { heading: "How we work", items: [{ title: "Inspect", body: "Visual and electrical checks before any part is ordered." }, { title: "Confirm", body: "You approve the repair path and cost." }, { title: "Restore", body: "On-site or workshop repair with a workmanship warranty." }] } },
  ], { title: "About Helix TV Care", desc: "Meet the technicians behind doorstep TV repair across Delhi NCR.", kw: "tv repair company noida" });

  await addPage("Services", "services", false, "All TV repair services", [
    { type: "text", content: { heading: "Every common TV fault, handled with a defined process.", body: "Choose a service to see symptoms, coverage areas and booking options." } },
  ], { title: "TV Repair Services | Helix TV Care", desc: "LED, LCD, OLED, QLED, Smart TV, screen, sound and motherboard repair.", kw: "tv repair services" });

  await addPage("TV Repair", "tv-repair", false, "TV repair specialists", [
    { type: "text", content: { heading: "TV repair for every panel type we actually service.", body: "From budget LED sets to premium OLED, we diagnose first and repair with genuine or equivalent-grade parts." } },
  ], { title: "TV Repair | LED LCD OLED Smart TV", desc: "Professional TV repair at your doorstep.", kw: "tv repair" });

  await addPage("Contact", "contact", false, "Contact Helix TV Care", [
    { type: "text", content: { heading: "Talk to the service desk", body: "Calls, WhatsApp and booking forms reach the same coordination team." } },
  ], { title: "Contact Helix TV Care", desc: "Call or WhatsApp for doorstep TV repair.", kw: "tv repair contact" });

  await addPage("Book Service", "book-service", false, "Book a technician", [
    { type: "text", content: { heading: "Request a visit", body: "Share the TV type, size and the fault. We confirm a window before the technician leaves." } },
  ], { title: "Book TV Repair | Helix TV Care", desc: "Schedule doorstep TV repair across Delhi NCR.", kw: "book tv repair" });

  for (const [slug, title, body] of [
    ["privacy-policy", "Privacy Policy", "We collect enquiry details only to fulfil repair bookings. Data is stored securely and is not sold."],
    ["terms-and-conditions", "Terms and Conditions", "Estimates are confirmed after inspection. Warranty covers workmanship for 90 days unless stated otherwise."],
  ]) {
    await addPage(title, slug, false, title, [{ type: "text", content: { heading: title, body } }], { title: `${title} | Helix TV Care`, desc: body, kw: slug });
  }

  const services = [
    ["LED TV Repair", "led-tv-repair", "Backlight, power and board repairs for LED televisions."],
    ["LCD TV Repair", "lcd-tv-repair", "Display, inverter and mainboard repair for LCD TVs."],
    ["Smart TV Repair", "smart-tv-repair", "Software, Wi-Fi, apps and board faults on Smart TVs."],
    ["OLED TV Repair", "oled-tv-repair", "Specialist handling for OLED panel, board and power issues."],
    ["QLED TV Repair", "qled-tv-repair", "QLED backlight, T-con and smart board diagnostics."],
    ["Screen Repair", "screen-repair", "Panel assessment, replacement guidance and related faults."],
    ["Display Problem Repair", "display-problem-repair", "No picture, lines, dim display and colour faults."],
    ["No Power Repair", "no-power-repair", "Dead TV, standby light issues and power board repair."],
    ["Sound Problem Repair", "sound-problem-repair", "No audio, crackling and speaker circuit repair."],
    ["HDMI Problem Repair", "hdmi-problem-repair", "Port, handshake and input switching faults."],
    ["Motherboard Repair", "motherboard-repair", "Mainboard-level repair and replacement where required."],
    ["Backlight Repair", "backlight-repair", "LED strip and driver repairs for dim or dark screens."],
    ["Panel Repair", "panel-repair", "Honest panel diagnosis before any replacement is recommended."],
    ["Software Problem Repair", "software-problem-repair", "Firmware, boot loops and Smart TV OS issues."],
    ["Remote Problem", "remote-problem", "IR, Bluetooth and pairing issues, plus replacement options."],
    ["Installation & Setup", "installation-setup", "Wall mounting, channel setup and smart app configuration."],
  ];

  const serviceIds = [];
  for (const [i, [name, slug, desc]] of services.entries()) {
    const [res] = await conn.execute(
      "INSERT INTO services (name, slug, short_description, description, image_id, benefits, symptoms, is_featured, status, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        name,
        slug,
        desc,
        `${desc} Helix technicians inspect the set at your home, explain the fault in plain language, and complete the repair on-site whenever parts are available.`,
        mediaIds[SERVICE_FILES[slug]] || null,
        JSON.stringify(["Doorstep diagnosis", "Clear estimate before parts", "Warranty on workmanship"]),
        JSON.stringify(["No display", "No power", "Sound issues", "Smart features not loading"]),
        i < 6 ? 1 : 0,
        "published",
        i,
      ],
    );
    serviceIds.push(res.insertId);
    await conn.execute(
      "INSERT INTO service_faqs (service_id, question, answer, sort_order) VALUES (?,?,?,0), (?,?,?,1)",
      [
        res.insertId,
        `How quickly can you attend a ${name.toLowerCase()} request?`,
        "In Noida and Delhi we typically arrive the same day when you book before mid-afternoon.",
        res.insertId,
        `Do you repair all brands for ${name.toLowerCase()}?`,
        "Yes. Samsung, LG, Sony, Mi, TCL, Panasonic and most other brands are covered.",
      ],
    );
    await conn.execute(
      "INSERT INTO seo_metadata (entity_type, entity_id, seo_title, meta_description, focus_keyword, robots_index, robots_follow, schema_type) VALUES ('service',?,?,?,?,1,1,'Service')",
      [res.insertId, `${name} | Doorstep Service | Helix TV Care`, `Professional ${name.toLowerCase()} at home across Delhi NCR.`, name.toLowerCase()],
    );
  }

  const [catRes] = await conn.execute(
    "INSERT INTO blog_categories (name, slug, description) VALUES ('Repair Guides','repair-guides','How-to and diagnostic articles')",
  );
  const posts = [
    ["When a TV has sound but no picture", "tv-sound-no-picture", "Usually a backlight, T-con or panel issue — here is how we tell them apart."],
    ["Is OLED panel replacement worth it?", "oled-panel-replacement", "Honest guidance on cost versus a new set."],
    ["Smart TV software faults we see every week", "smart-tv-software-faults", "Boot loops, missing apps and Wi-Fi dropouts."],
  ];
  for (const [title, slug, excerpt] of posts) {
    const [res] = await conn.execute(
      "INSERT INTO blogs (title, slug, excerpt, content, author_id, category_id, status, published_at) VALUES (?,?,?,?,?,?, 'published', NOW())",
      [title, slug, excerpt, `<p>${excerpt}</p><p>Book a diagnosis if the fault persists after a power cycle and cable check.</p>`, adminId, catRes.insertId],
    );
    await conn.execute(
      "INSERT INTO seo_metadata (entity_type, entity_id, seo_title, meta_description, robots_index, robots_follow, schema_type) VALUES ('blog',?,?,?,1,1,'Article')",
      [res.insertId, `${title} | Helix TV Care`, excerpt],
    );
  }

  const faqs = [
    ["Do you charge for inspection?", "Inspection is explained before the visit. If you proceed with the repair, the call-out is usually adjusted into the job.", "general"],
    ["Which TV brands do you service?", "Samsung, LG, Sony, Mi, TCL, Panasonic, OnePlus, Vu and most other LED/OLED brands.", "general"],
    ["How fast can a technician arrive in Noida?", "Same-day slots are available on most weekdays when you book before mid-afternoon.", "general"],
    ["Is there a warranty?", "Workmanship is covered for 90 days unless a specific part warranty is stated on the invoice.", "general"],
  ];
  for (const [i, [q, a, cat]] of faqs.entries()) {
    await conn.execute("INSERT INTO faqs (question, answer, category, sort_order, status) VALUES (?,?,?,?,'active')", [q, a, cat, i]);
  }

  const reviews = [
    ["Ankit Sharma", 5, "LED backlight repaired the same evening in Sector 62.", "Noida"],
    ["Neha Gupta", 5, "Clear estimate, no upselling, Sony Bravia back on the wall.", "Gurgaon"],
    ["Rahul Verma", 5, "Smart TV software issue fixed without replacing the board.", "Delhi"],
    ["Priya Singh", 4, "Arrived on time in Indirapuram. Sound fault resolved.", "Ghaziabad"],
  ];
  for (const [name, rating, review, loc] of reviews) {
    await conn.execute(
      "INSERT INTO testimonials (customer_name, rating, review, location, review_date, is_featured, status) VALUES (?,?,?,?,CURDATE(),1,'active')",
      [name, rating, review, loc],
    );
  }

  const [header] = await conn.execute("INSERT INTO menus (name, location) VALUES ('Header','header')");
  const [footer] = await conn.execute("INSERT INTO menus (name, location) VALUES ('Footer','footer')");
  const [legal] = await conn.execute("INSERT INTO menus (name, location) VALUES ('Legal','footer_legal')");
  const headerItems = [
    ["Home", "/"],
    ["TV Repair", "/tv-repair"],
    ["Services", "/services"],
    ["About", "/about"],
    ["Blog", "/blog"],
    ["Contact", "/contact"],
  ];
  for (const [i, [label, url]] of headerItems.entries()) {
    await conn.execute("INSERT INTO menu_items (menu_id, label, url, sort_order, is_enabled) VALUES (?,?,?,?,1)", [header.insertId, label, url, i]);
  }
  for (const [i, [label, url]] of headerItems.entries()) {
    await conn.execute("INSERT INTO menu_items (menu_id, label, url, sort_order, is_enabled) VALUES (?,?,?,?,1)", [footer.insertId, label, url, i]);
  }
  const legalItems = [["Privacy Policy", "/privacy-policy"], ["Terms", "/terms-and-conditions"]];
  for (const [i, [label, url]] of legalItems.entries()) {
    await conn.execute("INSERT INTO menu_items (menu_id, label, url, sort_order, is_enabled) VALUES (?,?,?,?,1)", [legal.insertId, label, url, i]);
  }

  await conn.end();
  console.log("Database ready.");
  console.log("Admin login: admin@helixtvcare.com / Admin@12345");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
