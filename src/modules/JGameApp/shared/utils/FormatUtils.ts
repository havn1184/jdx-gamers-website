// Utility functions để format dữ liệu - dùng chung cho toàn bộ website

/**
 * ==========================================
 * DATE & TIME FORMATTING (Chuẩn ISO)
 * ==========================================
 * 
 * Quy chuẩn format:
 * - Date: dd-MM-yyyy (VD: 15-01-2024)
 * - DateTime: dd-MM-yyyy HH:mm:ss (VD: 15-01-2024 10:30:45)
 * 
 * Áp dụng cho:
 * - Hiển thị dữ liệu trong bảng
 * - Control nhập liệu thời gian
 * - Export dữ liệu
 */

/**
 * Format số tiền theo định dạng VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format ngày theo định dạng dd-MM-yyyy (chuẩn ISO)
 * @param dateString - Chuỗi ngày cần format
 * @returns Ngày đã format theo định dạng dd-MM-yyyy hoặc "-" nếu không hợp lệ
 * 
 * @example
 * formatDate('2024-01-15') // "15-01-2024"
 * formatDate('2024-12-31T10:30:00') // "31-12-2024"
 * formatDate(null) // "-"
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '-'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

/**
 * Format ngày giờ theo định dạng dd-MM-yyyy HH:mm:ss (chuẩn ISO)
 * @param dateString - Chuỗi ngày giờ cần format
 * @returns Ngày giờ đã format theo định dạng dd-MM-yyyy HH:mm:ss hoặc "-" nếu không hợp lệ
 * 
 * @example
 * formatDateTime('2024-01-15T10:30:45') // "15-01-2024 10:30:45"
 * formatDateTime('2024-12-31T23:59:59') // "31-12-2024 23:59:59"
 * formatDateTime(null) // "-"
 */
export const formatDateTime = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return '-'

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '-'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
}

/**
 * ==========================================
 * CONTACT INFORMATION FORMATTING
 * ==========================================
 */

/**
 * Format số điện thoại Việt Nam
 * 
 * Hỗ trợ các định dạng:
 * - 10 chữ số: 0xxx xxx xxx (VD: 0912 345 678)
 * - 11 chữ số: 0xx xxxx xxxx (VD: 028 1234 5678 - số cố định)
 * 
 * @param phone - Số điện thoại cần format (string hoặc null/undefined)
 * @returns Số điện thoại đã format hoặc "-" nếu rỗng
 * 
 * @example
 * formatPhoneNumber('0912345678') // "0912 345 678"
 * formatPhoneNumber('02812345678') // "028 1234 5678"
 * formatPhoneNumber('091-234-5678') // "0912 345 678" (auto clean)
 * formatPhoneNumber(null) // "-"
 * formatPhoneNumber('') // "-"
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-'

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Format mobile: 0xxx xxx xxx (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  // Format landline: 0xx xxxx xxxx (11 digits - số cố định)
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }

  // If not standard format, return original with spaces every 3-4 digits
  if (cleaned.length > 0) {
    return cleaned.replace(/(\d{3,4})(?=\d)/g, '$1 ')
  }

  return phone
}

/**
 * Format mã số thuế
 */
export const formatTaxCode = (taxCode: string): string => {
  // Remove all non-digit characters
  const cleaned = taxCode.replace(/\D/g, '')

  // Format: xxxx-xxx-xxx (for 10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  return taxCode
}

/**
 * Truncate text với ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'Kb', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format số lượng với dấu phân cách
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

/**
 * Format phần trăm
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Safe date conversion - returns valid Date or null
 * @param dateString - Chuỗi ngày cần convert
 * @returns Date object hoặc null nếu không hợp lệ
 */
export const safeDate = (
  dateString: string | null | undefined
): Date | null => {
  if (!dateString) return null

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return null
  }

  return date
}

/**
 * Check if date string is valid
 * @param dateString - Chuỗi ngày cần kiểm tra
 * @returns true nếu hợp lệ, false nếu không
 */
export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false

  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * ==========================================
 * DATE/DATETIME PICKER INPUT FORMATTING
 * ==========================================
 * 
 * Các hàm format giá trị cho HTML5 input type='date' và type='datetime-local'
 * để hiển thị theo chuẩn Việt Nam: dd-MM-yyyy hoặc dd-MM-yyyy HH:mm:ss
 */

/**
 * Format date từ ISO string sang yyyy-MM-dd cho input[type="date"]
 * 
 * HTML5 input type="date" yêu cầu format: yyyy-MM-dd
 * Function này convert từ ISO string hoặc Date object sang format đó
 * 
 * @param dateString - ISO date string hoặc Date object
 * @returns String format yyyy-MM-dd hoặc empty string nếu invalid
 * 
 * @example
 * formatDateForInput('2024-01-15T10:30:00') // "2024-01-15"
 * formatDateForInput('2024-12-31') // "2024-12-31"
 * formatDateForInput(new Date(2024, 0, 15)) // "2024-01-15"
 * formatDateForInput(null) // ""
 */
