/**
 * Provider-agnostic Blob Storage abstraction.
 * Decouples the application from Cloudflare R2, AWS S3, or local storage.
 */

export type StoragePutOptions = {
  contentType?: string;
  customMetadata?: Record<string, string>;
};

export type StorageObjectMetadata = {
  key: string;
  size: number;
  contentType?: string;
  lastModified: Date;
  customMetadata?: Record<string, string>;
};

export type StoragePresignedUpload = {
  key: string;
  url: string;
  method: "PUT" | "POST";
  headers?: Record<string, string>;
  expiresInSec: number;
};

export interface BlobStorageProvider {
  /**
   * Directly stores a file buffer, stream, or string into the bucket.
   */
  put(
    key: string,
    body: ReadableStream | ArrayBuffer | Uint8Array | string | Blob,
    options?: StoragePutOptions
  ): Promise<StorageObjectMetadata>;

  /**
   * Retrieves an object's stream and metadata. Returns null if not found.
   */
  get(key: string): Promise<{
    body: ReadableStream;
    metadata: StorageObjectMetadata;
  } | null>;

  /**
   * Retrieves metadata for an object without downloading its payload.
   */
  head(key: string): Promise<StorageObjectMetadata | null>;

  /**
   * Deletes an object by key.
   */
  delete(key: string): Promise<void>;

  /**
   * Generates a pre-signed URL allowing a client to upload directly.
   */
  createUploadUrl(
    key: string,
    options?: { contentType?: string; expiresInSec?: number }
  ): Promise<StoragePresignedUpload>;

  /**
   * Generates a pre-signed or public URL for reading an object.
   */
  createDownloadUrl(
    key: string,
    options?: { expiresInSec?: number }
  ): Promise<string>;
}
