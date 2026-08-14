import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db/pool";
import { AppError } from "@/lib/utils/errors";

type SqlParams = Array<string | number | boolean | Date | Buffer | null>;

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    const [rows] = await getPool().execute(sql, params as SqlParams);
    return rows as T[];
  } catch (error) {
    throw new AppError("Database query failed", 500, error);
  }
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
  try {
    const [result] = await getPool().execute(sql, params as SqlParams);
    return result as ResultSetHeader;
  } catch (error) {
    throw new AppError("Database write failed", 500, error);
  }
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
  const conn = await getPool().getConnection();
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
