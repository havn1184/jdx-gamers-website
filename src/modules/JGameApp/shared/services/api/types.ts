
/**
 * Shared API Types - Common types used across all API services
 *
 * Contains:
 * - Generic response wrappers (PagingInfo, ApiResponse)
 * - Error response types (already in ApiHelpers.ts)
 * - Common data structures
 *
 * Usage:
 * ```typescript
 * import { PagingInfo, ApiResponse } from '../../../../../shared/services/api';
 *
 * // Use in API service return types
 * async getCustomers(): Promise<ApiResponse<PagingInfo<Customer>>> {
 *   // ...
 * }
 * ```
 */

/**
 * ==========================================
 * PAGINATION TYPES
 * ==========================================
 */

/**
 * Generic pagination response wrapper
 *
 * Used by all list endpoints that support pagination.
 * Backend returns this structure for paginated data.
 *
 * @template T - Type of items in the list
 *
 * @example
 * ```typescript
 * // Customer list response
 * interface CustomerListResponse {
 *   items: Customer[];
 *   total: number;
 *   page: number;
 *   limit: number;
 *   totalPages: number;
 * }
 *
 * // Can be typed as:
 * type CustomerListResponse = PagingInfo<Customer>;
 * ```
 */
export interface PagingInfo<T> {
  /**
   * Array of data items for current page
   */
  items: T[]

  /**
   * Total number of items across all pages
   */
  total: number

  /**
   * Current page number (1-based indexing)
   *
   * @example
   * page: 1 → First page
   * page: 2 → Second page
   */
  page: number

  /**
   * Number of items per page
   *
   * @example
   * limit: 20 → Show 20 items per page
   */
  limit: number

  /**
   * Total number of pages
   *
   * Calculated as: Math.ceil(total / limit)
   *
   * @example
   * total: 156, limit: 20 → totalPages: 8
   */
  totalPages: number
}

/**
 * ==========================================
 * API RESPONSE TYPES
 * ==========================================
 */

/**
 * Standard API response wrapper
 *
 * Used by all API endpoints to provide consistent response structure.
 * Backend may return this structure for both success and error cases.
 *
 * @template T - Type of data payload
 *
 * @example Success response
 * ```typescript
 * {
 *   success: true,
 *   data: { id: '123', name: 'ABC Company' },
 *   message: 'Customer created successfully'
 * }
 * ```
 *
 * @example Error response
 * ```typescript
 * {
 *   success: false,
 *   data: null,
 *   message: 'Failed to create customer',
 *   errors: {
 *     'TaxCode': ['Mã số thuế không hợp lệ'],
 *     'Email': ['Email đã tồn tại']
 *   }
 * }
 * ```
 */
export interface ApiResponse<T> {
  /**
   * Operation success flag
   *
   * - true: Operation completed successfully
   * - false: Operation failed
   */
  success: boolean

  /**
   * Response data payload
   *
   * - Success: Contains requested data
   * - Error: Usually null
   */
  data: T | null

  /**
   * Human-readable message
   *
   * - Success: Success message (e.g., 'Tạo khách hàng thành công')
   * - Error: Error message (e.g., 'Lỗi xác thực dữ liệu')
   */
  message: string | null

  /**
   * Validation errors (RFC 9110 ProblemDetails format)
   *
   * Only present for 400 Bad Request responses with validation errors.
   * Backend may return either a single string or array of strings.
   *
   * @see ApiHelpers.ts for error handling utilities
   *
   * @example Single error
   * ```typescript
   * errors: {
   *   'TaxCode': 'Mã số thuế không hợp lệ'
   * }
   * ```
   *
   * @example Multiple errors
   * ```typescript
   * errors: {
   *   'TaxCode': ['Mã số thuế không hợp lệ', 'Mã số thuế đã tồn tại'],
   *   'Email': ['Email không hợp lệ']
   * }
   * ```
   */
  errors?: Record<string, string | string[]>

