---
name: cau-truc-du-an
description: 'Cấu trúc thư mục dự án SASUCO InvoiceEasy — quy tắc tổ chức modules, features, shared. Dùng khi: tạo feature mới, tổ chức file theo phân tầng, xác định đặt file vào đâu (modules/InvoiceApp/AdminApp/PartnerApp/SsoApp/KetoanApp/CrmApp/TaiSanApp/KiemThuApp/BaseIndexApp), biết cấu trúc types/services/hooks/components/dialogs/pages, kiến trúc phân tầng Pages→Hooks→Services→apiCall.'
---

# Cấu Trúc Dự Án SASUCO InvoiceEasy

> **Cập nhật:** 2026-07-15 — Phản ánh kiến trúc 9 portal độc lập

## Cấu Trúc Gốc

```
src/
├── modules/         # 9 Portal độc lập (mỗi portal là 1 Git repo riêng)
├── shared/          # Thư viện dùng chung root (đang giảm dần phụ thuộc)
├── styles/          # CSS toàn cục
├── App.tsx          # Root component + HashRouter
└── main.tsx         # Entry point
```

---

## Modules (9 Portal Độc Lập)

| Module | Git Repo | Phân hệ |
|--------|----------|---------|
| `InvoiceApp/` | `jdx-portal-invoice` | Hóa đơn điện tử cho doanh nghiệp |
| `AdminApp/` | `jdx-portal-admin` | Quản trị viên SASUCO — giám sát toàn hệ thống |
| `PartnerApp/` | `jdx-portal-partner` | Đối tác phân phối |
| `SsoApp/` | `jdx-portal-sso` | Xác thực, đăng nhập, phân quyền |
| `KetoanApp/` | `jdx-portal-accounting` | Kế toán doanh nghiệp |
| `CrmApp/` | `jdx-portal-crm` | CRM: bán hàng, báo giá, đơn hàng |
| `TaiSanApp/` | `jdx-portal-taisan` | Quản lý tài sản |
| `KiemThuApp/` | `jdx-portal-kiemthu` | Kiểm thử: bug, test case, inbox |
| `BaseIndexApp/` | `jdx-portal-baseindex` | Danh mục cơ sở dùng chung |

> ⚠️ **QUAN TRỌNG:** Mỗi portal là **1 Git repo độc lập** với `shared/` riêng. KHÔNG import từ `src/shared/` root. Tất cả import nội bộ portal là **relative path**.

Lưu ý:
- **AdminApp**: Quản trị hệ thống, giám sát khách hàng, tiến trình nền của mọi phân hệ.
- **PartnerApp**: Đối tác phân phối (đại lý, kế toán), không phải quản lý hệ thống.
- **SsoApp**: Module xác thực dùng chung cho tất cả người dùng (đăng nhập, đăng ký, quên mật khẩu, phân quyền).
- **BaseIndexApp**: Danh mục nền dùng chung (tổ chức, hàng hóa, tài chính, nhân sự).
- **InvoiceApp** (trước đây là `business`): Hóa đơn điện tử, chứng từ, tương tác TCT.
- **KetoanApp, CrmApp, TaiSanApp, KiemThuApp**: Các portal nghiệp vụ đặc thù.

## Cấu Trúc Feature (BẮT BUỘC ĐẦY ĐỦ)

```
features/{ten-tinh-nang}/
├── types/           # TypeScript interfaces, enums
├── services/        # Gọi API backend
├── hooks/           # Business logic (React hooks)
├── components/      # UI component con (không có logic)
├── dialogs/         # Dialog / Modal
├── pages/           # Trang route (không có logic)
├── utils/           # Helper riêng của feature
├── docs/
│   ├── backend/
│   └── tester/
│       ├── test-requirement/
│       └── test-result/
└── index.ts         # Barrel export
```

---

## Kiến Trúc Phân Tầng (BẮT BUỘC)

```
Pages / Components / Dialogs  ← Chỉ render UI
        ↓ chỉ gọi hooks
      Hooks                   ← Business logic + state
        ↓ chỉ gọi services
    API Services              ← Gọi backend
        ↓ dùng shared utilities
  apiCall() / buildApiUrl() / buildApiHeadersAsync()
```

**Nghiêm cấm:**
- ❌ Gọi API trực tiếp trong Pages / Components / Dialogs
- ❌ Viết business logic trong Pages / Components / Dialogs
- ❌ Hardcode API URL

---

## Shared — BẮT BUỘC Dùng Trước Khi Tạo Mới

### `/shared/services/api/`

| File | Export |
|------|--------|
| `ApiClient.ts` | `apiCall()` |
| `ApiConfig.ts` | `buildApiUrl()`, `buildApiUrlWithParams()` |
| `ApiHelpers.ts` | `buildApiHeadersAsync()` |
| `types.ts` | `PagingInfo<T>`, `ApiResponse<T>` |

### `/shared/components/common/`

| Component | Khi nào dùng |
|-----------|-------------|
| `ConfirmDialog` | Mọi xác nhận xóa / hành động nguy hiểm |
| `ValidationErrorDialog` | Lỗi từ server |
| `PageLoader` | Loading toàn trang |
| `Pagination` / `PagingUtils` | Phân trang |

### `/shared/utils/`

| Util | Chức năng |
|------|----------|
| `FormatUtils` | `formatCurrency()`, `formatNumber()`, `formatDate()` |
| `PagingUtils` | Component phân trang chuẩn |
| `ValidationUtils` | Validate rules chuẩn |

---

## Luồng Xử Lý Lỗi

| Nguồn lỗi | Hiển thị |
|-----------|---------|
| Client-side (validate form) | Inline error + Toast tổng hợp |
| Server-side (API response) | `ValidationErrorDialog` |

> ❌ KHÔNG dùng Toast cho lỗi server  
> ❌ KHÔNG dùng `ValidationErrorDialog` cho lỗi client

---


