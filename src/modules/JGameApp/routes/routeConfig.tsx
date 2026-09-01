/**
 * routeConfig — Danh sách route JGameApp (storefront). Path KHÔNG có prefix `/jgame`
 * (được mount tại `/jgame/*` ở App.tsx root) — theo đúng pattern JpayApp.
 */
import { lazy, type ReactElement } from 'react'

const HomePage = lazy(() => import('../features/Public/home/pages/HomePage').then(m => ({ default: m.HomePage })))
const CatalogPage = lazy(() => import('../features/Public/catalog/pages/CatalogPage').then(m => ({ default: m.CatalogPage })))
const CardDetailPage = lazy(() => import('../features/Public/catalog/pages/CardDetailPage').then(m => ({ default: m.CardDetailPage })))
const OrderConfirmPage = lazy(() => import('../features/Account/User/order/pages/OrderConfirmPage').then(m => ({ default: m.OrderConfirmPage })))
const PaymentQrPage = lazy(() => import('../features/Account/User/order/pages/PaymentQrPage').then(m => ({ default: m.PaymentQrPage })))
const OrderResultPage = lazy(() => import('../features/Account/User/order/pages/OrderResultPage').then(m => ({ default: m.OrderResultPage })))
const HistoryPage = lazy(() => import('../features/Account/User/history/pages/HistoryPage').then(m => ({ default: m.HistoryPage })))
const ReferrerDashboardPage = lazy(() => import('../features/Account/Partner/pages/ReferrerDashboardPage').then(m => ({ default: m.ReferrerDashboardPage })))
const AffiliateRegisterPage = lazy(() => import('../features/Account/Partner/pages/AffiliateRegisterPage').then(m => ({ default: m.AffiliateRegisterPage })))

// Auth (độc lập, không qua SSO)
const LoginPage = lazy(() => import('../features/Public/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../features/Public/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('../features/Public/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('../features/Public/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('../features/Public/auth/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })))
const VerifyPhonePage = lazy(() => import('../features/Public/auth/pages/VerifyPhonePage').then(m => ({ default: m.VerifyPhonePage })))

