export type ApiError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
};

export function buildError(status: number, code: string, message?: string, details?: unknown): ApiError {
  const err = new Error(message ?? code) as ApiError;
  err.status = status;
  err.code = code;
  if (details !== undefined) {
    err.details = details;
  }
  return err;
}
