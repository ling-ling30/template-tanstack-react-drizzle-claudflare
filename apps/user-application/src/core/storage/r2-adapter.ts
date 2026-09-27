import type {
  BlobStorageProvider,
  StorageObjectMetadata,
  StoragePresignedUpload,
  StoragePutOptions,
} from "./types";

// Minimal structural typing for Cloudflare Worker R2Bucket binding
interface CloudflareR2Object {
  key: string;
  size: number;
  uploaded: Date;
  httpMetadata?: {
    contentType?: string;
  };
  customMetadata?: Record<string, string>;
}

interface CloudflareR2ObjectBody extends CloudflareR2Object {
  body: ReadableStream;
}

interface CloudflareR2Bucket {
  put(
    key: string,
    value:
      ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    }
  ): Promise<CloudflareR2Object>;
  get(key: string): Promise<CloudflareR2ObjectBody | null>;
  head(key: string): Promise<CloudflareR2Object | null>;
  delete(key: string): Promise<void>;
}

export class R2StorageProvider implements BlobStorageProvider {
  constructor(
    private bucket: CloudflareR2Bucket,
    private publicBaseUrl?: string
  ) {}

  async put(
    key: string,
    body: ReadableStream | ArrayBuffer | Uint8Array | string | Blob,
    options?: StoragePutOptions
  ): Promise<StorageObjectMetadata> {
    const res = await this.bucket.put(key, body, {
      httpMetadata: options?.contentType
        ? { contentType: options.contentType }
        : undefined,
      customMetadata: options?.customMetadata,
    });

    return {
      key: res.key,
      size: res.size,
      contentType: res.httpMetadata?.contentType,
      lastModified: res.uploaded,
      customMetadata: res.customMetadata,
    };
  }

  async get(key: string): Promise<{
    body: ReadableStream;
    metadata: StorageObjectMetadata;
  } | null> {
    const obj = await this.bucket.get(key);
    if (!obj) return null;

    return {
      body: obj.body,
      metadata: {
        key: obj.key,
        size: obj.size,
        contentType: obj.httpMetadata?.contentType,
        lastModified: obj.uploaded,
        customMetadata: obj.customMetadata,
      },
    };
  }

  async head(key: string): Promise<StorageObjectMetadata | null> {
    const obj = await this.bucket.head(key);
    if (!obj) return null;

    return {
      key: obj.key,
      size: obj.size,
      contentType: obj.httpMetadata?.contentType,
      lastModified: obj.uploaded,
      customMetadata: obj.customMetadata,
    };
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async createUploadUrl(
    key: string,
    options?: { contentType?: string; expiresInSec?: number }
  ): Promise<StoragePresignedUpload> {
    // If a custom R2 public domain or proxy is used
    const endpoint = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(key)}`
      : `/api/storage/${encodeURIComponent(key)}`;

    return {
      key,
      url: endpoint,
      method: "PUT",
      headers: options?.contentType
        ? { "Content-Type": options.contentType }
        : undefined,
      expiresInSec: options?.expiresInSec ?? 3600,
    };
  }

  async createDownloadUrl(key: string): Promise<string> {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
    }
    return `/api/storage/${encodeURIComponent(key)}`;
  }
}
