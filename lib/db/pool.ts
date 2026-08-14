import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function azureConnStr() {
  const raw =
    process.env.MYSQLCONNSTR_localdb ||
    process.env.MYSQLCONNSTR_default ||
    process.env.CUSTOMCONNSTR_MYSQL ||
    "";
  if (!raw.includes("=") || !raw.includes(";")) return null;
  const parts: Record<string, string> = {};
  for (const piece of raw.split(";")) {
    const idx = piece.indexOf("=");
    if (idx === -1) continue;
    parts[piece.slice(0, idx).trim().toLowerCase()] = piece.slice(idx + 1).trim();
  }
  const host = parts["data source"] || parts["server"] || parts["host"];
  const user = parts["user id"] || parts["userid"] || parts["uid"] || parts["user"];
  const database = parts["database"] || parts["initial catalog"];
  if (!host || !user || !database) return null;
  return {
    host,
    port: Number(parts["port"] || 3306),
    user,
    password: parts["password"] || parts["pwd"] || "",
    database,
  };
}

function fromDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] || "");
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    sslParam: parsed.searchParams.get("ssl") || parsed.searchParams.get("sslmode"),
  };
}

function sslOption(host: string, sslParam?: string | null) {
  const flag = (process.env.DB_SSL || "").toLowerCase();
  const azure = /\.database\.azure\.com$/i.test(host);
  const fromUrl = sslParam === "true" || sslParam === "required" || sslParam === "require";
  if (flag === "false" || flag === "0") return undefined;
  if (!(flag === "true" || flag === "1" || flag === "required" || azure || fromUrl)) return undefined;
  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" && !azure,
  };
}

export function getPool(): mysql.Pool {
  if (pool) return pool;

  let host = process.env.DB_HOST || "";
  let port = Number(process.env.DB_PORT || 3306);
  let user = process.env.DB_USER || "";
  let password = process.env.DB_PASSWORD || "";
  let database = process.env.DB_NAME || "";
  let sslParam: string | null = null;

  if (process.env.DATABASE_URL) {
    const parsed = fromDatabaseUrl(process.env.DATABASE_URL);
    host = parsed.host;
    port = parsed.port;
    user = parsed.user;
    password = parsed.password;
    database = parsed.database;
    sslParam = parsed.sslParam;
  } else {
    const azure = azureConnStr();
    if (azure) {
      host = azure.host;
      port = azure.port;
      user = azure.user;
      password = azure.password;
      database = azure.database;
    }
  }

  if (!host || !user || !database) {
    throw new Error(
      "Database environment variables are missing. Set DATABASE_URL, or DB_HOST, DB_USER, and DB_NAME.",
    );
  }

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    queueLimit: 0,
    enableKeepAlive: true,
    charset: "utf8mb4",
    dateStrings: true,
    ssl: sslOption(host, sslParam),
  });

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
