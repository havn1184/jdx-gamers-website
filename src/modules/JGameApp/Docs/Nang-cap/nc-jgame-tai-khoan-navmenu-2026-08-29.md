# Nâng cấp: Tái cấu trúc `features/` (Public/Account) + NavMenu độc lập cho 4 nhóm tài khoản (JGame)

## 0. Prompt gốc (nguyên văn)

> Hiện tại giao diện khi đăng nhập tài khoản khách hàng vẫn chưa được, tôi muốn làm dạng navmenu như phần quản trị hệ thống, tất cả các chức năng của người dùng đưa hết vào navmenu cho dễ tao tác. Khi người dùng login là vào thẳng trang này.
> Tương tự style này làm cho tài khoản là chủ cybergame, đối tác tiếp thị.
> Chuẩn hóa giao diện cho đẹp, thao tác thuận tiện.

> (Trao đổi bổ sung) Đồng ý phân luồng đăng nhập theo loại tài khoản (khách hàng → `/jgame/tai-khoan`, chủ Cybergame đã đăng ký → thẳng `/jgame/chu-cybergame`, đối tác tiếp thị đã đăng ký → thẳng `/jgame/doi-tac`, admin → `/jgame/quan-tri`). Và cần tái sắp xếp cấu trúc trong `src\modules\JGameApp\features`, chia làm 2 vùng: **Public** và **Account**, trong **Account** lại chia thành từng nhóm đối tượng người dùng: **User, Admin, Shop-owner, Đối tác tiếp thị liên kết**. Nguyên tắc: file giao diện thiết kế của mỗi đối tượng là **độc lập, không dùng chung** (khó maintain/phát triển nếu dùng chung).

> (Trao đổi bổ sung 2) Với các feature trộn cả trang công khai lẫn trang cần đăng nhập (`playtime`, `accessories`, `order`) → **tách triệt để theo trang (pages) vào đúng vùng**, cho phép dùng chung `types/services/hooks` qua import chéo giữa Public và Account/User của cùng 1 domain (không bắt buộc nhân bản business logic — chỉ **UI layout của 4 nhóm tài khoản** là phải độc lập, không dùng chung).

## 1. Tổng quan

- **Mục tiêu kép:**
  1. Mỗi nhóm tài khoản (Khách hàng / Admin / Chủ Cybergame / Đối tác tiếp thị) có **1 khung NavMenu sidebar riêng, độc lập hoàn toàn về code UI** (không 1 component layout dùng chung cho nhiều nhóm) — tập trung toàn bộ chức năng của nhóm đó, dễ thao tác, dễ maintain riêng từng nhóm về sau.
  2. Đăng nhập xong → điều hướng thẳng vào dashboard đúng nhóm tài khoản (không qua trang chủ storefront).
  3. Tái cấu trúc thư mục `features/` thành 2 vùng **Public** (nội dung/thao tác không cần đăng nhập) và **Account** (chia 4 nhóm con: `User`, `Admin`, `ShopOwner`, `Partner`), để ranh giới trách nhiệm rõ ràng, đúng như yêu cầu.
- **Portal:** JGameApp (website độc lập). **Thư mục:** `src/modules/JGameApp/`
- **Không có BE thật** — mock-gate giữ nguyên 100%, đây là tái cấu trúc **thư mục + UI + điều hướng**, KHÔNG đổi field/API/logic nghiệp vụ.
- **Nguyên tắc phân vùng:**
  - **Public**: trang xem được khi chưa đăng nhập (duyệt sản phẩm/gian hàng/nhiệm vụ, trang tĩnh, xác thực tài khoản).
  - **Account/User**: trang thuộc "hành trình giao dịch/quản lý tài khoản" của khách hàng thường — xác nhận đơn/thanh toán/kết quả, giỏ hàng, hồ sơ, bảo mật, lịch sử, nhiệm vụ đã đăng ký, ví JCoin. Phân loại theo **mục đích** (hành trình giao dịch/quản lý), không thuần theo cờ `requireAuth` (vì 1 số trang xác nhận cho xem trước, chỉ chặn khi bấm submit — vẫn xếp vào Account/User vì bản chất là bước hoàn tất giao dịch cá nhân).
  - **Account/Admin**, **Account/ShopOwner**, **Account/Partner**: giữ nguyên nội dung hiện có của `admin/`, `shop-owner/`, `referrer/` — chỉ đổi vị trí thư mục.
