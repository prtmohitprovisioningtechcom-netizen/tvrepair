import mysql from "mysql2/promise";

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  sslParam: string | null;
};

let pool: mysql.Pool | null = null;
let poolPromise: Promise<mysql.Pool> | null = null;

function env(name: string, fallback = "") {
  const value = process.env[name];
  if (value == null) return fallback;
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function fromDatabaseUrl(url: string): DbConfig {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] || ""),
    sslParam: parsed.searchParams.get("ssl") || parsed.searchParams.get("sslmode"),
  };
}

function readConfig(): DbConfig {
  const host = env("DB_HOST");
  const user = env("DB_USER");
  const database = env("DB_NAME");
  if (host && user && database) {
    return {
      host,
      port: Number(env("DB_PORT", "3306") || 3306),
      user,
      password: env("DB_PASSWORD"),
      database,
      sslParam: env("DB_SSL") || null,
    };
  }

  const url = env("DATABASE_URL");
  if (url) return fromDatabaseUrl(url);

  throw new Error("Set DB_HOST, DB_USER, DB_NAME and DB_PASSWORD (or DATABASE_URL).");
}

function sslOption(host: string, sslParam?: string | null) {
  const flag = env("DB_SSL").toLowerCase();
  const azure = /\.database\.azure\.com$/i.test(host);
  const fromUrl = sslParam === "true" || sslParam === "required" || sslParam === "require";
  if (flag === "false" || flag === "0") return undefined;
  if (!(flag === "true" || flag === "1" || flag === "required" || azure || fromUrl)) return undefined;
  return {
    rejectUnauthorized: env("DB_SSL_REJECT_UNAUTHORIZED") !== "false" && !azure,
  };
}

function hostCandidates(primary: string) {
  const fallback = env("DB_HOST_FALLBACK");
  const local = primary === "localhost" || primary === "127.0.0.1";
  // Vercel / remote Hostinger MySQL: use the configured host only.
  // Do not probe localhost first — that breaks Vercel deploys.
  if (local) {
    return [...new Set([primary, "127.0.0.1", "localhost", fallback].filter(Boolean))];
  }
  return [...new Set([primary, fallback].filter(Boolean))];
}

function poolOptions(config: DbConfig, host: string): mysql.PoolOptions {
  return {
    host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: Number(env("DB_POOL_SIZE", "3") || 3),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: Number(env("DB_CONNECT_TIMEOUT", "30000") || 30000),
    charset: "utf8mb4",
    dateStrings: true,
    ssl: sslOption(host, config.sslParam),
  };
}

async function tryHost(config: DbConfig, host: string, timeout: number) {
  const conn = await mysql.createConnection({
    ...poolOptions(config, host),
    connectTimeout: timeout,
  });
  try {
    await conn.query("SELECT 1");
  } finally {
    await conn.end();
  }
}

async function createWorkingPool(): Promise<mysql.Pool> {
  const config = readConfig();
  const hosts = hostCandidates(config.host);
  let lastError: unknown;

  for (const [index, host] of hosts.entries()) {
    const timeout = index === 0 || host === config.host ? Number(env("DB_CONNECT_TIMEOUT", "30000") || 30000) : 2500;
    try {
      await tryHost(config, host, timeout);
      console.info(`[db] connected ${config.user}@${host}:${config.port}/${config.database}`);
      return mysql.createPool(poolOptions(config, host));
    } catch (error) {
      lastError = error;
      const mysqlError = error as { code?: string; message?: string };
      console.error(`[db] ${host} failed:`, mysqlError.code || mysqlError.message);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not connect to MySQL. Check DB_HOST / DB_USER / DB_NAME / DB_PASSWORD.");
}

export async function getPool(): Promise<mysql.Pool> {
  if (pool) return pool;
  if (!poolPromise) {
    poolPromise = createWorkingPool()
      .then((created) => {
        pool = created;
        return created;
      })
      .catch((error) => {
        poolPromise = null;
        throw error;
      });
  }
  return poolPromise;
}

export async function resetPool(): Promise<void> {
  poolPromise = null;
  if (pool) {
    const current = pool;
    pool = null;
    await current.end().catch(() => undefined);
  }
}

export function isDbConnectionError(error: unknown) {
  const code = (error as { code?: string })?.code || "";
  return [
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "PROTOCOL_CONNECTION_LOST",
    "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
    "ER_CON_COUNT_ERROR",
  ].includes(code);
}
