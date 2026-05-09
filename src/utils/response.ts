/**
 * Wraps a successful response payload in a consistent envelope format.
 * Returns `{ success: true, data: <payload> }`
 */
export function successResponse<T>(data: T) {
  return { success: true as const, data };
}

/**
 * Wraps an error message in a consistent envelope format.
 * Returns `{ success: false, error: <description> }`
 */
export function errorResponse(error: string) {
  return { success: false as const, error };
}
