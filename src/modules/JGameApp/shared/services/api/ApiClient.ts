/**
 * API Client - Centralized API call wrapper
 *
 * Features:
 * - ✅ Centralized logging (request/response/error)
 * - ✅ Auto-build headers with JWT token + auto-refresh nếu token sắp hết hạn
 * - ✅ Auto-check response.success field (HTTP 200 + success: false)
 * - ✅ Type-safe configuration
 * - ✅ RETRY 1 lần khi gặp 401 — refresh token rồi gửi lại request
 *
 * Usage:
 * ```typescript
 * import { apiCall } from '../../../../../shared/services/api';
 *
 * // Basic usage
 * const response = await apiCall(url, {
 *   method: 'GET',
 * });
 *
 * // Silent mode (no logs)
 * const response = await apiCall(url, {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * }, {
 *   silent: true,
 * });
 * ```
 *
 * Flow:
 * 1. Log request (debug)
 * 2. Build headers with current token (dùng buildApiHeadersAsync — tự động refresh nếu cần)
 * 3. Make request
 * 4. If HTTP 200 OK:
 *    - Log successful response (debug)
 *    - ✅ Check response.success field
 *    - If success === false → Return response (caller xử lý)
 *    - Otherwise → Return response
 * 5. If 401 Unauthorized:
 *    - ✅ RETRY 1 lần: refresh token → gửi lại request với token mới
 *    - Nếu vẫn 401 → throw UnauthorizedError (logout)
 * 6. If other errors:
 *    - Handle via handleApiError()
 * 7. Return response
 *
 * Token Management:
 * - buildApiHeadersAsync tự động refresh token nếu sắp hết hạn (dùng TokenManager.getAccessTokenWithRefresh)
 * - Nếu 401 vẫn xảy ra → retry 1 lần với token mới
 * - Nếu retry vẫn 401 → token thực sự hết hạn → force logout
 */

import { buildApiHeadersAsync, handleApiError } from './ApiHelpers'
import { TokenManager } from './TokenManager'
import { ApiLogger } from './ApiLogger'
import type { ApiResponse } from './types'

/**
 * Configuration for apiCall()
 */
export interface ApiCallConfig {
  /**
   * Silent mode - suppress logs
   * @default false
   */
  silent?: boolean
  
