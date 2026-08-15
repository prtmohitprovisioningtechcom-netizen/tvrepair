const BASE = "/images/site";

export const SITE_IMAGES = {
  hero: `${BASE}/tv-hero.jpg`,
  living: `${BASE}/tv-living.jpg`,
  wallTv: `${BASE}/tv-wall.jpg`,
  watching: `${BASE}/tv-watching.jpg`,
  smart: `${BASE}/tv-smart.jpg`,
  screen: `${BASE}/tv-screen.jpg`,
  circuit: `${BASE}/tv-circuit.jpg`,
  soldering: `${BASE}/tv-soldering.jpg`,
  bench: `${BASE}/tv-bench.jpg`,
  tools: `${BASE}/tv-tools.jpg`,
  interior: `${BASE}/tv-interior.jpg`,
  remote: `${BASE}/tv-remote.jpg`,
  audio: `${BASE}/tv-audio.jpg`,
};

const SERVICE_PHOTOS: Record<string, string> = {
  "led-tv-repair": SITE_IMAGES.hero,
  "lcd-tv-repair": SITE_IMAGES.living,
  "smart-tv-repair": SITE_IMAGES.smart,
  "oled-tv-repair": SITE_IMAGES.wallTv,
  "qled-tv-repair": SITE_IMAGES.watching,
  "screen-repair": SITE_IMAGES.screen,
  "display-problem-repair": SITE_IMAGES.watching,
  "no-power-repair": SITE_IMAGES.circuit,
  "sound-problem-repair": SITE_IMAGES.audio,
  "hdmi-problem-repair": SITE_IMAGES.tools,
  "motherboard-repair": SITE_IMAGES.soldering,
  "backlight-repair": SITE_IMAGES.screen,
  "panel-repair": SITE_IMAGES.wallTv,
  "software-problem-repair": SITE_IMAGES.smart,
  "remote-problem": SITE_IMAGES.remote,
  "installation-setup": SITE_IMAGES.interior,
};

export function servicePhoto(slug: string) {
  return SERVICE_PHOTOS[slug.toLowerCase()] || SITE_IMAGES.hero;
}

const UNSPLASH_LOCAL: Record<string, string> = {
  "1581091226825": SITE_IMAGES.soldering,
  "1581092160562": SITE_IMAGES.soldering,
  "1593784991095": SITE_IMAGES.hero,
  "1555041469": SITE_IMAGES.living,
  "1461151304267": SITE_IMAGES.wallTv,
  "1522869635100": SITE_IMAGES.watching,
  "1574375927938": SITE_IMAGES.smart,
  "1593359677879": SITE_IMAGES.screen,
  "1518770660439": SITE_IMAGES.circuit,
  "1581092918056": SITE_IMAGES.bench,
  "1504148455328": SITE_IMAGES.tools,
  "1560448204": SITE_IMAGES.interior,
  "1601944177325": SITE_IMAGES.remote,
  "1635788798247": SITE_IMAGES.audio,
};

export function resolveWorkImage(src?: string | null) {
  if (!src) return "";
  let value = src.trim();
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      value = value.replace(/^https?:\/\/[^/]+/i, "");
    }
  }
  if (!value.includes("unsplash.com") && !value.includes("plus.unsplash.com")) return value;
  for (const [id, local] of Object.entries(UNSPLASH_LOCAL)) {
    if (value.includes(id)) return local;
  }
  return SITE_IMAGES.hero;
}

export const WORK_SHOTS = [
  { src: SITE_IMAGES.watching, label: "At your home", caption: "Doorstep diagnosis across Delhi NCR" },
  { src: SITE_IMAGES.screen, label: "Panel check", caption: "Lines, dim picture, no display" },
  { src: SITE_IMAGES.soldering, label: "Board repair", caption: "Mainboard and power board on the bench" },
  { src: SITE_IMAGES.circuit, label: "Component work", caption: "Genuine parts, not a full-set swap" },
  { src: SITE_IMAGES.hero, label: "After repair", caption: "TV back on the wall the same day" },
  { src: SITE_IMAGES.bench, label: "Workshop backup", caption: "Complex jobs finish in the lab" },
];
