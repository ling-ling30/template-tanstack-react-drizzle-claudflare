import { sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/** Escapes LIKE wildcards so a search term matches literally. */
export function toContainsPattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Case-insensitive (ASCII) "column contains term" for SQLite/D1. The term is
 * bound as a parameter; `%` and `_` in it are escaped, not treated as wildcards.
 */
export function contains(column: SQLiteColumn, term: string): SQL {
  return sql`${column} LIKE ${toContainsPattern(term)} ESCAPE '\\'`;
}
