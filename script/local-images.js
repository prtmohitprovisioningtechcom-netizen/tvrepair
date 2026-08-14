const fs = require("fs");
const path = require("path");

const FOLDER = "images/site";
const PUBLIC_DIR = path.join(__dirname, "..", "public", FOLDER);

const FILES = {
  "tv-hero.jpg": "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=80",
  "tv-living.jpg": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80",
  "tv-wall.jpg": "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1400&q=80",
  "tv-watching.jpg": "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1400&q=80",
  "tv-smart.jpg": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1400&q=80",
  "tv-screen.jpg": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1400&q=80",
  "tv-circuit.jpg": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
  "tv-soldering.jpg": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1400&q=80",
  "tv-bench.jpg": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=80",
  "tv-tools.jpg": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1400&q=80",
  "tv-interior.jpg": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
  "tv-remote.jpg": "https://images.unsplash.com/photo-1601944177325-f8867652837f?auto=format&fit=crop&w=1400&q=80",
  "tv-audio.jpg": "https://images.unsplash.com/photo-1635788798247-92a15f830a3b?auto=format&fit=crop&w=1400&q=80",
};

const SERVICE_FILES = {
  "led-tv-repair": "tv-hero.jpg",
  "lcd-tv-repair": "tv-living.jpg",
  "smart-tv-repair": "tv-smart.jpg",
  "oled-tv-repair": "tv-wall.jpg",
  "qled-tv-repair": "tv-watching.jpg",
  "screen-repair": "tv-screen.jpg",
  "display-problem-repair": "tv-watching.jpg",
  "no-power-repair": "tv-circuit.jpg",
  "sound-problem-repair": "tv-audio.jpg",
  "hdmi-problem-repair": "tv-tools.jpg",
  "motherboard-repair": "tv-soldering.jpg",
  "backlight-repair": "tv-screen.jpg",
  "panel-repair": "tv-wall.jpg",
  "software-problem-repair": "tv-smart.jpg",
  "remote-problem": "tv-remote.jpg",
  "installation-setup": "tv-interior.jpg",
};

const UNSPLASH_TO_FILE = {
  "photo-1593784991095-a205069470b6": "tv-hero.jpg",
  "photo-1555041469-a586c61ea9bc": "tv-living.jpg",
  "photo-1461151304267-38535e780c79": "tv-wall.jpg",
  "photo-1522869635100-9f4c5e86aa37": "tv-watching.jpg",
  "photo-1574375927938-d5a98e8ffe85": "tv-smart.jpg",
  "photo-1593359677879-a4bb92f829d1": "tv-screen.jpg",
  "photo-1518770660439-4636190af475": "tv-circuit.jpg",
  "photo-1581092160562-40aa08e78837": "tv-soldering.jpg",
  "photo-1581091226825-a6a2a5aee158": "tv-soldering.jpg",
  "photo-1581092918056-0c4c3acd3789": "tv-bench.jpg",
  "photo-1504148455328-c376907d081c": "tv-tools.jpg",
  "photo-1560448204-e02f11c3d0e2": "tv-interior.jpg",
  "photo-1601944177325-f8867652837f": "tv-remote.jpg",
  "photo-1635788798247-92a15f830a3b": "tv-audio.jpg",
};

function localUrl(filename) {
  return `/${FOLDER}/${filename}`;
}

async function downloadAll() {
  await fs.promises.mkdir(PUBLIC_DIR, { recursive: true });
  const saved = {};
  for (const [filename, url] of Object.entries(FILES)) {
    const dest = path.join(PUBLIC_DIR, filename);
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
      const res = await fetch(url, { headers: { "User-Agent": "HelixTVCare/1.0" } });
      if (!res.ok) {
        const fallback = Object.keys(saved)[0];
        if (!fallback) throw new Error(`Could not download ${filename} (${res.status})`);
        await fs.promises.copyFile(path.join(PUBLIC_DIR, fallback), dest);
      } else {
        await fs.promises.writeFile(dest, Buffer.from(await res.arrayBuffer()));
      }
    }
    const stat = fs.statSync(dest);
    saved[filename] = {
      filename,
      original_name: filename,
      url: localUrl(filename),
      path: `${FOLDER}/${filename}`,
      mime_type: "image/jpeg",
      size: stat.size,
    };
  }
  return saved;
}

async function upsertMedia(conn, file, title) {
  const [rows] = await conn.execute("SELECT id FROM media WHERE url = ? LIMIT 1", [file.url]);
  if (rows.length) return rows[0].id;
  const [res] = await conn.execute(
    `INSERT INTO media (filename, original_name, url, path, mime_type, size, alt_text, title)
     VALUES (?,?,?,?,?,?,?,?)`,
    [file.filename, file.original_name, file.url, file.path, file.mime_type, file.size, title || file.filename, title || file.filename],
  );
  return res.insertId;
}

function replaceUnsplashUrls(value) {
  if (typeof value !== "string") return value;
  if (!value.includes("unsplash.com")) return value;
  for (const [photo, filename] of Object.entries(UNSPLASH_TO_FILE)) {
    if (value.includes(photo)) return localUrl(filename);
  }
  return localUrl("tv-hero.jpg");
}

function rewriteContent(content) {
  if (content == null) return content;
  if (typeof content === "string") {
    try {
      return rewriteContent(JSON.parse(content));
    } catch {
      return replaceUnsplashUrls(content);
    }
  }
  if (Array.isArray(content)) return content.map(rewriteContent);
  if (typeof content === "object") {
    const next = {};
    for (const [key, value] of Object.entries(content)) next[key] = rewriteContent(value);
    return next;
  }
  return content;
}

module.exports = {
  FOLDER,
  FILES,
  SERVICE_FILES,
  downloadAll,
  upsertMedia,
  localUrl,
  replaceUnsplashUrls,
  rewriteContent,
};