  /**
   * Error code for error responses
   *
   * Only present when success is false.
   * Used to identify specific error types (e.g., VALIDATION_ERROR, NETWORK_ERROR)
   */
  errorCode?: string

  /**
   * Detailed error information
   *
   * Only present for error responses with additional context.
   * Backend may return:
   * - Array of error messages (strings)
   * - Array of validation details (objects with message property)
   * - Single error string
   *
   * @example String array
   * ```typescript
   * errorDetails: ['Dòng 1: Mã số thuế không hợp lệ', 'Dòng 3: Email không hợp lệ']
   * ```
   * 
   * @example Object array
   * ```typescript
   * errorDetails: [{message: 'Tài khoản đang hoạt động'}, {message: 'Không thể khóa'}]
   * ```
   */
  errorDetails?: string | string[] | any[]

  /**
   * HTTP Status code (optional, if returned in body)
   */
  status?: number

  /**
   * Timestamp of the response
   *
   * ISO 8601 format datetime string from backend.
   *
   * @example
   * ```typescript
   * timestamp: '2024-01-15T10:30:00Z'
   * ```
   */
  timestamp?: string
}

/**
 * ==========================================
 * LIST QUERY PARAMETERS
 * ==========================================
 */

/**
 * Base pagination parameters
 *
 * Used by all list endpoints that support pagination.
 * Extend this interface for feature-specific filters.
 *
 * @example Extend for customer filters
 * ```typescript
 * export interface CustomerListParams extends BasePaginationParams {
 *   type?: number;        // Customer type filter
 *   searchTerm?: string;  // Search by name/taxCode
 * }
 * ```
 */
export interface BasePaginationParams {
  /**
   * Page number (1-based indexing)
   *
   * @default 1
   * @example
   * page: 1 → First page
   * page: 2 → Second page
   */
  page?: number

  /**
   * Number of items per page
   *
   * @default 20
   * @example
   * limit: 10 → Show 10 items per page
   * limit: 50 → Show 50 items per page
   */
  limit?: number
}

/**
 * Base search parameters
 *
 * Used by list endpoints that support search functionality.
 */
export interface BaseSearchParams extends BasePaginationParams {
  /**
   * Search term for filtering results
   *
   * @example
   * searchTerm: 'ABC' → Search for 'ABC' in name, code, etc.
   */
  searchTerm?: string
}

/**
 * ==========================================
 * SORTING & FILTERING
 * ==========================================
 */

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort parameters
 */
export interface SortParams {
  /**
   * Field to sort by
   *
   * @example
   * sortBy: 'name' → Sort by name field
   * sortBy: 'createdAt' → Sort by creation date
   */
  sortBy?: string

  /**
   * Sort direction
   *
   * @example
   * sortDirection: 'asc' → Ascending (A-Z, 0-9)
   * sortDirection: 'desc' → Descending (Z-A, 9-0)
   */
  sortDirection?: SortDirection
}

/**
 * ==========================================
 * COMMON DATA STRUCTURES
 * ==========================================
 */

/**
 * ID-Name pair
 *
 * Common structure for dropdown options, reference data, etc.
 *
 * @example
 * ```typescript
 * const customerTypes: IdNamePair[] = [
 *   { id: '1', name: 'Khách hàng' },
 *   { id: '2', name: 'Đại lý' },
 *   { id: '3', name: 'Đối tác' }
 * ];
 * ```
 */
export interface IdNamePair {
  id: string
  name: string
}

/**
 * Key-Value pair
 *
 * Generic key-value structure
 */
export interface KeyValuePair<T = any> {
  key: string
  value: T
}

/**
 * ==========================================
 * METADATA & TIMESTAMPS
 * ==========================================
 */

/**
 * Base entity with timestamps
 *
 * Common fields for all entities with audit trail.
 * Extend this interface for feature-specific entities.
 *
 * @example
 * ```typescript
 * export interface Customer extends BaseEntity {
 *   name: string;
 *   taxCode: string;
 *   // ... other customer fields
 * }
 * ```
 */