- **Nguyên tắc "độc lập, không dùng chung"** áp dụng cho: **component Layout (sidebar NavMenu)** của 4 nhóm — mỗi nhóm 1 file riêng, chấp nhận trùng lặp JSX/style thay vì trừu tượng hoá dùng chung. **KHÔNG** áp dụng cho types/services/hooks nghiệp vụ của cùng 1 domain bị tách trang (playtime/accessories/order) — các trang Account/User của domain đó **được phép** import chéo sang types/services ở Public cùng domain (business logic không nhân bản, tránh sai lệch dữ liệu 2 nơi).

## 2. Thay đổi BE

Không có.

## 3. Cấu trúc thư mục đích (`features/`)

```
features/
├── Public/
│   ├── home/                 (nguyên trạng từ features/home)
│   ├── catalog/               (nguyên trạng từ features/catalog — CatalogPage, CardDetailPage)
│   ├── static-pages/          (nguyên trạng)
│   ├── auth/                  (nguyên trạng — Login/Register/Forgot/Reset/VerifyEmail/VerifyPhone)
│   ├── playtime/              (CHỈ: pages/PlaytimeMarketplacePage.tsx, pages/CybergameShopPage.tsx,
│   │                            hooks/useShopDetail.page.fetchData.ts + toàn bộ types/, services/)
│   ├── accessories/           (CHỈ: pages/AccessoriesCatalogPage.tsx, AccessoryDetailPage.tsx, CartPage.tsx
│   │                            + toàn bộ types/, services/, components/)
│   └── tasks/                 (CHỈ: pages/TasksMarketplacePage.tsx, TaskDetailPage.tsx,
│                                components/TaskArt.tsx, utils/, hooks/useTaskMarketplace...,
│                                useTaskDetail... + toàn bộ types/, services/ — bao gồm jcoinWallet API)
│
└── Account/
    ├── User/
    │   ├── account/            (nguyên trạng features/account + 2 file mới: AccountDashboardPage, CustomerLayout)
    │   ├── history/            (nguyên trạng features/history)
    │   ├── order/              (nguyên trạng features/order — OrderConfirmPage/PaymentQrPage/OrderResultPage;
    │   │                         cross-import types/CardProduct từ Public/catalog)
    │   ├── playtime/           (TicketConfirmPage, PlaytimePaymentQrPage, PlaytimeOrderResultPage,
    │   │                         hooks/useTicketReserve.page.ts, usePlaytimePaymentStatus.page.ts;
    │   │                         cross-import types/service từ Public/playtime)
    │   ├── accessories/        (AccessoryCheckoutPage, AccessoryOrderTrackingPage,
    │   │                         hooks/useAccessoryCheckout.page.ts, useAccessoryTracking...;
    │   │                         cross-import types/service từ Public/accessories)
    │   └── tasks/              (MyTasksPage, JcoinWalletPage, components/JcoinPayToggle.tsx,
    │                             hooks/useJcoinBalance.ts, useMyTasks..., useJcoinWallet...;
    │                             cross-import types/TaskApiService từ Public/tasks)
    ├── Admin/                  (nguyên trạng features/admin/* + AdminLayout đã có, viết lại độc lập)
    ├── ShopOwner/              (nguyên trạng features/shop-owner/* + ShopOwnerLayout đã có, viết lại độc lập)
    └── Partner/                (nguyên trạng features/referrer/* — AffiliateRegisterPage, ReferrerDashboardPage
                                  + file mới PartnerLayout)
```

