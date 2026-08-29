/**
 * ErrorBoundary — bắt lỗi React runtime và hiển thị fallback UI.
 * Tự động reload 1 lần khi gặp lỗi tải chunk cũ (sau khi deploy bản mới),
 * chống lặp vô hạn bằng sessionStorage.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

const CHUNK_RELOAD_KEY = 'jdx_chunk_reload_attempted'

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || ''
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    error.name === 'ChunkLoadError'
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    if (isChunkLoadError(error)) {
      const alreadyAttempted = sessionStorage.getItem(CHUNK_RELOAD_KEY)
      if (!alreadyAttempted) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
        window.location.reload()
        return { hasError: true, error }
      }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg'>
            <h1 className='mb-4 text-2xl font-bold text-red-600'>Đã xảy ra lỗi</h1>
            <pre className='overflow-x-auto rounded border border-red-200 bg-red-50 p-4'>
              <code className='text-sm text-red-800'>{this.state.error?.toString()}</code>
            </pre>
            <button
              type='button'
              onClick={() => {
                sessionStorage.removeItem(CHUNK_RELOAD_KEY)
                window.location.reload()
              }}
              className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
