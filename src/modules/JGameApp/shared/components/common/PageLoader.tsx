/**
 * PageLoader Component
 *
 * Loading indicator for lazy-loaded pages with Suspense
 */

export function PageLoader() {
  return (
    <div className='flex items-center justify-center h-full min-h-[400px]'>
      <div className='flex flex-col items-center gap-3'>
        {/* Spinner */}
        <div className='relative w-12 h-12'>
          <div className='absolute top-0 left-0 w-full h-full border-4 border-[#e0e0e0] rounded-full'></div>
          <div className='absolute top-0 left-0 w-full h-full border-4 border-[#1565C0] rounded-full border-t-transparent animate-spin'></div>
        </div>

        {/* Loading text */}
        <p className='text-gray-600'>Đang tải...</p>
      </div>
    </div>
  )
}
