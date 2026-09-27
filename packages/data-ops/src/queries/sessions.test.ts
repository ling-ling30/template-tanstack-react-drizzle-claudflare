import { describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "../database/setup";
import {
  listUserSessions,
  revokeOtherSessions,
  revokeSession,
} from "./sessions";

describe("sessions queries", () => {
  it("lists active sessions for a user", async () => {
    const mockSessions = [
      {
        id: "sess_1",
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
      },
    ];
    const orderBy = vi.fn().mockResolvedValue(mockSessions);
    const where = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    const db = { select } as unknown as AppDatabase;

    const result = await listUserSessions(db, "usr_123");
    expect(select).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledOnce();
    expect(result).toEqual(mockSessions);
  });

  it("revokes a specific session", async () => {
    const where = vi.fn().mockResolvedValue(undefined);
    const del = vi.fn().mockReturnValue({ where });
    const db = { delete: del } as unknown as AppDatabase;

    await revokeSession(db, { userId: "usr_123", sessionId: "sess_1" });
    expect(del).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledOnce();
  });

  it("revokes other sessions except the current one", async () => {
    const where = vi.fn().mockResolvedValue(undefined);
    const del = vi.fn().mockReturnValue({ where });
    const db = { delete: del } as unknown as AppDatabase;

    await revokeOtherSessions(db, {
      userId: "usr_123",
      currentSessionId: "sess_current",
    });
    expect(del).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledOnce();
  });
});
