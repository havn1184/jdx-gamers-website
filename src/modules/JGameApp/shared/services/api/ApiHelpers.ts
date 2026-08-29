/**
 * API Helpers - Shared utilities for API calls
 *
 * Handles:
 * - Building headers with Authorization + X-Domain-Id
 * - Error handling (RFC 9110 ProblemDetails)
 * - Validation error parsing
 * - Type guards for error checking
 *
 * Usage:
 * ```typescript
 * import { buildApiHeaders, handleApiError, isValidationError } from '../../../../../shared/services/api';
 *
 * // Build headers
 * const headers = buildApiHeaders();
 *
 * // Make API call
 * const response = await fetch(url, { headers });
 *
 * // Handle errors
 * if (!response.ok) {
 *   try {
 *     await handleApiError(response);
 *   } catch (error) {
 *     if (isValidationError(error)) {
 *       // Display validation errors
 *       console.log(error.errorDetails);
 *     }
 *   }
 * }
 * ```
 */

import { TokenManager } from './TokenManager'
import { ApiLogger } from './ApiLogger'

/**
 * ==========================================
 * TYPE DEFINITIONS
 * ==========================================
 */

/**
 * Validation Error - Uses errorDetails from backend
 */
export interface ValidationError extends Error {
  errorDetails: any // ✅ Match backend: object? - Can be array, object, or string
  status: number
  traceId?: string
}

/**
 * API Error Response (Match Backend C# ApiResponse<T>)
 */
export interface ApiErrorResponse {
  type?: string
  title?: string
  status?: number
  errors?: Record<string, string[]> // ✅ RFC 9110 ProblemDetails format
  traceId?: string
  message?: string
  // ✅ VTN Backend ApiResponse<T> fields
  success?: boolean
  errorCode?: string
  errorDetails?: any // ✅ Backend: object? - Can be array, object, or any type
  timestamp?: string
}

/**
 * Unauthorized Error (401)
 */
export interface UnauthorizedError extends Error {
  status: 401
  traceId?: string
}

/**
 * Forbidden Error (403)
 */
export interface ForbiddenError extends Error {
  status: 403
  traceId?: string
}

/**
 * Not Found Error (404)
 */
export interface NotFoundError extends Error {
  status: 404
  traceId?: string
}

/**
 * Custom Error (VTN Backend specific format)
 */
export interface CustomError extends Error {
  errorCode?: string
  errorDetails?: any // ✅ Backend: object? - Can be array, object, or any type
  status: number
  timestamp?: string
  traceId?: string
}

/**
 * ==========================================
 * HEADERS BUILDING
 * ==========================================
 */

/**
 * Build headers with Authorization Bearer token and X-Domain-Id (ASYNC VERSION)
 *
 * ✅ CRITICAL: This version checks token expiry and auto-refreshes if needed
 * ✅ CRITICAL: X-Domain-Id header là BẮT BUỘC cho multi-tenant backend
 * @see /guidelines/backend-docs/thong-tin-ket-noi-api.md
 *
 * Headers included:
 * - Content-Type: application/json (or custom)
 * - Authorization: Bearer {accessToken}
 * - X-Domain-Id: {domainId} (extracted from JWT)
 *
 * @param contentType - Content-Type header (default: application/json)
 * @param additionalHeaders - Additional headers to merge
 * @returns Promise<HeadersInit> object ready for fetch()
 *
 * @example
 * ```typescript
 * // Basic usage (with await)
 * const headers = await buildApiHeadersAsync();
 *
 * // Custom Content-Type
 * const headers = await buildApiHeadersAsync('application/xml');
 *
 * // With additional headers
 * const headers = await buildApiHeadersAsync('application/json', {
 *   'X-Custom-Header': 'value'
 * });
 * ```
 */
