import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

import { ErrorBoundary } from './shared/components/common/ErrorBoundary'
import { PageLoader } from './modules/JGameApp/shared/components/common/PageLoader'

const JGamePortal = lazy(() =>
  import('./modules/JGameApp/layout/JGamePortal').then(m => ({ default: m.JGamePortal }))
)

function App() {
  return (
    <HashRouter>
      <Toaster theme="dark" richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/jgame" replace />} />
        <Route
          path="/jgame/*"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <JGamePortal />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route path="*" element={<Navigate to="/jgame" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
