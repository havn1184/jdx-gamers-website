# Export Cấu Trúc Phân Quyền — Quy Tắc Tạo JSON Menu Phân Quyền

> File quy tắc chuẩn cho skill `export-menu-page-permission`.
> Chứa toàn bộ nguyên tắc cấu trúc portal, quy tắc menuCode và PAGE_FEATURES mà Agent phải tuân thủ khi khai báo/xuất cấu trúc phân quyền.

---

## 1. Portal Keys (cập nhật 07/2026 — cấu trúc repo độc lập)

> Module path: `src/modules/{modulePath}/` với `XxxApp` convention.
> KetoanApp: không có `layout/` riêng (quản lý route trực tiếp), `topMenuFile` và `navMenuFile` = null.

| Key | shortName | modulePath | appType | Prefix | Ghi chú |
|-----|-----------|------------|---------|--------|---------|
| `invoice` | invoice | `InvoiceApp` | 2 | INV | Hóa đơn điện tử |
| `admin` | admin | `AdminApp` | 1 | ADM | Quản trị hệ thống |
| `partner` | partner | `PartnerApp` | 3 | PTN | Đối tác |
| `sso` | sso | `SsoApp` | 8 | SSO | Đăng nhập & tài khoản (không TopMenu) |
| `ketoan` | ketoan | `KetoanApp` | 4 | ACC | Kế toán (không layout riêng) |
| `kiemthu` | kiemthu | `KiemThuApp` | 6 | TEST | Test Management |
| `taisan` | taisan | `TaiSanApp` | 7 | TAS | Quản lý tài sản |
| `crm` | crm | `CrmApp` | 5 | CRM | CRM |
| `baseindex` | baseindex | `BaseIndexApp` | 9 | BASE | Dữ liệu nền |

---

## 2. Điều kiện cấu trúc portal (BƯỚC 1 — kiểm tra trước khi export)

Trước khi export, script sẽ kiểm tra các điều kiện sau. **Thiếu bất kỳ điều kiện nào → DỪNG và báo Agent kiểm tra + khai báo lại đúng cấu trúc.**

| # | Điều kiện | Mô tả |
|---|-----------|-------|
| 1 | File TopMenu tồn tại | `topMenuFile` phải tồn tại và trích xuất được ≥ 1 top menu (trừ portal không có TopMenu: sso, ketoan) |
| 2 | File NavMenu tồn tại | `navMenuFile` phải tồn tại và trích xuất được các nav menu item |
| 3 | Page đã khai báo `PAGE_ID` + `PAGE_FEATURES` | Mọi page `.tsx` trong `featuresDir` phải có `PAGE_ID` và `PAGE_FEATURES` đầy đủ |
| 4 | `PAGE_FEATURES` không rỗng | Không được để `PAGE_FEATURES = []` |
| 5 | `code` duy nhất trong trang | Mỗi feature phải có `code` DUY NHẤT (không trùng permissionCode) |

> Nếu điều kiện 3/4/5 chưa thỏa → **Agent phải báo cáo và tự động khai báo lại đầy đủ**, sau đó chạy lại script để xác nhận 100% trang đã có features.

---

## 3. Quy tắc menuCode

`{PREFIX}_{NAME_UPPER_SNAKE}`

- **NAME_UPPER_SNAKE**: tiếng Việt không dấu, HOA, `_` phân cách
- **Children**: `{PARENT_CODE}_{CHILD_UPPER_SNAKE}`

---

## 4. Quy tắc khai báo PAGE_FEATURES (BẮT BUỘC)

### 4.1 Mỗi feature phải có `code` DUY NHẤT trong cùng trang

- Dùng prefix để phân biệt loại thao tác:
  - `btn-` : Nút trên toolbar (Làm mới, Tạo mới, Xuất Excel...)
  - `row-` : Thao tác trên từng dòng (Xem chi tiết, Sửa, Xóa...)
  - `batch-` : Thao tác hàng loạt (Xóa tất cả, Ký theo lô...)