// Account
const AccountDashboardPage = lazy(() => import('../features/Account/User/account/pages/AccountDashboardPage').then(m => ({ default: m.AccountDashboardPage })))
const ProfilePage = lazy(() => import('../features/Account/User/account/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const SecurityPage = lazy(() => import('../features/Account/User/account/pages/SecurityPage').then(m => ({ default: m.SecurityPage })))
const ActivityHistoryPage = lazy(() => import('../features/Account/User/account/pages/ActivityHistoryPage').then(m => ({ default: m.ActivityHistoryPage })))

// Static / CMS
const AboutPage = lazy(() => import('../features/Public/static-pages/pages/AboutPage').then(m => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('../features/Public/static-pages/pages/ContactPage').then(m => ({ default: m.ContactPage })))
const TermsPage = lazy(() => import('../features/Public/static-pages/pages/TermsPage').then(m => ({ default: m.TermsPage })))
const PrivacyPolicyPage = lazy(() => import('../features/Public/static-pages/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))

// Accessories (Giai đoạn 3)
const AccessoriesCatalogPage = lazy(() => import('../features/Public/accessories/pages/AccessoriesCatalogPage').then(m => ({ default: m.AccessoriesCatalogPage })))
const AccessoryDetailPage = lazy(() => import('../features/Public/accessories/pages/AccessoryDetailPage').then(m => ({ default: m.AccessoryDetailPage })))
const CartPage = lazy(() => import('../features/Public/accessories/pages/CartPage').then(m => ({ default: m.CartPage })))
const AccessoryCheckoutPage = lazy(() => import('../features/Account/User/accessories/pages/AccessoryCheckoutPage').then(m => ({ default: m.AccessoryCheckoutPage })))
const AccessoryOrderTrackingPage = lazy(() => import('../features/Account/User/accessories/pages/AccessoryOrderTrackingPage').then(m => ({ default: m.AccessoryOrderTrackingPage })))

// Chợ vé giờ chơi Cybergame (Giai đoạn 2)
const PlaytimeMarketplacePage = lazy(() => import('../features/Public/playtime/pages/PlaytimeMarketplacePage').then(m => ({ default: m.PlaytimeMarketplacePage })))
const CybergameShopPage = lazy(() => import('../features/Public/playtime/pages/CybergameShopPage').then(m => ({ default: m.CybergameShopPage })))
const TicketDetailPage = lazy(() => import('../features/Public/playtime/pages/TicketDetailPage').then(m => ({ default: m.TicketDetailPage })))
const MyPlaytimeOrdersPage = lazy(() => import('../features/Account/User/playtime/pages/MyPlaytimeOrdersPage').then(m => ({ default: m.MyPlaytimeOrdersPage })))
const MyPlaytimeReviewsPage = lazy(() => import('../features/Account/User/reviews/pages/MyPlaytimeReviewsPage').then(m => ({ default: m.MyPlaytimeReviewsPage })))
const TicketConfirmPage = lazy(() => import('../features/Account/User/playtime/pages/TicketConfirmPage').then(m => ({ default: m.TicketConfirmPage })))
const PlaytimePaymentQrPage = lazy(() => import('../features/Account/User/playtime/pages/PlaytimePaymentQrPage').then(m => ({ default: m.PlaytimePaymentQrPage })))
const PlaytimeOrderResultPage = lazy(() => import('../features/Account/User/playtime/pages/PlaytimeOrderResultPage').then(m => ({ default: m.PlaytimeOrderResultPage })))

// Kênh Người Bán (Giai đoạn 2)
const ShopRegisterPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopRegisterPage').then(m => ({ default: m.ShopRegisterPage })))
const ShopDashboardPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopDashboardPage').then(m => ({ default: m.ShopDashboardPage })))
const ShopZonesTicketsPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopZonesTicketsPage').then(m => ({ default: m.ShopZonesTicketsPage })))
const ShopSyncPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopSyncPage').then(m => ({ default: m.ShopSyncPage })))
const ShopOrdersPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopOrdersPage').then(m => ({ default: m.ShopOrdersPage })))
const ShopPayoutsPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopPayoutsPage').then(m => ({ default: m.ShopPayoutsPage })))
const ShopTerminalsPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopTerminalsPage').then(m => ({ default: m.ShopTerminalsPage })))
const ShopSlotsPage = lazy(() => import('../features/Account/ShopOwner/pages/ShopSlotsPage').then(m => ({ default: m.ShopSlotsPage })))

// Quản trị JGame (chuyển từ AdminApp về JGameApp — website độc lập)
const AdminDashboardPage = lazy(() => import('../features/Account/Admin/dashboard/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminCardsPage = lazy(() => import('../features/Account/Admin/cards/pages/AdminCardsPage').then(m => ({ default: m.AdminCardsPage })))
const AdminSuppliersPage = lazy(() => import('../features/Account/Admin/suppliers/pages/AdminSuppliersPage').then(m => ({ default: m.AdminSuppliersPage })))
const AdminOrdersPage = lazy(() => import('../features/Account/Admin/orders/pages/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })))
const AdminReferralPartnersPage = lazy(() => import('../features/Account/Admin/referral/pages/AdminReferralPartnersPage').then(m => ({ default: m.AdminReferralPartnersPage })))
const AdminPromotionsPage = lazy(() => import('../features/Account/Admin/promotions/pages/AdminPromotionsPage').then(m => ({ default: m.AdminPromotionsPage })))
const AdminReportsPage = lazy(() => import('../features/Account/Admin/reports/pages/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })))
const AdminAccessoriesPage = lazy(() => import('../features/Account/Admin/accessories/pages/AdminAccessoriesPage').then(m => ({ default: m.AdminAccessoriesPage })))
const AdminAccessoryFormPage = lazy(() => import('../features/Account/Admin/accessories/pages/AdminAccessoryFormPage').then(m => ({ default: m.AdminAccessoryFormPage })))

// Kiếm tiền — nhiệm vụ trải nghiệm/test game, thưởng JCoin
const TasksMarketplacePage = lazy(() => import('../features/Public/tasks/pages/TasksMarketplacePage').then(m => ({ default: m.TasksMarketplacePage })))
const TaskDetailPage = lazy(() => import('../features/Public/tasks/pages/TaskDetailPage').then(m => ({ default: m.TaskDetailPage })))
const MyTasksPage = lazy(() => import('../features/Account/User/tasks/pages/MyTasksPage').then(m => ({ default: m.MyTasksPage })))

// Ví (VND + JCoin) — nc_vi-2-loai-tien-thanh-toan.md
const WalletPage = lazy(() => import('../features/Account/User/wallet/pages/WalletPage').then(m => ({ default: m.WalletPage })))
const WalletTopupPage = lazy(() => import('../features/Account/User/wallet/pages/WalletTopupPage').then(m => ({ default: m.WalletTopupPage })))

export interface JGameRoute {
  path: string
  element: ReactElement
  pageId: string
  /** true → bọc RequireAuth (route chỉ dành cho Member đã đăng nhập) */
  requireAuth?: boolean
  /** true → chỉ Guest được vào (đã đăng nhập thì điều hướng về trang chủ) */
  guestOnly?: boolean
  /** true → bọc RequireShopOwner (chưa có gian hàng → điều hướng sang trang đăng ký) */
  requireShopOwner?: boolean
  /** true → bọc RequireAffiliate (chưa đăng ký đối tác → điều hướng sang trang đăng ký) */
  requireAffiliate?: boolean
  /** true → bọc RequireAdmin (không phải role='admin' → điều hướng về trang chủ) */
  requireAdmin?: boolean
}

export const routeConfig: JGameRoute[] = [
  // Trang chủ tổng hợp 3 phân hệ
  { path: '', element: <HomePage />, pageId: 'jgame-home' },

  // Storefront thẻ game (Giai đoạn 1)
  { path: 'nap-the', element: <CatalogPage />, pageId: 'jgame-catalog' },
  { path: 'the/:productId', element: <CardDetailPage />, pageId: 'jgame-card-detail' },
  { path: 'xac-nhan-don-hang', element: <OrderConfirmPage />, pageId: 'jgame-order-confirm' },
  { path: 'thanh-toan/:orderId', element: <PaymentQrPage />, pageId: 'jgame-payment', requireAuth: true },
  { path: 'ket-qua/:orderId', element: <OrderResultPage />, pageId: 'jgame-order-result', requireAuth: true },
  { path: 'lich-su', element: <HistoryPage />, pageId: 'jgame-history', requireAuth: true },
  { path: 'doi-tac/dang-ky', element: <AffiliateRegisterPage />, pageId: 'jgame-affiliate-register', requireAuth: true },
  { path: 'doi-tac', element: <ReferrerDashboardPage />, pageId: 'jgame-referrer', requireAuth: true, requireAffiliate: true },

  // Tài khoản độc lập (không qua SSO)
  { path: 'dang-nhap', element: <LoginPage />, pageId: 'jgame-login', guestOnly: true },
  { path: 'dang-ky', element: <RegisterPage />, pageId: 'jgame-register', guestOnly: true },
  { path: 'quen-mat-khau', element: <ForgotPasswordPage />, pageId: 'jgame-forgot-password', guestOnly: true },
  { path: 'dat-lai-mat-khau', element: <ResetPasswordPage />, pageId: 'jgame-reset-password' },
  { path: 'xac-thuc-email', element: <VerifyEmailPage />, pageId: 'jgame-verify-email' },
  { path: 'xac-thuc-so-dien-thoai', element: <VerifyPhonePage />, pageId: 'jgame-verify-phone', requireAuth: true },
  { path: 'tai-khoan', element: <AccountDashboardPage />, pageId: 'jgame-account-dashboard', requireAuth: true },
  { path: 'ho-so', element: <ProfilePage />, pageId: 'jgame-profile', requireAuth: true },
  { path: 'bao-mat', element: <SecurityPage />, pageId: 'jgame-security', requireAuth: true },
  { path: 'lich-su-hoat-dong', element: <ActivityHistoryPage />, pageId: 'jgame-activity-history', requireAuth: true },

  // Public / CMS
  { path: 'gioi-thieu', element: <AboutPage />, pageId: 'jgame-about' },
  { path: 'lien-he', element: <ContactPage />, pageId: 'jgame-contact' },
  { path: 'dieu-khoan-su-dung', element: <TermsPage />, pageId: 'jgame-terms' },
  { path: 'chinh-sach-bao-mat', element: <PrivacyPolicyPage />, pageId: 'jgame-privacy-policy' },

  // Kho phụ kiện Gamer (Giai đoạn 3)
  { path: 'phu-kien', element: <AccessoriesCatalogPage />, pageId: 'jgame-accessories-catalog' },
  { path: 'phu-kien/:productId', element: <AccessoryDetailPage />, pageId: 'jgame-accessory-detail' },
  { path: 'gio-hang', element: <CartPage />, pageId: 'jgame-cart' },
  { path: 'thanh-toan-phu-kien', element: <AccessoryCheckoutPage />, pageId: 'jgame-accessory-checkout', requireAuth: true },
  { path: 'don-hang-phu-kien/:orderId', element: <AccessoryOrderTrackingPage />, pageId: 'jgame-accessory-tracking', requireAuth: true },

  // Chợ vé giờ chơi Cybergame (Giai đoạn 2)
  { path: 'cho-ve', element: <PlaytimeMarketplacePage />, pageId: 'jgame-playtime-marketplace' },
  { path: 'cho-ve/gian-hang/:shopId', element: <CybergameShopPage />, pageId: 'jgame-playtime-shop' },
  { path: 'cho-ve/ve/:ticketId', element: <TicketDetailPage />, pageId: 'jgame-playtime-ticket-detail' },
  { path: 've-da-mua', element: <MyPlaytimeOrdersPage />, pageId: 'jgame-playtime-my-orders', requireAuth: true },
  { path: 'danh-gia-cua-toi', element: <MyPlaytimeReviewsPage />, pageId: 'jgame-playtime-my-reviews', requireAuth: true },
  { path: 'cho-ve/xac-nhan-dat-ve', element: <TicketConfirmPage />, pageId: 'jgame-playtime-confirm' },
  { path: 'cho-ve/thanh-toan/:orderId', element: <PlaytimePaymentQrPage />, pageId: 'jgame-playtime-payment', requireAuth: true },
  { path: 'cho-ve/ket-qua/:orderId', element: <PlaytimeOrderResultPage />, pageId: 'jgame-playtime-result', requireAuth: true },

  // Kênh Người Bán (Giai đoạn 2)
  { path: 'kenh-nguoi-ban/dang-ky', element: <ShopRegisterPage />, pageId: 'jgame-shop-register', requireAuth: true },
  { path: 'kenh-nguoi-ban', element: <ShopDashboardPage />, pageId: 'jgame-shop-dashboard', requireAuth: true, requireShopOwner: true },
  { path: 'kenh-nguoi-ban/zone-ve', element: <ShopZonesTicketsPage />, pageId: 'jgame-shop-zones-tickets', requireAuth: true, requireShopOwner: true },
  { path: 'kenh-nguoi-ban/dong-bo', element: <ShopSyncPage />, pageId: 'jgame-shop-sync', requireAuth: true, requireShopOwner: true },
  { path: 'kenh-nguoi-ban/may', element: <ShopTerminalsPage />, pageId: 'jgame-shop-terminals', requireAuth: true, requireShopOwner: true },
  { path: 'kenh-nguoi-ban/khung-gio', element: <ShopSlotsPage />, pageId: 'jgame-shop-slots', requireAuth: true, requireShopOwner: true },
  { path: 'kenh-nguoi-ban/don-hang', element: <ShopOrdersPage />, pageId: 'jgame-shop-orders', requireAuth: true, requireShopOwner: true },
  { path: 'kenh-nguoi-ban/cong-no', element: <ShopPayoutsPage />, pageId: 'jgame-shop-payouts', requireAuth: true, requireShopOwner: true },

  // Quản trị JGame (chuyển từ AdminApp về JGameApp)
  { path: 'quan-tri', element: <AdminDashboardPage />, pageId: 'jgame-admin-dashboard', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/danh-muc-the', element: <AdminCardsPage />, pageId: 'jgame-admin-cards', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/phu-kien', element: <AdminAccessoriesPage />, pageId: 'jgame-admin-accessories', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/phu-kien/them', element: <AdminAccessoryFormPage />, pageId: 'jgame-admin-accessory-create', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/phu-kien/:productId/sua', element: <AdminAccessoryFormPage />, pageId: 'jgame-admin-accessory-edit', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/nha-cung-cap', element: <AdminSuppliersPage />, pageId: 'jgame-admin-suppliers', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/giao-dich', element: <AdminOrdersPage />, pageId: 'jgame-admin-orders', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/doi-tac-referral', element: <AdminReferralPartnersPage />, pageId: 'jgame-admin-referral', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/khuyen-mai', element: <AdminPromotionsPage />, pageId: 'jgame-admin-promotions', requireAuth: true, requireAdmin: true },
  { path: 'quan-tri/bao-cao', element: <AdminReportsPage />, pageId: 'jgame-admin-reports', requireAuth: true, requireAdmin: true },

  // Kiếm tiền — nhiệm vụ trải nghiệm/test game, thưởng JCoin
  { path: 'kiem-tien', element: <TasksMarketplacePage />, pageId: 'jgame-tasks-marketplace' },
  { path: 'kiem-tien/nhiem-vu-cua-toi', element: <MyTasksPage />, pageId: 'jgame-my-tasks', requireAuth: true },
  { path: 'kiem-tien/:taskId', element: <TaskDetailPage />, pageId: 'jgame-task-detail' },

  // Ví (VND + JCoin) — nc_vi-2-loai-tien-thanh-toan.md
  { path: 'vi', element: <WalletPage />, pageId: 'jgame-wallet', requireAuth: true },
  { path: 'vi/nap-tien', element: <WalletTopupPage />, pageId: 'jgame-wallet-topup', requireAuth: true },
]
