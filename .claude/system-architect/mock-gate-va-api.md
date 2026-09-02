# Cơ chế Mock Gate & API Service

> File lõi: `shared/services/api/mockGate.ts`, `shared/services/api/ApiConfig.ts`, `shared/services/api/ApiClient.ts`.
> **Đây là điểm quan trọng nhất cần hiểu trước khi sửa bất kỳ ApiService nào trong JGameApp** — toàn bộ 11 `*ApiService.ts` trong module đều tuân theo đúng 1 pattern dưới đây.

## Vì sao có mock gate

Backend thật cho JGame **chưa tồn tại** (repo `Backend/` chưa có commit nào liên quan). Để vẫn dựng được toàn bộ luồng UI/UX chạy được ngay, mọi ApiService rẽ nhánh qua **1 điểm gate mock duy nhất** — không nơi nào trong code được phép mock trực tiếp bỏ qua gate này.

## Bật/tắt mock

```
VITE_JGAME_USE_MOCK=true|false     # mặc định true (kể cả .env.production hiện tại)
VITE_JGAME_API_URL=http://...      # chỉ dùng khi USE_MOCK=false
```

`JGAME_USE_MOCK` (`mockGate.ts`) đọc trực tiếp biến này — đổi 1 biến env, không sửa code gọi ở page/hook, vì cả 2 nhánh đã cùng 1 chữ ký `Promise<ApiResponse<T>>`.

## Pattern bắt buộc cho mọi method trong `*ApiService.ts`

```ts
static async getCardProducts(params: CardProductParams): Promise<ApiResponse<CardProduct[]>> {
  if (JGAME_USE_MOCK) {
    return mockApiCall(() => /* factory sinh dữ liệu giả từ mocks/*.store.ts, tính lại mỗi lần gọi */)
  }
  const url = buildJGameUrlWithParams('/api/card-products', params)
  const res = await apiCall<CardProduct[]>(url, { method: 'GET' })
  return res
}
```

- `mockApiCall<T>(factory, delayMs=450)` — bọc factory thành `ApiResponse<T>` chuẩn `{ success: true, data, message: null }`, có độ trễ giả lập mạng (450ms mặc định), **factory chạy tại thời điểm gọi, không cache** (để phản ánh đúng state mock hiện tại).
- `mockApiError<T>(message, delayMs)` — mock 1 nhánh lỗi nghiệp vụ (VD: hết mã thẻ, hết chỗ vé).
- Khi tắt mock: `buildJGameUrl`/`buildJGameUrlWithParams` (`ApiConfig.ts`) build URL tới `VITE_JGAME_API_URL`, gọi qua `apiCall` (`ApiClient.ts` — có sẵn JWT refresh, retry 401, normalize lỗi, dùng chung hạ tầng với các portal khác trong workspace).

## Danh sách 11 ApiService thực tế (tất cả static method)

| Service | Vị trí | Domain |
|---|---|---|
| `CardApiService` | `features/Public/catalog/services/` | Danh mục thẻ, mệnh giá |
| `OrderApiService` | `features/Account/User/order/services/` | createOrder, getPayment, getOrderStatus (polling), getCardCode, revealCardCode, getRefund, getMyOrders |
| `AuthApiService` | `features/Public/auth/services/` | register/login/OTP SĐT/2FA mock |
| `AccountApiService` | `features/Account/User/account/services/` | Hồ sơ, bảo mật |
| `ReferrerApiService` | `features/Account/Partner/services/` | getMyAffiliateStatus, register, summary, transactions |
| `ShopOwnerApiService` | `features/Account/ShopOwner/services/` | Chủ Cybergame (Chợ vé GĐ2) |
| `PlaytimeApiService` | `features/Public/playtime/services/` | Marketplace chợ vé |
| `AccessoryApiService` | `features/Public/accessories/services/` | Phụ kiện (GĐ3) |
| `TaskApiService` | `features/Public/tasks/services/` | Nhiệm vụ + ví JCoin |
| `ContactApiService` | `features/Public/static-pages/services/` | Form liên hệ |
| `JGameApiServiceAdmin` | `features/Account/Admin/services/` | ~23 method CRUD toàn bộ nghiệp vụ Admin |

## Khi có backend thật — checklist chuyển đổi

1. Set `VITE_JGAME_USE_MOCK=false` + `VITE_JGAME_API_URL` trỏ BE thật.
2. Backend implement đúng contract field đã định nghĩa trong từng `types/*.types.ts` — **các field này do FE tự đặt tên làm chuẩn** khi chưa có BE thật (camelCase, không viết tắt, bám theo ý nghĩa nghiệp vụ URD mục 19) — không đổi tên khi có BE thật, BE nên map theo đúng field FE đã dùng để tránh sửa toàn bộ UI.
3. Rà lại từng `mockApiError` đã dùng — đây là danh sách đầy đủ các nhánh lỗi nghiệp vụ mà BE thật cần trả về đúng tương tự (mã lỗi, message).
4. 2 nghiệp vụ **hoàn toàn chưa có mock UI** (không phải chỉ chưa nối BE thật): đối soát JGame–NCC–jPay (UC-13) và xuất hoá đơn J-Invoice (UC-14) — cần thiết kế từ đầu, không có gì để tham chiếu từ FE hiện tại.
5. OTP hiện chỉ `console.info` giả lập trong `AuthApiService.sendPhoneOtp()` — cần thay bằng gateway Zalo ZNS/SMS thật khi có BE.

## ⚠️ Lưu ý khi thêm ApiService mới

Mọi ApiService mới **PHẢI** đi qua `mockGate.ts` theo đúng pattern trên — không tạo cơ chế mock riêng lẻ, không gọi `fetch`/`apiCall` trực tiếp bỏ qua gate khi `JGAME_USE_MOCK=true`.