export async function buildApiHeadersAsync(
  contentType: string = 'application/json',
  additionalHeaders?: Record<string, string>
): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
  }

  // Get token with auto-refresh if expired
  const token = await TokenManager.getAccessTokenWithRefresh()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.warn(
      '⚠️ [buildApiHeadersAsync] No access token found - API call may fail'
    )
  }

  // Add X-Domain-Id header (required for backend middleware)
  // Backend code: Request.Headers["X-Domain-Id"].FirstOrDefault()
  const domainId = TokenManager.getDomainId()
  if (domainId) {
    headers['X-Domain-Id'] = domainId
  } else {
    console.warn(
      '⚠️ [buildApiHeadersAsync] DomainId not found in JWT token - API call may fail'
    )
  }

  // Merge additional headers
  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders)
  }

  return headers
}

/**
 * Build headers with Authorization Bearer token and X-Domain-Id (SYNC VERSION - DEPRECATED)
 *
 * ⚠️ DEPRECATED: Use buildApiHeadersAsync() instead for auto-refresh support
 * This version does NOT check token expiry and will fail if token is expired
 *
 * @deprecated Use buildApiHeadersAsync() for automatic token refresh
 *
 * Headers included:
 * - Content-Type: application/json (or custom)
 * - Authorization: Bearer {accessToken}
 * - X-Domain-Id: {domainId} (extracted from JWT)
 *
 * @param contentType - Content-Type header (default: application/json)
 * @param additionalHeaders - Additional headers to merge
 * @returns HeadersInit object ready for fetch()
 */
export function buildApiHeaders(
  contentType: string = 'application/json',
  additionalHeaders?: Record<string, string>
): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
  }

  // Add Authorization header (NO auto-refresh check)
  const token = TokenManager.getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.warn(
      '⚠️ [buildApiHeaders] No access token found - API call may fail'
    )
  }

  // Add X-Domain-Id header (required for backend middleware)
  // Backend code: Request.Headers["X-Domain-Id"].FirstOrDefault()
  const domainId = TokenManager.getDomainId()
  if (domainId) {
    headers['X-Domain-Id'] = domainId
  } else {
    console.warn(
      '⚠️ [buildApiHeaders] DomainId not found in JWT token - API call may fail'
    )
  }

  // Merge additional headers
  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders)
  }

  return headers
}

/**
 * Build headers for FormData requests (no Content-Type)
 * Browser will automatically set Content-Type with boundary
 *
 * @param additionalHeaders - Additional headers to merge
 * @returns HeadersInit object WITHOUT Content-Type
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', file);
 *
 * const headers = buildFormDataHeaders();
 *
 * fetch(url, {
 *   method: 'POST',
 *   headers,
 *   body: formData
 * });
 * ```
 */
export function buildFormDataHeaders(
  additionalHeaders?: Record<string, string>
): HeadersInit {
  const headers: Record<string, string> = {}

  // Add Authorization header
  const token = TokenManager.getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Add X-Domain-Id header
  const domainId = TokenManager.getDomainId()
  if (domainId) {
    headers['X-Domain-Id'] = domainId
  }

  // Merge additional headers
  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders)
  }

  return headers
}

/**
 * ==========================================
 * ERROR HANDLING
 * ==========================================
 */

