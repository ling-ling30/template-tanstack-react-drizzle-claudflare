import { describe, expect, it, vi } from "vitest";
import { listAuditLogs, recordAuditLog } from "./audit-logs";
import type { AppDatabase } from "../database/setup";

describe("audit-logs queries", () => {
  it("inserts an audit log entry with defaults", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn().mockReturnValue({ values });
    const db = { insert } as unknown as AppDatabase;

    const res = await recordAuditLog(db, {
      actorId: "user_123",
      action: "member.invited",
      resourceType: "member",
      resourceId: "inv_456",
    });

    expect(insert).toHaveBeenCalledOnce();
    expect(res.id).toMatch(/^audit_/);
    expect(res.actorId).toBe("user_123");
    expect(res.action).toBe("member.invited");
    expect(res.createdAt).toBeDefined();
  });

  it("lists audit logs with organization filter", async () => {
    const offset = vi.fn().mockResolvedValue([{ id: "audit_1" }]);
    const limit = vi.fn().mockReturnValue({ offset });
    const orderBy = vi.fn().mockReturnValue({ limit });
    const where = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    const db = { select } as unknown as AppDatabase;

    const logs = await listAuditLogs(db, {
      organizationId: "org_123",
      limit: 10,
    });

    expect(select).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledOnce();
    expect(logs).toEqual([{ id: "audit_1" }]);
  });
});
