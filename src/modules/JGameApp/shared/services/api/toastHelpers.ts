/**
 * Toast Helpers
 *
 * Utility functions for showing toast notifications using Sonner
 *
 * Usage:
 * ```typescript
 * import { showSuccessToast, showErrorToast } from './toastHelpers';
 *
 * showSuccessToast('Operation completed successfully');
 * showErrorToast('Something went wrong');
 * ```
 */

import { toast } from 'sonner'

/**
 * Show success toast notification
 * Duration: 3 seconds
 */
export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    closeButton: true,
  })
}

/**
 * Show error toast notification
 * Duration: 4 seconds
 */
export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    closeButton: true,
  })
}

/**
 * Show warning toast notification
 * Duration: 4 seconds
 */
export function showWarningToast(message: string) {
  toast.warning(message, {
    duration: 4000,
    position: 'top-right',
    closeButton: true,
  })
}

/**
 * Show info toast notification
 * Duration: 2 seconds
 */
export function showInfoToast(message: string) {
  toast.info(message, {
    duration: 2000,
    position: 'top-right',
    closeButton: true,
  })
}