export const formatDateForInput = (
  dateString: string | Date | null | undefined
): string => {
  if (!dateString) return ''

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    if (isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

/**
 * Format datetime từ ISO string sang yyyy-MM-ddTHH:mm cho input[type="datetime-local"]
 * 
 * HTML5 input type="datetime-local" yêu cầu format: yyyy-MM-ddTHH:mm
 * Function này convert từ ISO string hoặc Date object sang format đó
 * 
 * @param dateString - ISO datetime string hoặc Date object
 * @returns String format yyyy-MM-ddTHH:mm hoặc empty string nếu invalid
 * 
 * @example
 * formatDateTimeForInput('2024-01-15T10:30:45') // "2024-01-15T10:30"
 * formatDateTimeForInput('2024-12-31T23:59:00') // "2024-12-31T23:59"
 * formatDateTimeForInput(new Date(2024, 0, 15, 10, 30)) // "2024-01-15T10:30"
 * formatDateTimeForInput(null) // ""
 */
export const formatDateTimeForInput = (
  dateString: string | Date | null | undefined
): string => {
  if (!dateString) return ''

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    if (isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

/**
 * Parse giá trị từ input[type="date"] sang ISO string
 * 
 * @param inputValue - Giá trị từ input (yyyy-MM-dd)
 * @returns ISO date string hoặc empty string nếu invalid
 * 
 * @example
 * parseDateFromInput('2024-01-15') // "2024-01-15T00:00:00.000Z" (ISO)
 * parseDateFromInput('') // ""
 */
export const parseDateFromInput = (inputValue: string): string => {
  if (!inputValue) return ''
  
  try {
    const date = new Date(inputValue)
    if (isNaN(date.getTime())) return ''
    
    return date.toISOString()
  } catch {
    return ''
  }
}

/**
 * Parse giá trị từ input[type="datetime-local"] sang ISO string
 * 
 * @param inputValue - Giá trị từ input (yyyy-MM-ddTHH:mm)
 * @returns ISO datetime string hoặc empty string nếu invalid
 * 
 * @example
 * parseDateTimeFromInput('2024-01-15T10:30') // "2024-01-15T10:30:00.000Z" (ISO)
 * parseDateTimeFromInput('') // ""
 */
export const parseDateTimeFromInput = (inputValue: string): string => {
  if (!inputValue) return ''
  
  try {
    const date = new Date(inputValue)
    if (isNaN(date.getTime())) return ''
    
    return date.toISOString()
  } catch {
    return ''
  }
}

/**
 * ==========================================
 * DATE COMPARISON UTILITIES
 * ==========================================
 */

/**
 * Kiểm tra một ngày có phải là ngày hôm nay không
 * 
 * @param dateInput - Ngày cần kiểm tra (string hoặc Date object)
 * @returns true nếu là ngày hôm nay, false nếu không
 * 
 * @example
 * isToday('2024-01-15') // true nếu hôm nay là 15/01/2024
 * isToday('15/01/2024') // true nếu hôm nay là 15/01/2024
 * isToday('15-01-2024') // true nếu hôm nay là 15/01/2024
 * isToday(new Date()) // true
 * isToday('2024-01-14') // false
 */
export const isToday = (dateInput: string | Date | null | undefined): boolean => {
  if (!dateInput) return false
  
  try {
    let dateToCheck: Date
    
    if (dateInput instanceof Date) {
      dateToCheck = dateInput
    } else {
      // Parse string date (support multiple formats)
      const dateStr = String(dateInput).trim()
      
      // Try dd/MM/yyyy or dd-MM-yyyy format
      const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
      if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch
        dateToCheck = new Date(Number(year), Number(month) - 1, Number(day))
      } else {
        // Try yyyy-MM-dd format or ISO format
        dateToCheck = new Date(dateStr)
      }
    }
    
    // Check if date is valid
    if (isNaN(dateToCheck.getTime())) return false
    
    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Set time to midnight for comparison
    dateToCheck.setHours(0, 0, 0, 0)
    
    return dateToCheck.getTime() === today.getTime()
  } catch {
    return false
  }
}

/**
 * Format ngày hôm nay theo định dạng dd-MM-yyyy
 * 
 * @returns Ngày hôm nay theo định dạng dd-MM-yyyy
 * 
 * @example
 * getTodayFormatted() // "15-01-2024"
 */
export const getTodayFormatted = (): string => {
  const today = new Date()
  const day = today.getDate().toString().padStart(2, '0')
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const year = today.getFullYear()
  return `${day}-${month}-${year}`
}
