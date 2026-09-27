import { sql, type Column, type SQL } from "drizzle-orm";
import { inArray } from "drizzle-orm";

/**
 * Cloudflare D1 (SQLite) parameter bounds helper.
 * SQLite / D1 has strict limits on bound parameters per query (max 100-999).
 * If `inArray` is called with hundreds of items, D1 fails.
 *
 * `chunkArray` splits an array of items into chunks of `chunkSize`.
 */
export function chunkArray<T>(items: T[], chunkSize = 100): T[][] {
  if (items.length === 0) return [];
  if (chunkSize <= 0) throw new Error("chunkSize must be greater than 0");
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Creates an `inArray` SQL condition or a combined OR of chunked `inArray` conditions
 * to stay safely within D1's variable limits.
 */
export function chunkedInArray<T>(
  column: Column,
  values: T[],
  chunkSize = 100
): SQL | undefined {
  if (values.length === 0) {
    return sql`0 = 1`; // Never matches
  }

  if (values.length <= chunkSize) {
    return inArray(column, values);
  }

  const chunks = chunkArray(values, chunkSize);
  const conditions = chunks.map((chunk) => inArray(column, chunk));
  return sql.join(conditions, sql` OR `);
}
