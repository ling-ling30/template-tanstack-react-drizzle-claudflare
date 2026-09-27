import type {
  BlobStorageProvider,
  StorageObjectMetadata,
  StoragePresignedUpload,
  StoragePutOptions,
} from "./types";

/**
 * In-memory storage provider for local development, CI pipelines, and Vitest.
 * Zero external credentials needed.
 */
export class MemoryStorageProvider implements BlobStorageProvider {
  private store = new Map<
    string,
    { data: Uint8Array; metadata: StorageObjectMetadata }
  >();

  async put(
    key: string,
    body: ReadableStream | ArrayBuffer | Uint8Array | string | Blob,
    options?: StoragePutOptions
  ): Promise<StorageObjectMetadata> {
    let bytes: Uint8Array;

    if (typeof body === "string") {
      bytes = new TextEncoder().encode(body);
    } else if (body instanceof Uint8Array) {
      bytes = body;
    } else if (body instanceof ArrayBuffer) {
      bytes = new Uint8Array(body);
    } else if (body instanceof Blob) {
      bytes = new Uint8Array(await body.arrayBuffer());
    } else {
      // ReadableStream
      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      bytes = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
    }

    const metadata: StorageObjectMetadata = {
      key,
      size: bytes.byteLength,
      contentType: options?.contentType ?? "application/octet-stream",
      lastModified: new Date(),
      customMetadata: options?.customMetadata,
    };

    this.store.set(key, { data: bytes, metadata });
    return metadata;
  }

  async get(key: string): Promise<{
    body: ReadableStream;
    metadata: StorageObjectMetadata;
  } | null> {
    const item = this.store.get(key);
    if (!item) return null;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(item.data);
        controller.close();
      },
    });

    return { body: stream, metadata: item.metadata };
  }

  async head(key: string): Promise<StorageObjectMetadata | null> {
    const item = this.store.get(key);
    return item ? item.metadata : null;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async createUploadUrl(
    key: string,
    options?: { contentType?: string; expiresInSec?: number }
  ): Promise<StoragePresignedUpload> {
    return {
      key,
      url: `/api/storage/${encodeURIComponent(key)}?action=upload`,
      method: "PUT",
      headers: options?.contentType
        ? { "Content-Type": options.contentType }
        : undefined,
      expiresInSec: options?.expiresInSec ?? 3600,
    };
  }

  async createDownloadUrl(key: string): Promise<string> {
    return `/api/storage/${encodeURIComponent(key)}`;
  }
}