> `mocks/` (gameTasks.store.ts, jcoinWallet.store.ts, orders.store.ts, playtimeOrders.store.ts, playtimeShops.store.ts, accessoryOrders.store.ts, cardProducts.mock.ts, accessories.mock.ts, authUsers.store.ts...) **giữ nguyên vị trí** (`src/modules/JGameApp/mocks/`) — đây là tầng data mock dùng chung toàn app, không thuộc `features/`, không tách theo Public/Account.

### 3.1 Layout NavMenu — 4 file độc lập (không dùng chung 1 component)

| File (mới/viết lại) | Nhóm | Menu |
|---|---|---|
| `features/Account/User/account/components/CustomerLayout.tsx` | Khách hàng | Tổng quan · Hồ sơ · Bảo mật · Lịch sử hoạt động · Đơn hàng của tôi · Nhiệm vụ của tôi · Ví JCoin · CTA Chủ Cybergame/Đối tác nếu chưa đăng ký |
| `features/Account/Admin/components/AdminLayout.tsx` | Admin | Giữ nguyên menu hiện có (di chuyển thư mục, viết lại độc lập — không còn phụ thuộc file dùng chung nào) |
| `features/Account/ShopOwner/components/ShopOwnerLayout.tsx` | Chủ Cybergame | Giữ nguyên menu hiện có (di chuyển thư mục) |
| `features/Account/Partner/components/PartnerLayout.tsx` | Đối tác tiếp thị | Tổng quan (nội dung `ReferrerDashboardPage` hiện tại) · Hồ sơ đối tác |

Mỗi file tự viết phần khung (badge brand, `<nav>` NavLink, responsive) — được phép **trùng lặp code** giữa 4 file này, đúng nguyên tắc độc lập.

### 3.2 Trang mới

| File | Mục đích |
|---|---|
| `features/Account/User/account/pages/AccountDashboardPage.tsx` | Trang "Tổng quan" — landing sau đăng nhập cho khách hàng thường. Số dư JCoin, số nhiệm vụ đang làm, 3 đơn hàng gần nhất (rút từ `getMyOrders` 3 service hiện có), 2 CTA đăng ký Chủ Cybergame/Đối tác (ẩn nếu đã có). |
| `features/Account/User/account/hooks/useAccountDashboard.page.fetchData.ts` | Gộp dữ liệu: `useJcoinBalance`, `TaskApiService.getMyTasks`, `OrderApiService/AccessoryApiService/PlaytimeApiService.getMyOrders`, `useMyShop`, `useMyAffiliate`. |

### 3.3 Điều hướng sau đăng nhập + route mới

| File | Thay đổi |
|---|---|
| `routes/routeConfig.tsx` | Cập nhật lại toàn bộ đường dẫn import theo vị trí file mới (path URL giữ nguyên, không đổi). Thêm route `{ path: 'tai-khoan', element: <AccountDashboardPage />, pageId: 'jgame-account-dashboard', requireAuth: true }` |
| `features/Public/auth/hooks/useLogin.page.ts` | `finishLogin`: sau `refreshUser()`, không có `returnTo` → `role==='admin'` → `/jgame/quan-tri`; else gọi trực tiếp `ShopOwnerApiService.getMyShop()` có shop → `/jgame/chu-cybergame`; else gọi `ReferrerApiService.getMyAffiliateStatus()` là đối tác → `/jgame/doi-tac`; else → `/jgame/tai-khoan` |
| `layout/StorefrontHeader.tsx` | Thêm mục đầu dropdown avatar "Tài khoản của tôi" → `/jgame/tai-khoan`; giữ nguyên các lối tắt còn lại |

## 4. Ánh xạ fields FE=BE

Không áp dụng — không đổi field/DTO, chỉ đổi vị trí file + cách import.

## 5. Routes

**Không đổi bất kỳ URL path nào** — chỉ đổi nơi định nghĩa component (import path trong `routeConfig.tsx`). Thêm duy nhất 1 route mới: `tai-khoan` → `AccountDashboardPage`.

## 6. Menu

