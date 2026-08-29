/**
 * API Logger - Structured logging for API calls
 *
 * ✅ STANDARDIZED API (v3.0)
 * - 4 core methods: info(), warn(), error(), debug()
 * - Centralized logging in ApiClient.ts
 *
 * Features:
 * - Pretty-printed logs with emojis
 * - Auto-disabled in production
 * - Request duration measurement
 * - Error stack trace logging
 *
 * Usage:
 * ```typescript
 * import { ApiLogger } from '../../../../../shared/services/api';
 *
 * ApiLogger.info('User logged in', { userId: '123' });
 * ApiLogger.warn('Token expiring soon', { expiresIn: 60 });
 * ApiLogger.error('API Error', error, { endpoint: '/api/customers' });
 * ApiLogger.debug('Cache hit', { key: 'user:123' });
 * ```
 */

/**
 * ==========================================
 * CONFIGURATION
 * ==========================================
 */

/**
 * Debug mode configuration
 * Set to false to disable debug logs even in development
 */
const ENABLE_DEBUG_LOGS = false // ⏸️ DISABLED - Reduce console noise

/**
 * Check if logging is enabled
 * Logs are disabled in production to reduce console noise
 */
function isLoggingEnabled(): boolean {
  // Check if in production environment
  try {
    const isProduction =
      typeof import.meta !== 'undefined' &&
      import.meta.env?.MODE === 'production'

    // Disable logging in production
    return !isProduction
  } catch {
    // If can't determine environment, enable logging (development fallback)
    return true
  }
}

/**
 * ==========================================
 * CORE 4 METHODS (STANDARDIZED v2.0)
 * ==========================================
 */

/**
 * Log informational message
 *
 * Use for:
 * - Successful operations
 * - State changes
 * - Informational events
 *
 * @param message - Info message
 * @param data - Additional data (optional)
 *
 * @example
 * ```typescript
 * ApiLogger.info('User logged in', { userId: '123', timestamp: Date.now() });
 * // Output:
 * // ℹ️ [INFO] User logged in
 * //   📋 Data: { userId: '123', timestamp: 1697808000000 }
 * ```
 */
export function info(message: string, data?: any): void {
  if (!isLoggingEnabled()) return

  console.log(`ℹ️ [INFO] ${message}`)

  if (data) {
    console.log('  📋 Data:', data)
  }
}

/**
 * Log warning message
 *
 * Use for:
 * - Controlled errors (validation, auth, not found, conflict)
 * - Deprecated features
 * - Non-critical issues
 * - Business logic warnings
 *
 * @param message - Warning message
 * @param data - Additional data (optional)
 *
 * @example
 * ```typescript
 * ApiLogger.warn('Deprecated API endpoint used', { endpoint: '/api/old-endpoint' });
 * // Output:
 * // ⚠️ [WARNING] Deprecated API endpoint used
 * //   📋 Data: { endpoint: '/api/old-endpoint' }
 * ```
 */
export function warn(message: string, data?: any): void {
  if (!isLoggingEnabled()) return

  console.warn(`⚠️ [WARNING] ${message}`)

  if (data) {
    console.warn('  📋 Data:', data)
  }
}

/**
 * Log error message
 *
 * Use for:
 * - Uncontrolled errors (server errors 5xx, network errors)
 * - Parse errors
 * - System errors
 * - Unexpected errors
 *
 * @param context - Error context (e.g., "API Request", "Component", "Hook")
 * @param error - Error object or message (optional)
 * @param data - Additional error data (optional)
 *
 * @example
 * ```typescript
 * try {
 *   // ... some operation ...
 * } catch (error) {
 *   ApiLogger.error('SubOwnerUserDialog', error, { userId: '123' });
 * }
 * // Output:
 * // ❌ [ERROR] SubOwnerUserDialog
 * //   🔴 Details: Invalid user data
 * //   📋 Context: { userId: '123' }
 * //   📚 Stack: Error: Invalid user data\n    at ...
 * ```
 */
export function error(context: string, error?: any, data?: any): void {
  if (!isLoggingEnabled()) return

  console.error(`❌ [ERROR] ${context}`)

  if (error) {
    console.error('  🔴 Details:', error?.message || error)
  }

  if (data) {
    console.error('  📋 Context:', data)
  }

  if (error?.stack) {
    console.error('  📚 Stack:', error.stack)
  }
}

/**
 * Log debug information (only in development)
 *
 * Use for:
 * - Development debugging
 * - Request/Response details
 * - Cache operations
 * - Performance metrics
 *
 * @param label - Debug label
 * @param data - Debug data (optional)
 *
 * @example
 * ```typescript
 * ApiLogger.debug('Token Info', {
 *   hasToken: !!token,
 *   tokenLength: token?.length,
 *   expiresIn: expiresIn
 * });
 * // Output:
 * // 🔍 [DEBUG] Token Info { hasToken: true, tokenLength: 256, ... }
 * ```
 */
export function debug(label: string, data?: any): void {
  if (!isLoggingEnabled() || !ENABLE_DEBUG_LOGS) return

  console.log(`🔍 [DEBUG] ${label}`, data || '')
}

/**
 * ==========================================
 * UTILITY FUNCTIONS
 * ==========================================
 */

/**
 * Create a timer for measuring request duration
 *
 * @returns Object with start time and stop function
 *
 * @example
 * ```typescript
 * const timer = ApiLogger.createTimer();
 *
 * // ... make API call ...
 *
 * const duration = timer.stop();
 * ApiLogger.debug('Request completed', { duration });
 * ```
 */
export function createTimer() {
  const startTime = Date.now()

  return {
    startTime,
    stop: () => Date.now() - startTime,
  }
}

/**
 * ==========================================
 * EXPORTS
 * ==========================================
 */

/**
 * ApiLogger singleton object
 *
 * ✅ STANDARDIZED v3.0 - 4 Core Methods:
 *
 * Usage:
 * ```typescript
 * import { ApiLogger } from '../../../../../shared/services/api';
 *
 * ApiLogger.info('User logged in', { userId: '123' });
 * ApiLogger.warn('Token expiring', { expiresIn: 60 });
 * ApiLogger.error('API Error', error, { endpoint: '/api/customers' });
 * ApiLogger.debug('Cache hit', { key: 'user:123' });
 * ```
 */
export const ApiLogger = {
  // ✅ Core 4 methods (STANDARDIZED v3.0)
  info,
  warn,
  error,
  debug,

  // ✅ Utilities
  createTimer,
  isEnabled: isLoggingEnabled,
}

/**
 * Default export for convenience
 */
export default ApiLogger
