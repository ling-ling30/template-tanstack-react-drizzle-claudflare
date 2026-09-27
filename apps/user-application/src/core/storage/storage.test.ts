import { describe, expect, it } from "vitest";
import { getStorage, MemoryStorageProvider } from "./index";

describe("Storage abstraction", () => {
  it("defaults to MemoryStorageProvider when env has no R2 bucket", () => {
    const storage = getStorage({});
    expect(storage).toBeInstanceOf(MemoryStorageProvider);
  });

  it("stores, retrieves, and heads objects in memory", () => {
    return (async () => {
      const storage = new MemoryStorageProvider();
      const key = "test/doc.txt";
      const content = "Hello SaaS Template";

      const putRes = await storage.put(key, content, {
        contentType: "text/plain",
      });
      expect(putRes.key).toBe(key);
      expect(putRes.size).toBe(content.length);

      const headRes = await storage.head(key);
      expect(headRes).not.toBeNull();
      expect(headRes?.size).toBe(content.length);
      expect(headRes?.contentType).toBe("text/plain");

      const getRes = await storage.get(key);
      expect(getRes).not.toBeNull();
      const reader = getRes!.body.getReader();
      const { value } = await reader.read();
      const text = new TextDecoder().decode(value);
      expect(text).toBe(content);

      await storage.delete(key);
      expect(await storage.head(key)).toBeNull();
    })();
  });

  it("generates presigned URLs", () => {
    return (async () => {
      const storage = new MemoryStorageProvider();
      const upload = await storage.createUploadUrl("avatar.png", {
        contentType: "image/png",
      });
      expect(upload.url).toContain("avatar.png");
      expect(upload.method).toBe("PUT");

      const download = await storage.createDownloadUrl("avatar.png");
      expect(download).toContain("avatar.png");
    })();
  });
});
