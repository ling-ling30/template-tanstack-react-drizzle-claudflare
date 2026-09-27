import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ConsoleEmailProvider,
  getEmailProvider,
  ResendEmailProvider,
  sendEmail,
  setEmailProvider,
} from "./mailer";

describe("Email abstraction", () => {
  afterEach(() => {
    setEmailProvider(null);
    vi.restoreAllMocks();
  });

  it("defaults to ConsoleEmailProvider when no API keys in env", () => {
    const provider = getEmailProvider({});
    expect(provider).toBeInstanceOf(ConsoleEmailProvider);
  });

  it("resolves ResendEmailProvider when RESEND_API_KEY is provided", () => {
    const provider = getEmailProvider({ RESEND_API_KEY: "re_test_123" });
    expect(provider).toBeInstanceOf(ResendEmailProvider);
  });

  it("logs through ConsoleEmailProvider and succeeds", () => {
    return (async () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      const provider = new ConsoleEmailProvider();
      const res = await provider.send({
        to: "user@example.com",
        subject: "Welcome",
        text: "Hello!",
      });

      expect(res.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("user@example.com")
      );
    })();
  });

  it("sendEmail dispatches to active provider", () => {
    return (async () => {
      const mockProvider = {
        send: vi.fn().mockResolvedValue({ success: true, id: "test-123" }),
      };
      setEmailProvider(mockProvider);

      await sendEmail({
        to: "test@example.com",
        subject: "Test Subject",
        text: "Test Body",
      });

      expect(mockProvider.send).toHaveBeenCalledTimes(1);
    })();
  });
});
