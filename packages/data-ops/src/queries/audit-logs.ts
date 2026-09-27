import { desc, eq } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import {
  auditLogs,
  type AuditLogEntry,
  type NewAuditLogEntry,
} from "../drizzle/audit-schema";

export type RecordAuditLogInput = Omit<NewAuditLogEntry, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

/**
 * Inserts an audit log entry.
 */
export async function recordAuditLog(
  db: AppDatabase,
  input: RecordAuditLogInput
): Promise<AuditLogEntry> {
  const id =
    input.id ?? `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = input.createdAt ?? new Date().toISOString();

  const entry: NewAuditLogEntry = {
    ...input,
    id,
    createdAt,
  };

  await db.insert(auditLogs).values(entry);
  return entry as AuditLogEntry;
}

export type ListAuditLogsOptions = {
  organizationId?: string;
  limit?: number;
  offset?: number;
};

/**
 * Lists audit logs, newest first.
 */
export async function listAuditLogs(
  db: AppDatabase,
  options: ListAuditLogsOptions = {}
): Promise<AuditLogEntry[]> {
  const limit = Math.min(options.limit ?? 50, 100);
  const offset = options.offset ?? 0;

  if (options.organizationId) {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, options.organizationId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}
