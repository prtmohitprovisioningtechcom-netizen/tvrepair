import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool, isDbConnectionError, resetPool } from "@/lib/db/pool";
import { AppError } from "@/lib/utils/errors";

type SqlParams = Array<string | number | boolean | Date | Buffer | null>;

function dbMessage(error: unknown) {
  const mysqlError = error as { code?: string; sqlMessage?: string; message?: string };
  return mysqlError.sqlMessage || mysqlError.code || mysqlError.message || "Database query failed";
}

async function run<T>(work: (pool: Awaited<ReturnType<typeof getPool>>) => Promise<T>): Promise<T> {
  try {
    return await work(await getPool());
  } catch (error) {
    if (isDbConnectionError(error)) {
      await resetPool();
      try {
        return await work(await getPool());
      } catch (retryError) {
        console.error("[db] retry failed", dbMessage(retryError));
        throw new AppError(dbMessage(retryError), 500, retryError);
      }
    }
    console.error("[db] query failed", dbMessage(error));
    throw new AppError(dbMessage(error), 500, error);
  }
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return run(async (pool) => {
    const [rows] = await pool.execute(sql, params as SqlParams);
    return rows as T[];
  });
}

/** Use for BLOB reads — prepared statements can fail on LONGBLOB. */
export async function queryText<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return run(async (pool) => {
    const [rows] = await pool.query(sql, params as SqlParams);
    return rows as T[];
  });
}

export async function queryTextOne<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await queryText<T>(sql, params);
  return rows[0] ?? null;
}

export async function queryOne<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<ResultSetHeader> {
  return run(async (pool) => {
    const [result] = await pool.execute(sql, params as SqlParams);
    return result as ResultSetHeader;
  });
}

export async function insertId(
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const result = await execute(sql, params);
  return result.insertId;
}

export async function transaction<T>(
  work: (conn: {
    query: <R>(sql: string, params?: unknown[]) => Promise<R[]>;
    execute: (sql: string, params?: unknown[]) => Promise<ResultSetHeader>;
  }) => Promise<T>,
): Promise<T> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const wrapped = {
      async query<R>(sql: string, params: unknown[] = []) {
        const [rows] = await conn.execute(sql, params as SqlParams);
        return rows as R[];
      },
      async execute(sql: string, params: unknown[] = []) {
        const [result] = await conn.execute(sql, params as SqlParams);
        return result as ResultSetHeader;
      },
    };
    const output = await work(wrapped);
    await conn.commit();
    return output;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export type DbRow = RowDataPacket;