/**
 * Handle API error responses
 *
 * ✅ IMPROVED: Phân biệt Controlled vs Uncontrolled Errors
 *
 * **Controlled Errors (Expected - Business validation):**
 * - 400 Validation errors → INFO (user input errors)
 * - 401 Unauthorized → WARN (token expired - will auto-refresh)
 * - 403 Forbidden → WARN (insufficient permissions)
 * - 404 Not Found → WARN (resource doesn't exist)
 * - 409 Conflict → WARN (duplicate data)
 *
 * **Uncontrolled Errors (Unexpected - System failures):**
 * - 500+ Server errors → ERROR (backend bugs/issues)
 * - Network errors → ERROR (connectivity issues)
 *
 * Backend returns RFC 9110 ProblemDetails format:
 * ```json
 * {
 *   "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
 *   "title": "One or more validation errors occurred.",
 *   "status": 400,
 *   "errors": {
 *     "TaxCode": ["Mã số thuế không hợp lệ"],
 *     "Email": ["Email đã tồn tại"]
 *   },
 *   "traceId": "00-abc-def-00"
 * }
 * ```
 *
 * @param response - Fetch Response object
 * @throws ValidationError for 400 with errors field
 * @throws UnauthorizedError for 401
 * @throws ForbiddenError for 403
 * @throws NotFoundError for 404
 * @throws Error for other status codes
 *
 * @example
 * ```typescript
 * const response = await fetch(url, { method: 'POST', body: data });
 *
 * if (!response.ok) {
 *   try {
 *     await handleApiError(response);
 *   } catch (error) {
 *     if (isValidationError(error)) {
 *       // Display validation errors in UI
 *       setErrors(error.errorDetails);
 *     } else if (isUnauthorizedError(error)) {
 *       // Redirect to login
 *       window.location.href = '/#/auth/login'; // ✅ Use hash-based URL for HashRouter
 *     }
 *   }
 * }
 * ```
 */
