/**
 * API Services Barrel Export
 *
 * HTTP Client Layer - Core foundation for all API interactions
 *
 * ✅ Shared API Utilities:
 * - ApiClient: Auto-retry on 401 with token refresh
 * - TokenManager: JWT token management với auto-refresh
 * - ApiHelpers: Build headers, handle errors, parse validation
 * - ApiLogger: Structured logging cho API calls
 * - ApiConfig: Centralized API configuration (BASE_URL, timeouts)
 * - types: Shared API types (PagingInfo, ApiResponse)
 * - mockGate: Điểm gate mock duy nhất — chuyển sang BE thật khi tắt
 */

export * from './ApiClient'
export * from './useApiRequest'
export * from './toastHelpers'

// ✅ Shared API Utilities
export * from './TokenManager'
export * from './ApiHelpers'
export * from './ApiLogger'
export * from './ApiConfig'
export * from './types'
export * from './mockGate'
