import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (pool) return pool;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error(
      "Database environment variables are missing. Set DB_HOST, DB_USER, and DB_NAME.",
    );
  }

  pool = mysql.createPool({
    host,
    port: Number(process.env.DB_PORT || 3306),
    user,
    password: process.env.DB_PASSWORD || "",
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    charset: "utf8mb4",
    dateStrings: true,
  });

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
