---
name: api-service-conventions
description: 'Quy tắc viết API Service (`**/services/*.ts`) trong SASUCO InvoiceEasy — static class methods, apiCall(), buildApiUrl(). Dùng khi: tạo hoặc sửa file `*ApiService.ts`, viết class gọi API backend.'
---

# API Service Conventions — SASUCO InvoiceEasy

## Cấu Trúc Chuẩn

```typescript
import { apiCall } from '@/shared/services/api/apiCall'
import { buildApiUrl } from '@/shared/services/api/buildApiUrl'
import type { ApiResponse } from '@/shared/services/api/apiCall'

export class {ShortName}ApiService {
  private static readonly BASE_PATH = '/api/{endpoint}'

  static async getList(params: {...}): Promise<ApiResponse<...>> {
    const url = buildApiUrl(`${this.BASE_PATH}`, params)
    return apiCall<...>({ url, method: 'GET' })
  }

  static async create(data: CreateRequest): Promise<ApiResponse<...>> {
    return apiCall<...>({
      url: buildApiUrl(this.BASE_PATH),
      method: 'POST',
      body: data,
    })
  }
}
```

## Quy Tắc Bắt Buộc

- **Static class methods** — không dùng instance, không dùng hooks gọi API
- Luôn dùng `apiCall()` — không dùng `fetch()`, `axios`, hay `XMLHttpRequest` trực tiếp
- Luôn dùng `buildApiUrl()` để build URL — không hardcode URL
- **Không** dùng `buildApiHeaders()` hay `handleApiError()` (đã deprecated)
- BASE_PATH là `private static readonly` — không truyền URL qua tham số hàm
- Phân biệt Admin vs Business: Service trong `modules/admin/` → tên file `{ShortName}ApiServiceAdmin.ts`

## Phân Loại URL Builder

| Hàm | Dùng khi |
|-----|---------|
| `buildApiUrl(path, params?)` | Query string params (GET list, filter) |
| `buildApiUrlWithParams(path, pathVars)` | Path variables (GET by ID: `/api/items/:id`) |

## Response Pattern

```typescript
// Hook gọi service:
const result = await FooApiService.getList(params)
if (result.success) {
  setData(result.data)
} else {
  // Xử lý lỗi — xem skill tich-hop-api-ui
}
```

> Xử lý lỗi chi tiết: load skill `tich-hop-api-ui`.
