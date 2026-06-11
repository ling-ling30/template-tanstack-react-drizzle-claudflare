export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "ORG_NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "STORAGE_WRITE_FAILED"
  | "DATABASE_WRITE_FAILED"
  | "INTERNAL";

export type AppError = {
  code: AppErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
};

export function appError(
  code: AppErrorCode,
  message: string,
  fieldErrors?: Record<string, string>,
): AppError {
  return fieldErrors ? { code, message, fieldErrors } : { code, message };
}

export function isAppError(value: unknown): value is AppError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const error = value as Partial<AppError>;
  return typeof error.code === "string" && typeof error.message === "string";
}
