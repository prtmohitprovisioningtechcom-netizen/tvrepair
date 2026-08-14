const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "img",
  "span",
  "div",
]);

const ALLOWED_ATTRS = new Set(["href", "src", "alt", "title", "target", "rel"]);

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag: string, attrs: string) => {
      const name = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (match.startsWith("</")) return `</${name}>`;
      const safeAttrs = attrs.replace(
        /([a-zA-Z:-]+)\s*=\s*(["'])(.*?)\2/g,
        (_a, attr: string, quote: string, value: string) => {
          const key = attr.toLowerCase();
          if (!ALLOWED_ATTRS.has(key)) return "";
          if (key === "href" || key === "src") {
            if (/^\s*javascript:/i.test(value)) return "";
          }
          if (key === "href") {
            return ` href=${quote}${value}${quote} rel="noopener noreferrer"`;
          }
          return ` ${key}=${quote}${value}${quote}`;
        },
      );
      return `<${name}${safeAttrs}>`;
    });
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
