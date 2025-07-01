import { PostgrestError, AuthError, AuthResponse } from "@supabase/supabase-js";

export interface TestError {
  code: string;
  message: string;
  details?: string;
}

export type SupabaseError = PostgrestError | AuthError;

export function isTestError(error: unknown): error is TestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "details" in error
  );
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    error instanceof Error &&
    "message" in error &&
    "status" in error &&
    error.name === "AuthError"
  );
}

export function formatError(error: unknown): TestError {
  if (isTestError(error)) {
    return error;
  }
  if (isPostgrestError(error)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }
  if (isAuthError(error)) {
    return {
      code: String(error.status),
      message: error.message,
      details: error.stack,
    };
  }
  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      details: error.stack,
    };
  }
  return {
    code: "UNKNOWN_ERROR",
    message: String(error),
  };
}

export function assertError<T>(result: {
  data: T | null;
  error: PostgrestError | null;
}): asserts result is { data: null; error: PostgrestError } {
  expect(result.error).not.toBeNull();
  expect(isPostgrestError(result.error)).toBe(true);
}

export function assertSuccess<T>(result: {
  data: T | null;
  error: PostgrestError | null;
}): asserts result is { data: T; error: null } {
  expect(result.error).toBeNull();
  expect(result.data).not.toBeNull();
}

export function assertAuthSuccess(
  result: AuthResponse
): asserts result is AuthResponse & { error: null } {
  expect(result.error).toBeNull();
  expect(result.data).toBeDefined();
}

export function assertAuthError(
  result: AuthResponse
): asserts result is AuthResponse & {
  data: { user: null; session: null };
  error: AuthError;
} {
  expect(result.error).not.toBeNull();
  expect(isAuthError(result.error)).toBe(true);
}
