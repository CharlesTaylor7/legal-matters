/**
 * Common response types used across the API
 */

/**
 * Standard success response with a message
 */
export interface SuccessResponse {
  message: string;
}

/**
 * Standard error response with a message
 */
export interface ErrorResponse {
  message: string;
}