- Script sẽ báo LỖI + DỪNG nếu phát hiện trùng permissionCode

### 4.2 permissionCode được sinh tự động

- Format: `{Module}.{PascalFeatureCode}`
- VD: `code: 'btn-refresh'` → `HoaDon.BtnRefresh`
- VD: `code: 'row-view'` → `HoaDon.RowView`
- VD: `code: 'batch-delete'` → `HoaDon.BatchDelete`

### 4.3 KHÔNG dùng chung permissionCode

```typescript
// ❌ SAI: 2 feature cùng code 'sign' → trùng permissionCode
{ label: 'Gửi ký (dòng)',    code: 'row-sign' },
{ label: 'Ký theo lô (chọn)', code: 'batch-sign' },

// ✅ ĐÚNG: mỗi feature có code riêng
{ label: 'Gửi ký (dòng)',     code: 'row-sign' },
{ label: 'Ký theo lô (chọn)', code: 'batch-sign' },
```

---

## 5. Mẫu khai báo PAGE_FEATURES

```typescript
export const PAGE_ID = 'invoice-issuance'  // phải khớp navItem.id
export const PAGE_FEATURES = [
  { label: 'Làm mới',      code: 'btn-refresh' },
  { label: 'Tạo mới...',   code: 'btn-create' },
  { label: 'Xem chi tiết', code: 'row-view' },
]
```

---

## 6. Kiểm tra PAGE_FEATURES bằng check-master-page.cjs

```bash
node .claude/skills/tao-ui-master-page/check-master-page.cjs "src/modules/{portal}/features/**/pages/*.tsx"
```

Check `pageFeaturesMetadata` sẽ báo lỗi nếu:
- Thiếu `export const PAGE_ID`
- Thiếu `export const PAGE_FEATURES`
- `PAGE_FEATURES` là mảng rỗng `[]`

---

## 7. Sync Permission Mapping

Khi chạy với flag `--sync-mapping`, script tự động:
1. Export JSON như bình thường
2. Tự sinh/cập nhật file `src/shared/services/permissionMappings/PermissionMapping.{Portal}.ts`
3. Cập nhật barrel `index.ts` nếu có portal mới

**Cấu trúc file mapping:**

```
src/shared/services/permissionMappings/
├── types.ts                       ← PermissionMapping interface
├── PermissionMapping.Admin.ts     ← ADM_* → NavMenuAdmin IDs
├── PermissionMapping.Invoice.ts   ← INV_* → NavMenu IDs
├── PermissionMapping.Partner.ts   ← PTN_* → NavMenu IDs
├── ... (mỗi portal 1 file)
└── index.ts                       ← Barrel: gộp ALL_PERMISSION_MAPPINGS
```

**Luồng đồng bộ:**

```
export-menu-page-permission.cjs --sync-mapping
  ├── Đọc TopMenu.tsx → topMenu IDs (invoice, chungtu, report, ...)
  ├── Đọc NavMenu.tsx → navMenu IDs (invoice-management, chung-tu-tncn, ...)
  ├── Sinh SSO codes (INV_HOA_DON, INV_HOA_DON_DANH_SACH_HOA_DON, ...)
  ├── Tạo mapping: SSO code → { topMenuCode: NavMenu top ID, navMenuCode: NavMenu item ID }
  └── Ghi vào PermissionMapping.{Portal}.ts + cập nhật barrel index.ts
```

---

## 8. Quy trình export (BƯỚC 1 → BƯỚC 2)

```
1. Chạy script → chọn portal (hiển thị danh sách 1..N)
2. BƯỚC 1 — Kiểm tra điều kiện cấu trúc portal
   ├── PASS → chuyển BƯỚC 2
   └── FAIL → DỪNG, báo Agent kiểm tra + khai báo lại đúng cấu trúc
3. BƯỚC 2 — Export JSON vào .claude/skills/export-menu-page-permission/export-json
4. (Tùy chọn) chạy --sync-mapping để cập nhật mapping phân quyền
```