- JGameApp không dùng TopMenu/NavMenu 9-portal chuẩn (site độc lập) — áp dụng **4 sidebar NavMenu nội bộ độc lập** như mục 3.1.

## 7. Thiết kế UI

- Cả 4 layout cùng "họ" hình ảnh (nền `#0b0417`, khối brand-badge + tiêu đề, `NavLink` bo góc, active `jgame-gradient-brand`, responsive `lg:flex-row` desktop / cuộn ngang mobile) — **nhưng là 4 file JSX độc lập**, không kế thừa/import lẫn nhau, để sau này sửa 1 nhóm không ảnh hưởng 3 nhóm còn lại.
- `CustomerLayout`: icon `LayoutDashboard`, tiêu đề "Tài khoản của tôi", dòng phụ hiện tên khách hàng.
- `PartnerLayout`: icon `Megaphone`, tiêu đề "Đối tác tiếp thị", dòng phụ hiện mã giới thiệu.
- `AccountDashboardPage`: `grid grid-cols-2 sm:grid-cols-4` thẻ số liệu, danh sách đơn hàng gần nhất rút gọn, 2 thẻ CTA.
- Tuân `tao-ui-giao-dien`: `data-qa` đầy đủ, responsive chuẩn, không `grid-cols-N` (N≥3) thiếu breakpoint.

## 8. Kế hoạch di chuyển & rủi ro (bổ sung do phạm vi lớn)

- **Quy mô:** 13 thư mục feature hiện có, trong đó 4 feature (`playtime`, `accessories`, `order`, `tasks`) bị tách theo trang → ước lượng **~110-130 file** bị di chuyển hoặc sửa import path (không đổi logic bên trong, trừ 2 file layout refactor + `useLogin.page.ts` + `routeConfig.tsx` + `StorefrontHeader.tsx` có đổi thật).
- **Cách làm an toàn:**
  1. Dùng `git mv` cho từng file (giữ lịch sử), theo đúng bảng mục 3.
  2. Sau mỗi nhóm feature di chuyển xong → sửa lại `import` tương đối trong chính các file đó + mọi nơi import ngược vào (`routeConfig.tsx`, các cross-import Account↔Public).
  3. Chạy `npx tsc --noEmit` sau mỗi nhóm — có lỗi thì sửa ngay trước khi sang nhóm tiếp theo (không dồn lỗi).
  4. Sau khi xong toàn bộ: chạy `check-for-skill/check-all.cjs` trên `src/modules/JGameApp`, và Playwright duyệt lại toàn bộ route trong `routeConfig.tsx` (đăng nhập từng loại tài khoản demo: khách hàng thường, chủ Cybergame, đối tác, admin) để đảm bảo không có route nào vỡ.
- **Rủi ro chính:** sai sót cross-import giữa Public/Account của cùng domain (playtime/accessories/order/tasks) gây vòng lặp import hoặc sai đường dẫn — giảm thiểu bằng cách sửa xong 1 domain là `tsc` ngay, không gộp nhiều domain rồi mới kiểm tra.
- **Không đổi:** không đổi bất kỳ hành vi nghiệp vụ, mock store, hay URL path nào trong lần nâng cấp này.

## 9. Checklist

- [ ] Đủ 4 file Layout độc lập, không file nào import chéo Layout của nhóm khác
- [ ] `AccountDashboardPage` chỉ đọc dữ liệu từ service/hook có sẵn
- [ ] `useLogin.page.ts` gọi trực tiếp service (không gọi hook ngoài component)
- [ ] Toàn bộ path cũ trong `routeConfig.tsx` được cập nhật đúng vị trí mới, không sót
- [ ] `tsc --noEmit` sạch sau khi di chuyển xong toàn bộ
- [ ] `check-for-skill/check-all.cjs` không phát sinh lỗi mới (ngoài các false-positive đã biết)
- [ ] Playwright duyệt đủ 4 loại tài khoản demo, đúng dashboard sau đăng nhập, không route nào lỗi

✅ APPROVED
