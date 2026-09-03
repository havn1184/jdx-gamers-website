/**
 * StorefrontLayout — Khung storefront JGame: Header + nội dung route + Footer.
 * KHÔNG dùng khung Sidebar/TopMenu nội bộ như các portal khác — public trước, đăng nhập sau.
 */
import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { StorefrontHeader } from './StorefrontHeader'
import { StorefrontFooter } from './StorefrontFooter'
import { RequireAuth } from './RequireAuth'
import { GuestOnly } from './GuestOnly'
import { RequireShopOwner } from './RequireShopOwner'
import { RequireAffiliate } from './RequireAffiliate'
import { RequireAdmin } from './RequireAdmin'
import { RequireNphAuth } from './RequireNphAuth'
import { PageLoader } from '../shared/components/common/PageLoader'
import { useReferrerAttribution } from '../shared/hooks/useReferrerAttribution'
import { routeConfig } from '../routes/routeConfig'
import '../styles/jgame-theme.css'

function wrapRoute(route: (typeof routeConfig)[number]) {
  let element = route.element
  if (route.requireShopOwner) element = <RequireShopOwner>{element}</RequireShopOwner>
  if (route.requireAffiliate) element = <RequireAffiliate>{element}</RequireAffiliate>
  if (route.requireAdmin) element = <RequireAdmin>{element}</RequireAdmin>
  if (route.requireNphAuth) element = <RequireNphAuth>{element}</RequireNphAuth>
  if (route.requireAuth) element = <RequireAuth>{element}</RequireAuth>
  if (route.guestOnly) element = <GuestOnly>{element}</GuestOnly>
  return element
}

export function StorefrontLayout() {
  useReferrerAttribution()

  return (
    <div className='jgame-app flex min-h-screen flex-col bg-[#0f0620]'>
      <StorefrontHeader />

      <main className='flex-1'>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {routeConfig.map(route => (
              <Route key={route.pageId} path={route.path} element={wrapRoute(route)} />
            ))}
          </Routes>
        </Suspense>
      </main>

      <StorefrontFooter />
    </div>
  )
}