export interface BaseEntity {
  /**
   * Entity ID (usually UUID or integer)
   */
  id: string

  /**
   * Creation timestamp (ISO 8601 format)
   *
   * @example "2025-10-09T10:30:00.000Z"
   */
  createdAt?: string

  /**
   * Last update timestamp (ISO 8601 format)
   *
   * @example "2025-10-09T14:45:00.000Z"
   */
  updatedAt?: string

  /**
   * User who created this entity
   */
  createdBy?: string

  /**
   * User who last updated this entity
   */
  updatedBy?: string
}

/**
 * ==========================================
 * FILE UPLOAD/DOWNLOAD
 * ==========================================
 */

/**
 * File upload response
 */
export interface FileUploadResponse {
  /**
   * Success flag
   */
  success: boolean

  /**
   * Uploaded file URL or path
   */
  fileUrl?: string

  /**
   * File name
   */
  fileName?: string

  /**
   * File size in bytes
   */
  fileSize?: number

  /**
   * Error message (if upload failed)
   */
  message?: string
}

/**
 * Import result
 *
 * Used for bulk import operations (Excel, CSV)
 */
export interface ImportResult {
  /**
   * Total number of rows processed
   */
  totalRows: number

  /**
   * Number of rows successfully imported
   */
  successCount: number

  /**
   * Number of rows that failed
   */
  errorCount: number

  /**
   * Detailed error messages
   *
   * @example
   * ```typescript
   * errors: [
   *   { row: 2, field: 'TaxCode', message: 'Mã số thuế không hợp lệ' },
   *   { row: 5, field: 'Email', message: 'Email đã tồn tại' }
   * ]
   * ```
   */
  errors?: Array<{
    row: number
    field: string
    message: string
  }>
}

/**
 * ==========================================
 * TYPE GUARDS
 * ==========================================
 */

/**
 * Check if response is successful
 *
 * @param response - API response
 * @returns true if success flag is true
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== null
}

/**
 * Check if response has pagination info
 *
 * @param data - Response data
 * @returns true if data is PagingInfo
 */
export function isPagingInfo<T>(data: any): data is PagingInfo<T> {
  return (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    'total' in data &&
    'page' in data &&
    'limit' in data &&
    'totalPages' in data
  )
}

/**
 * ==========================================
 * USAGE EXAMPLES
 * ==========================================
 *
 * @example API Service with PagingInfo
 * ```typescript
 * import { PagingInfo, ApiResponse } from '../../../../../shared/services/api';
 * import { Customer } from './types';
 *
 * export class CustomerApiService {
 *   static async getCustomers(
 *     params?: CustomerListParams
 *   ): Promise<ApiResponse<PagingInfo<Customer>>> {
 *     const url = buildApiUrlWithParams('/api/customers', params);
 *     const headers = buildApiHeaders();
 *
 *     const response = await fetch(url, { method: 'GET', headers });
 *
 *     if (!response.ok) {
 *       await handleApiError(response);
 *     }
 *
 *     return await response.json();
 *   }
 * }
 * ```
 *
 * @example Hook with type guards
 * ```typescript
 * import { isSuccessResponse, isPagingInfo } from '../../../../../shared/services/api';
 *
 * const response = await CustomerApiService.getCustomers(params);
 *
 * if (isSuccessResponse(response) && isPagingInfo(response.data)) {
 *   setCustomers(response.data.items);
 *   setTotal(response.data.total);
 * }
 * ```
 *
 * @example Extending base types
 * ```typescript
 * import { BaseEntity, BaseSearchParams } from '../../../../../shared/services/api';
 *
 * // Feature-specific entity
 * export interface Customer extends BaseEntity {
 *   name: string;
 *   taxCode: string;
 *   email: string;
 * }
 *
 * // Feature-specific params
 * export interface CustomerListParams extends BaseSearchParams {
 *   type?: number;
 *   status?: string;
 * }
 * ```
 */