export async function handleApiError(response: Response): Promise<never> {
  const contentType = response.headers.get('content-type')
  const status = response.status

  // Handle JSON error responses
  if (contentType?.includes('application/json')) {
    try {
      const errorData: ApiErrorResponse = await response.json()

      // ✅ CHECK #1: Custom Error Format (VTN Backend specific) - PRIORITY!
      // Check for: success=false, errorCode, errorDetails, or message
      if (
        errorData.errorCode ||
        errorData.errorDetails ||
        errorData.success === false
      ) {
        // ✅ DYNAMIC ERROR HANDLING - No hardcoded errorCode
        // Strategy: Treat errors with content as ValidationError regardless of HTTP status
        // - Any status (4xx or 5xx) + errorDetails/message → ValidationError
        // - This handles backend inconsistency (sometimes returns 500 for business errors)
        
        const hasErrorContent = errorData.errorDetails || errorData.message

        if (hasErrorContent) {
          // ✅ Has error content → Treat as ValidationError (for ValidationErrorDialog)
          // Use errorDetails if present, otherwise wrap message in array
          const details = errorData.errorDetails ?? [errorData.message]
          
          // Log based on status code
          if (status >= 500) {
            // Server error with business message
            ApiLogger.warn('[Validation/Business Error - 5xx]', {
              status,
              errorCode: errorData.errorCode,
              errorDetails: details,
              message: errorData.message,
              traceId: errorData.timestamp,
              note: 'Backend returned 5xx for business error - treating as ValidationError'
            })
          } else {
            // Client error
            ApiLogger.info('[Validation/Business Error - 4xx]', {
              status,
              errorCode: errorData.errorCode,
              errorDetails: details,
              message: errorData.message,
              traceId: errorData.timestamp,
            })
          }

          const error = new Error(
            errorData.message || 'Validation error occurred'
          ) as ValidationError
          error.name = 'ValidationError'
          error.errorDetails = details
          error.status = response.status
          error.traceId = errorData.timestamp
          throw error
        }

        // ✅ SERVER ERROR (5xx) or 4xx without content → CustomError
        if (status >= 500) {
          // 🔴 UNCONTROLLED ERROR - Log as ERROR (server error)
          ApiLogger.error('[Server Error - 5xx]', {
            errorCode: errorData.errorCode,
            errorDetails: errorData.errorDetails,
            message: errorData.message,
            timestamp: errorData.timestamp,
            status,
          })
        } else {
          // ⚠️ CONTROLLED ERROR - Log as WARN (client error without content)
          ApiLogger.warn('[Client Error - 4xx]', {
            errorCode: errorData.errorCode,
            errorDetails: errorData.errorDetails,
            message: errorData.message,
            timestamp: errorData.timestamp,
            status,
          })
        }

        const error = new Error(
          errorData.message || 'System error occurred'
        ) as CustomError
        error.name = 'CustomError'
        error.errorCode = errorData.errorCode
        error.errorDetails = errorData.errorDetails
        error.status = response.status
        error.timestamp = errorData.timestamp
        error.traceId = errorData.timestamp
        throw error
      }

      // ✅ CHECK #2: RFC 9110 ProblemDetails Validation Errors (400)
      if (errorData.errors && typeof errorData.errors === 'object') {
        // ✅ CONTROLLED ERROR - Log as INFO (user input validation)
        // ValidationErrorDialog will display these to user
        ApiLogger.info('[Validation Error - RFC 9110 ProblemDetails]', {
          status,
          errors: errorData.errors,
          traceId: errorData.traceId,
        })

        const error = new Error(
          errorData.title || 'Validation errors occurred'
        ) as ValidationError
        error.name = 'ValidationError'
        error.errorDetails = errorData.errors
        error.status = errorData.status || response.status
        error.traceId = errorData.traceId
        throw error
      }

      // ✅ CHECK #3: 401 Unauthorized
      if (response.status === 401) {
        // ⚠️ CONTROLLED ERROR - Log as WARN (token expired - will auto-refresh)
        ApiLogger.warn('[Unauthorized - 401]', {
          message: errorData.message || errorData.title,
          traceId: errorData.traceId,
        })

        const error = new Error(
          errorData.message || errorData.title || 'Unauthorized - Please login'
        ) as UnauthorizedError
        error.name = 'UnauthorizedError'
        error.status = 401
        error.traceId = errorData.traceId
        throw error
      }

      // ✅ CHECK #4: 403 Forbidden
      if (response.status === 403) {
        // ⚠️ CONTROLLED ERROR - Log as WARN (insufficient permissions)
        ApiLogger.warn('[Forbidden - 403]', {
          message: errorData.message || errorData.title,
          traceId: errorData.traceId,
        })

        const error = new Error(
          errorData.message || errorData.title || 'Forbidden - Access denied'
        ) as ForbiddenError
        error.name = 'ForbiddenError'
        error.status = 403
        error.traceId = errorData.traceId
        throw error
      }

      // ✅ CHECK #5: 404 Not Found
      if (response.status === 404) {
        // ⚠️ CONTROLLED ERROR - Log as WARN (resource doesn't exist)
        ApiLogger.warn('[Not Found - 404]', {
          message: errorData.message || errorData.title,
          traceId: errorData.traceId,
        })

        const error = new Error(
          errorData.message || errorData.title || 'Not Found'
        ) as NotFoundError
        error.name = 'NotFoundError'
        error.status = 404
        error.traceId = errorData.traceId
        throw error
      }

      // ✅ CHECK #6: 409 Conflict (Duplicate)
      if (response.status === 409) {
        // ⚠️ CONTROLLED ERROR - Log as WARN (duplicate data)
        ApiLogger.warn('[Conflict - 409]', {
          message: errorData.message || errorData.title,
          traceId: errorData.traceId,
        })

        const error: any = new Error(
          errorData.message || errorData.title || 'Conflict - Duplicate data'
        )
        error.status = 409
        error.traceId = errorData.traceId
        throw error
      }

      // ❌ CHECK #7: 5xx Server Errors
      if (status >= 500) {
        // 🔴 UNCONTROLLED ERROR - Log as ERROR (backend bug/system failure)
        ApiLogger.error('[Server Error - 5xx]', {
          status,
          message: errorData.message || errorData.title,
          errorData,
          traceId: errorData.traceId,
        })

        const error: any = new Error(
          errorData.message ||
            errorData.title ||
            `Server Error: ${response.status}`
        )
        error.status = errorData.status || response.status
        error.traceId = errorData.traceId
        throw error
      }

      // ⚠️ FALLBACK: Other client errors (4xx)
      // Log as WARN (probably controlled but not explicitly handled)
      ApiLogger.warn('[Client Error - 4xx]', {
        status,
        message: errorData.message || errorData.title,
        traceId: errorData.traceId,
      })

      const error: any = new Error(
        errorData.message ||
          errorData.title ||
          `HTTP ${response.status}: ${response.statusText}`
      )
      error.status = errorData.status || response.status
      error.traceId = errorData.traceId
      throw error
    } catch (e) {
      // If already an error we threw, re-throw it
      if (
        (e as any).errorDetails ||
        (e as any).name === 'UnauthorizedError' ||
        (e as any).name === 'CustomError'
      ) {
        throw e
      }

      // 🔴 UNCONTROLLED ERROR - JSON parse error
      ApiLogger.error('[Parse Error]', {
        status,
        message: 'Failed to parse error response',
        error: e,
      })

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // 🔴 UNCONTROLLED ERROR - Non-JSON error response
  const errorText = await response.text()
  ApiLogger.error('[Non-JSON Error]', {
    status,
    statusText: response.statusText,
    errorText,
  })

  throw new Error(
    errorText || `HTTP ${response.status}: ${response.statusText}`
  )
}

/**
 * ==========================================
 * VALIDATION ERROR UTILITIES
 * ==========================================
 */

/**
 * Parse errorDetails into flat array of strings
 *
 * @param errorDetails - Error details from backend (can be array, object, or string)
 * @returns Array of error messages
 *
 * @example
 * ```typescript
 * // Array format
 * const errors = ["Lý do phải từ 10-1000 ký tự"];
 * const messages = parseErrorDetails(errors); // ["Lý do phải từ 10-1000 ký tự"]
 * 
 * // Object format
 * const errors = {
 *   "TaxCode": ["Mã số thuế không hợp lệ"],
 *   "Email": ["Email đã tồn tại"]
 * };
 * const messages = parseErrorDetails(errors); 
 * // ["TaxCode: Mã số thuế không hợp lệ", "Email: Email đã tồn tại"]
 * 
 * // String format
 * const errors = "Validation failed";
 * const messages = parseErrorDetails(errors); // ["Validation failed"]
 * ```
 */
export function parseErrorDetails(errorDetails: any): string[] {
  const messages: string[] = []

  // Handle array format: ["message1", "message2"]
  if (Array.isArray(errorDetails)) {
    return errorDetails.map((detail: unknown) => {
      if (typeof detail === 'string') {
        return detail
      }

      if (typeof detail === 'object' && detail !== null) {
        const detailRecord = detail as Record<string, unknown>
        if (typeof detailRecord.message === 'string' && detailRecord.message.trim().length > 0) {
          return detailRecord.message
        }

        return JSON.stringify(detail)
      }

      return String(detail)
    })
  }

  // Handle object format: { field1: ["msg1"], field2: ["msg2"] }
  if (typeof errorDetails === 'object' && errorDetails !== null) {
    for (const [field, fieldErrors] of Object.entries(errorDetails)) {
      if (Array.isArray(fieldErrors)) {
        for (const error of fieldErrors) {
          messages.push(`${field}: ${error}`)
        }
      } else {
        messages.push(`${field}: ${fieldErrors}`)
      }
    }
    return messages
  }

  // Handle string format: "error message"
  if (typeof errorDetails === 'string') {
    return [errorDetails]
  }

  return []
}

/**
 * Format errorDetails thành string để hiển thị trong ValidationErrorDialog
 * 
 * ✅ Sử dụng parseErrorDetails() để xử lý mọi format, sau đó join thành string
 * 
 * @param errorDetails - Error details from backend (any format)
 * @returns Formatted string hoặc undefined
 * 
 * @example
 * ```typescript
 * // VTN Backend format
 * const details = [{message: "TopMenuId không được để trống"}]
 * const formatted = formatErrorDetailsToString(details)
 * // "TopMenuId không được để trống"
 * 
 * // Array of strings
 * const details = ["Error 1", "Error 2"]
 * const formatted = formatErrorDetailsToString(details)
 * // "Error 1\nError 2"
 * ```
 */
export function formatErrorDetailsToString(errorDetails: any): string | undefined {
  if (!errorDetails) {
    return undefined
  }

  const messages = parseErrorDetails(errorDetails)
  return messages.length > 0 ? messages.join('\n') : undefined
}

/**
 * Format error message for display
 *
 * @param error - Error object (can be ValidationError, string, or Error)
 * @returns Formatted error message
 *
 * @example
 * ```typescript
 * const error = new Error('Network error');
 * const message = formatErrorMessage(error); // "Network error"
 *
 * const validationError: ValidationError = {
 *   message: 'Validation failed',
 *   errorDetails: ["Lý do phải từ 10-1000 ký tự"]
 * };
 * const message = formatErrorMessage(validationError);
 * // "Validation failed: Lý do phải từ 10-1000 ký tự"
 * ```
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }

  if (isValidationError(error)) {
    const errorMessages = parseErrorDetails(error.errorDetails)
    return `${error.message}: ${errorMessages.join(', ')}`
  }

  return error?.message || 'Unknown error occurred'
}

/**
 * ==========================================
 * TYPE GUARDS
 * ==========================================
 */

/**
 * Check if error is a ValidationError
 *
 * @param error - Error object to check
 * @returns true if error is ValidationError
 *
 * @example
 * ```typescript
 * try {
 *   await handleApiError(response);
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     // Handle validation errors
 *     console.log(error.errorDetails);
 *   }
 * }
 * ```
 */
export function isValidationError(error: any): error is ValidationError {
  return (
    error &&
    typeof error === 'object' &&
    'errorDetails' in error &&
    error.errorDetails != null
  )
}

/**
 * Check if error is an UnauthorizedError (401)
 *
 * @param error - Error object to check
 * @returns true if error is UnauthorizedError
 *
 * @example
 * ```typescript
 * try {
 *   await handleApiError(response);
 * } catch (error) {
 *   if (isUnauthorizedError(error)) {
 *     // Redirect to login
 *     window.location.href = '/#/auth/login'; // ✅ Use hash-based URL for HashRouter
 *   }
 * }
 * ```
 */
export function isUnauthorizedError(error: any): error is UnauthorizedError {
  return (
    (error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 401) ||
    ('name' in error && error.name === 'UnauthorizedError')
  )
}

/**
 * Check if error is a ForbiddenError (403)
 *
 * @param error - Error object to check
 * @returns true if error is ForbiddenError
 */
export function isForbiddenError(error: any): error is ForbiddenError {
  return (
    (error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 403) ||
    ('name' in error && error.name === 'ForbiddenError')
  )
}

/**
 * Check if error is a NotFoundError (404)
 *
 * @param error - Error object to check
 * @returns true if error is NotFoundError
 */
export function isNotFoundError(error: any): error is NotFoundError {
  return (
    (error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404) ||
    ('name' in error && error.name === 'NotFoundError')
  )
}

/**
 * Check if error is a CustomError (VTN Backend specific)
 *
 * @param error - Error object to check
 * @returns true if error is CustomError
 */
export function isCustomError(error: any): error is CustomError {
  return (
    (error &&
      typeof error === 'object' &&
      ('errorCode' in error || 'errorDetails' in error)) ||
    ('name' in error && error.name === 'CustomError')
  )
}

/**
 * ==========================================
 * RETRY UTILITIES
 * ==========================================
 */

/**
 * Fetch with retry on network errors
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param retryDelay - Delay between retries in ms (default: 1000)
 * @returns Promise<Response>
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry(url, {
 *   method: 'GET',
 *   headers: await buildApiHeadersAsync()
 * });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      return response
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        ApiLogger.warn(
          `[fetchWithRetry] Attempt ${attempt + 1} failed, retrying...`,
          {
            url,
            error: (error as Error).message,
          }
        )

        // Wait before retrying
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        )
      }
    }
  }

  ApiLogger.error('[fetchWithRetry] All retries failed', {
    url,
    maxRetries,
    error: lastError,
  })

  throw lastError
}