  /**
   * Skip auto-inject Authorization header (for login, register, public endpoints)
   * @default false
   */
  skipAuth?: boolean
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<ApiCallConfig> = {
  silent: false,
  skipAuth: false,
}

/**
 * Main API call wrapper
 *
 * ✅ Centralized logging for all requests/responses
 * ✅ Auto-build headers with auto-refresh (buildApiHeadersAsync)
 * ✅ Auto-check response.success field (HTTP 200 + success: false)
 * ✅ RETRY 1 lần khi gặp 401 — refresh token rồi gửi lại request
 *
 * @param url - Full API URL (use buildApiUrl() to construct)
 * @param options - Fetch RequestInit options
 * @param config - Configuration options
 * @returns Promise<Response> - Fetch Response object
 * @throws Error - On validation errors, server errors, or HTTP errors
 *
 * @example
 * ```typescript
 * // Simple GET request
 * const response = await apiCall(buildApiUrl('/api/customers'), {
 *   method: 'GET',
 * });
 *
 * // POST request with data
 * const response = await apiCall(buildApiUrl('/api/customers'), {
 *   method: 'POST',
 *   body: JSON.stringify(customerData),
 * });
 *
 * // Silent mode (no logs)
 * const response = await apiCall(url, { method: 'GET' }, { silent: true });
 * ```
 */
export async function apiCall(
  url: string,
  options: RequestInit = {},
  config: ApiCallConfig = {}
): Promise<Response> {
  // Merge with defaults
  const { silent, skipAuth } = { ...DEFAULT_CONFIG, ...config }

  // ✅ Log request
  const method = options.method || 'GET'
  if (!silent) {
    ApiLogger.debug(`📥 [Request] ${method} ${url}`, {
      body: options.body ? '(body present)' : undefined,
    })
  }

  try {
    // Build headers with JWT token (skip if skipAuth = true)
    // ✅ Dùng buildApiHeadersAsync — tự động refresh token nếu sắp hết hạn
    const baseHeaders = skipAuth ? {} : await buildApiHeadersAsync()
    const mergedHeaders = {
      ...baseHeaders,
      ...(options.headers || {}), // Override with custom headers if provided
    }

    // Khi body là FormData, xóa Content-Type để browser tự set multipart/form-data; boundary=...
    // Chỉ ảnh hưởng đến request có body instanceof FormData
    if (options.body instanceof FormData) {
      delete (mergedHeaders as Record<string, string>)['Content-Type']
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: mergedHeaders,
    }

    // Make request
    const response = await fetch(url, requestOptions)

    // ✅ Success - Check HTTP status first
    if (response.ok) {
      // ✅ Log successful response
      if (!silent) {
        ApiLogger.debug(`✅ [Response] ${method} ${url} - ${response.status}`, {
          contentType: response.headers.get('content-type'),
        })
      }

      // ✅ Check success field in response body (HTTP 200 + success: false)
      // Clone response để có thể read body multiple times
      const clonedResponse = response.clone()

      try {
        const contentType = response.headers.get('content-type')

        // Only check success field if response is JSON
        if (contentType?.includes('application/json')) {
          const data = await clonedResponse.json()

          // Check if response has success field and it's false
          if (data.success === false) {
            // Trả về response gốc để caller tự xử lý qua if (res.success)
            // Không throw — đây là business error do server kiểm soát, không phải exception
            if (!silent) {
              ApiLogger.info(
                `⚠️ [apiCall] HTTP 200 but success=false for ${url}`,
                {
                  errorCode: data.errorCode,
                  message: data.message,
                  errorDetails: data.errorDetails,
                }
              )
            }
            return response
          }
        }
      } catch (parseError: any) {
        // JSON parse error — bỏ qua, return response gốc
        // (ví dụ: file download, response không phải JSON)
        void parseError
      }

      return response
    }

    // ❌ Non-OK response - Log warning
    if (!silent) {
      ApiLogger.warn(`⚠️ [Response] ${method} ${url} - ${response.status}`, {
        statusText: response.statusText,
      })
    }

    // 401 Unauthorized → RETRY 1 lần với token mới
    if (response.status === 401) {
      // ⭐ RETRY: Thử refresh token và gửi lại request
      ApiLogger.info(`🔄 [apiCall] 401 received, attempting token refresh and retry for ${url}`)
      const refreshed = await TokenManager.refreshAccessToken()

      if (refreshed) {
        // Lấy token mới và retry request
        const newToken = TokenManager.getAccessToken()
        if (newToken) {
          const retryHeaders = {
            ...(await buildApiHeadersAsync()),
            ...(options.headers || {}),
          }
          const retryOptions: RequestInit = {
            ...options,
            headers: retryHeaders,
          }
          const retryResponse = await fetch(url, retryOptions)

          if (retryResponse.ok) {
            if (!silent) {
              ApiLogger.info(`✅ [apiCall] Retry successful after token refresh for ${url}`)
            }
            return retryResponse
          }

          // Retry vẫn thất bại → fall through để xử lý lỗi
          if (!silent) {
            ApiLogger.warn(`⚠️ [apiCall] Retry still failed with status ${retryResponse.status} for ${url}`)
          }

          // Nếu retry vẫn 401 → token thực sự hết hạn
          if (retryResponse.status === 401) {
            await handleApiError(retryResponse)
          }

          // Retry gặp lỗi khác → normalize về success=false
          const retryBody = await retryResponse.json().catch(() => null)
          if (retryBody) {
            return new Response(
              JSON.stringify({
                success: false,
                data: null,
                message: retryBody.message ?? `Lỗi HTTP ${retryResponse.status}`,
                errorCode: retryBody.errorCode,
                errorDetails: retryBody.errorDetails ?? retryBody.errors,
                timestamp: retryBody.timestamp ?? retryBody.traceId,
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
          }
          throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`)
        }
      }

      // Refresh thất bại hoặc không có token mới → throw để hệ thống redirect login
      await handleApiError(response)
    }

    // Các lỗi HTTP khác (400, 403, 404, 409, 500…) → normalize về success=false
    // Không throw — caller xử lý qua if (res.success) ... else setServerError(res)
    // Catch block trong dialog chỉ còn dành cho lỗi mạng thực sự
    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errBody = await response.json() as {
          message?: string
          title?: string
          errorCode?: string
          errorDetails?: unknown
          errors?: unknown
          timestamp?: string
          traceId?: string
        }
        if (!silent) {
          ApiLogger.info(
            `⚠️ [apiCall] HTTP ${response.status} normalized to success=false for ${url}`,
            { errorCode: errBody.errorCode, message: errBody.message }
          )
        }
        return new Response(
          JSON.stringify({
            success: false,
            data: null,
            message: errBody.message ?? errBody.title ?? `Lỗi HTTP ${response.status}`,
            errorCode: errBody.errorCode,
            errorDetails: errBody.errorDetails ?? errBody.errors,
            timestamp: errBody.timestamp ?? errBody.traceId,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } catch {
      // Không parse được body JSON — fall through để throw lỗi mạng
    }

    // Non-JSON body hoặc parse thất bại → ném như lỗi kết nối
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  } catch (error: any) {
    // Re-throw handled errors (from handleApiError or CustomError)
    if (
      error.name === 'ValidationError' ||
      error.name === 'UnauthorizedError' ||
      error.name === 'ForbiddenError' ||
      error.name === 'NotFoundError' ||
      error.name === 'ServerError' ||
      error.name === 'CustomError'
    ) {
      throw error
    }

    // Network errors or other unexpected errors
    if (!silent) {
      ApiLogger.error(`❌ [apiCall] Request failed: ${error.message}`, error)
    }

    throw error
  }

  // Should never reach here (handleApiError always throws)
  throw new Error(`[apiCall] Unexpected code path for ${method} ${url}`)
}

/**
 * Wrapper để gọi API theo pattern cũ: crmApiCall<T>(method, url, payload?)
 *
 * Dùng cho các CRM API services — trả về Promise<ApiResponse<T>> thay vì Promise<Response>.
 *
 * @param method - HTTP method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
 * @param url    - Full URL (dùng buildCrmUrl() hoặc buildCrmUrlWithParams())
 * @param payload - Request body (optional, bỏ qua với GET/DELETE)
 */
export async function crmApiCall<T>(
  method: string,
  url: string,
  payload?: unknown
): Promise<ApiResponse<T>> {
  const hasBody = payload !== undefined && method !== 'GET' && method !== 'DELETE'
  const options: RequestInit = {
    method,
    ...(hasBody ? { body: JSON.stringify(payload) } : {}),
  }
  const response = await apiCall(url, options)
  return response.json() as Promise<ApiResponse<T>>
}

/**
 * ==========================================
 * FILE UPLOAD/DOWNLOAD API CALL
 * ==========================================
 */

/**
 * API call wrapper specifically for file operations (upload/download)
 * 
 * ⚠️ CRITICAL DIFFERENCES from apiCall():
 * - Expects FormData as body for uploads
 * - Does NOT set Content-Type header (browser sets multipart/form-data with boundary automatically)
 * - Only adds Authorization and X-Domain-Id headers
 * - Handles Blob responses for downloads
 * 
 * @param url - Full API URL
 * @param options - Fetch options (must include body: FormData for upload)
 * @param config - API call configuration
 * @returns Promise<Response>
 * 
 * @example Upload file:
 * ```typescript
 * const formData = new FormData()
 * formData.append('File', file)
 * formData.append('InvoiceSymbol', 'C25MKH')
 * 
 * const response = await apiCallFile(url, {
 *   method: 'POST',
 *   body: formData
 * })
 * ```
 * 
 * @example Download file:
 * ```typescript
 * const response = await apiCallFile(url, { method: 'GET' })
 * const blob = await response.blob()
 * ```
 */
export async function apiCallFile(
  url: string,
  options: RequestInit = {},
  config: ApiCallConfig = {}
): Promise<Response> {
  const { silent } = { ...DEFAULT_CONFIG, ...config }
  const method = options.method || 'GET'

  // ✅ Log request
  if (!silent) {
    ApiLogger.debug(`📥 [FileRequest] ${method} ${url}`, {
      hasBody: !!options.body,
      bodyType: options.body instanceof FormData ? 'FormData' : typeof options.body,
    })
  }

  try {
    // ⚠️ CRITICAL: Build headers WITHOUT Content-Type
    // Browser will automatically set "multipart/form-data; boundary=..." for FormData
    const headers: Record<string, string> = {}

    // Add Authorization header
    const token = TokenManager.getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('⚠️ [apiCallFile] No access token - file operation may fail')
    }

    // Add X-Domain-Id header
    const domainId = TokenManager.getDomainId()
    if (domainId) {
      headers['X-Domain-Id'] = domainId
    } else {
      console.warn('⚠️ [apiCallFile] No domainId - file operation may fail')
    }

    // ✅ Debug log for FormData
    if (options.body instanceof FormData && !silent) {
      const entries = Array.from(options.body.entries())
      ApiLogger.debug(`📤 [FileRequest] FormData entries:`, {
        count: entries.length,
        fields: entries.map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : 'string',
          value: value instanceof File ? `${value.name} (${value.size} bytes)` : value,
        })),
      })
    }

    const requestOptions: RequestInit = {
      ...options,
      headers, // ⚠️ NO Content-Type - browser will add it automatically
    }

    // Make request
    const response = await fetch(url, requestOptions)

    // ✅ Success
    if (response.ok) {
      if (!silent) {
        ApiLogger.debug(`✅ [FileResponse] ${method} ${url} - ${response.status}`, {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
        })
      }

      // ✅ Check success field for JSON responses (same logic as apiCall)
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const clonedResponse = response.clone()
        try {
          const data = await clonedResponse.json()
          if (data.success === false) {
            const hasErrorContent = data.errorDetails || data.message
            if (hasErrorContent) {
              const details = data.errorDetails ?? [data.message]
              const error = new Error(data.message || 'Validation error occurred') as any
              error.name = data.errorCode
              error.errorDetails = details
              error.status = response.status
              error.traceId = data.timestamp || data.traceId

              if (!silent) {
                ApiLogger.info(`⚠️ [apiCallFile] HTTP 200 but success=false`, {
                  errorCode: data.errorCode,
                  message: error.message,
                  errorDetails: details,
                })
              }
              throw error
            }
          }
        } catch (parseError: any) {
          if (parseError.name === 'CustomError') {
            throw parseError
          }
          // JSON parse error - ignore, return original response
        }
      }

      return response
    }

    // ❌ Non-OK response
    if (!silent) {
      ApiLogger.warn(`⚠️ [FileResponse] ${method} ${url} - ${response.status}`, {
        statusText: response.statusText,
      })
    }

    // Handle HTTP errors
    await handleApiError(response)
  } catch (error: any) {
    // Re-throw handled errors
    if (
      error.name === 'ValidationError' ||
      error.name === 'UnauthorizedError' ||
      error.name === 'ForbiddenError' ||
      error.name === 'NotFoundError' ||
      error.name === 'ServerError' ||
      error.name === 'CustomError'
    ) {
      throw error
    }

    // Network or unexpected errors
    if (!silent) {
      ApiLogger.error(`❌ [apiCallFile] ${method} ${url} failed`, error)
    }
    throw error
  }

  // Should never reach here
  throw new Error(`[apiCallFile] Unexpected code path for ${method} ${url}`)
}

/**
 * ==========================================
 * CONVENIENCE METHODS
 * ==========================================
 */

/**
 * GET request wrapper
 *
 * @example
 * ```typescript
 * const response = await apiGet(buildApiUrl('/api/customers'));
 * const data = await response.json();
 * ```
 */
export async function apiGet(
  url: string,
  config?: ApiCallConfig
): Promise<Response> {
  return apiCall(url, { method: 'GET' }, config)
}

/**
 * POST request wrapper
 *
 * @example
 * ```typescript
 * const response = await apiPost(
 *   buildApiUrl('/api/customers'),
 *   customerData
 * );
 * ```
 */
export async function apiPost(
  url: string,
  data: any,
  config?: ApiCallConfig
): Promise<Response> {
  return apiCall(
    url,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    config
  )
}

/**
 * PUT request wrapper
 *
 * @example
 * ```typescript
 * const response = await apiPut(
 *   buildApiUrl(`/api/customers/${id}`),
 *   customerData
 * );
 * ```
 */
export async function apiPut(
  url: string,
  data: any,
  config?: ApiCallConfig
): Promise<Response> {
  return apiCall(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    config
  )
}

/**
 * DELETE request wrapper
 *
 * @example
 * ```typescript
 * const response = await apiDelete(
 *   buildApiUrl(`/api/customers/${id}`)
 * );
 * ```
 */
export async function apiDelete(
  url: string,
  config?: ApiCallConfig
): Promise<Response> {
  return apiCall(url, { method: 'DELETE' }, config)
}

/**
 * PATCH request wrapper — dùng cho các partial update (updateStatus, close, reopen...)
 *
 * @example
 * ```typescript
 * const response = await apiPatch(
 *   buildApiUrl(`/api/departments/${id}/status`),
 *   { status: 0 }
 * );
 * ```
 */
export async function apiPatch(
  url: string,
  data?: any,
  config?: ApiCallConfig
): Promise<Response> {
  return apiCall(
    url,
    {
      method: 'PATCH',
      body: data != null ? JSON.stringify(data) : undefined,
    },
    config
  )
}

/**
 * ==========================================
 * UTILITY FUNCTIONS
 * ==========================================
 */

/**
 * Extract error info from response
 * Useful for logging or custom error handling
 *
 * @example
 * ```typescript
 * const response = await fetch(url, options);
 * if (!response.ok) {
 *   const errorInfo = await getErrorInfo(response);
 *   console.error('API Error:', errorInfo);
 * }
 * ```
 */
export async function getErrorInfo(response: Response): Promise<{
  status: number
  statusText: string
  message?: string
  traceId?: string
}> {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    try {
      const errorData = await response.json()
      return {
        status: response.status,
        statusText: response.statusText,
        message: errorData.message || errorData.title,
        traceId: errorData.traceId,
      }
    } catch {
      // Failed to parse JSON
    }
  }

  return {
    status: response.status,
    statusText: response.statusText,
  }
}

/**
 * API call wrapper specifically for file uploads with FormData
 *
 * ✅ Does NOT set Content-Type (browser sets multipart/form-data with boundary)
 * ✅ Only adds Authorization + X-Domain-Id headers
 * ✅ Same error handling as apiCall()
 *
 * @param url - Full API URL (use buildApiUrl() to construct)
 * @param formData - FormData object with file
 * @param config - Configuration options
 * @returns Promise<Response> - Fetch Response object
 * @throws Error - On validation errors, server errors, or HTTP errors
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('File', file); // CRITICAL: Field name must match backend DTO (case-sensitive)
 *
 * const response = await apiFileCall(
 *   buildApiUrl('/api/customers/import'),
 *   formData
 * );
 *
 * const data = await response.json();
 * ```
 */
export async function apiFileCall(
  url: string,
  formData: FormData,
  config: ApiCallConfig = {}
): Promise<Response> {
  // Merge with defaults
  const { silent } = { ...DEFAULT_CONFIG, ...config }

  // ✅ Log request
  if (!silent) {
    // Build detailed formData info: for Files include name and size
    const formEntries = Array.from(formData.entries()).map(([k, v]) => {
      try {
        if (typeof v === 'object' && v instanceof File) {
          return `${k}: ${v.name} (${v.size} bytes)`
        }
      } catch {
        // In some runtimes instanceof File may not work; fallback to key only
      }
      return `${k}: ${String(v)}`
    })

    ApiLogger.debug(`📥 [File Upload] POST ${url}`, {
      formData: formEntries,
      formDataKeys: Array.from(formData.keys()),
    })
  }

  try {
    // ✅ Build headers WITHOUT Content-Type
    // Browser will automatically set: Content-Type: multipart/form-data; boundary=...
    const token = TokenManager.getAccessToken()
    const domainId = TokenManager.getDomainId()

    const headers: Record<string, string> = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('⚠️ [apiFileCall] No access token found - API call may fail')
    }

    if (domainId) {
      headers['X-Domain-Id'] = domainId
    } else {
      console.warn('⚠️ [apiFileCall] DomainId not found - API call may fail')
    }

    // Make request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    // ✅ Success - Check HTTP status first
    if (response.ok) {
      // ✅ Log successful response
      if (!silent) {
        ApiLogger.debug(`✅ [File Upload Response] POST ${url} - ${response.status}`, {
          contentType: response.headers.get('content-type'),
        })
      }

      // ✅ Check success field in response body (same as apiCall)
      const clonedResponse = response.clone()

      try {
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
          const data = await clonedResponse.json()

          if (data.success === false) {
            const hasErrorContent = data.errorDetails || data.message

            if (hasErrorContent) {
              const details = data.errorDetails ?? [data.message]
              
              const error = new Error(
                data.message || 'Validation error occurred'
              ) as any
              error.name = data.errorCode
              error.errorDetails = details
              error.status = response.status
              error.traceId = data.timestamp || data.traceId

              if (!silent) {
                ApiLogger.info(
                  `⚠️ [apiFileCall] HTTP 200 but success=false (ValidationError) for ${url}`,
                  { 
                    errorCode: data.errorCode, 
                    message: error.message,
                    errorDetails: details 
                  }
                )
              }

              throw error
            } else {
              const error = new Error(
                data.message || 'System error occurred'
              ) as any
              error.name = data.errorCode
              error.errorCode = data.errorCode || 'SYSTEM_ERROR'
              error.status = response.status
              error.traceId = data.timestamp || data.traceId

              if (!silent) {
                ApiLogger.warn(
                  `⚠️ [apiFileCall] HTTP 200 but success=false (CustomError) for ${url}`,
                  { errorCode: data.errorCode, message: error.message }
                )
              }

              throw error
            }
          }
        }
      } catch (error) {
        // If parsing failed or error thrown above, re-throw
        if ((error as any).errorDetails || (error as any).errorCode) {
          throw error
        }
        // Otherwise continue (non-JSON response or parsing error)
      }

      return response
    }

    // ❌ Error - Handle via handleApiError()
    await handleApiError(response)

    // This line should never be reached (handleApiError always throws)
    return response
  } catch (error) {
    // ✅ Log error
    if (!silent) {
      ApiLogger.error(`❌ [File Upload Error] POST ${url}`, {
        error: error instanceof Error ? error.message : String(error),
      })
    }

    throw error
  }
}
