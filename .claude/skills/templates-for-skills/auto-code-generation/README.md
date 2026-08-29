# Template Files — Auto Code Generation

Các template trong thư mục này được viết theo chuẩn file markdown giống các template khác trong repo: mỗi file là một snippet `.md` có mô tả ngắn và khối code fenced để copy ra file thực tế.

---

## Files trong Folder Này

### 1. `tpl.auto-code-generation.use-create-form.md`
**Dùng cho:** Form TẠO MỚI entity có sinh mã tự động

**Gồm:**
- Gọi `useAutoCodePreview(catalogCodeType)` — lấy preview mã
- State form data + errors
- Validate + submit KHÔNG truyền code
- Return preview, loading, error, submitting state

**Cách dùng:**
1. Mở file template markdown.
2. Copy khối code `ts` bên trong.
3. Dán vào file hook thực tế của entity.
4. Thay service, `CatalogCodeType`, fields và validation tương ứng.

---

### 2. `tpl.auto-code-generation.create-dialog.md`
**Dùng cho:** Dialog TẠO MỚI entity

**Gồm:**
- Import + sử dụng hook form
- Hiển thị `<AutoCodePreviewDisplay />` — gợi ý mã
- Form fields (KHÔNG có code field)
- Submit button
- `<ValidationErrorDialog />` — xử lý lỗi server

**Cách dùng:**
1. Mở file template markdown.
2. Copy khối code `tsx` bên trong.
3. Dán vào dialog create thực tế.
4. Thay hook, field form, data nguồn và import path.

---

### 3. `tpl.auto-code-generation.use-edit-form.md`
**Dùng cho:** Form CHỈNH SỬA entity (KHÔNG dùng preview)

**Gồm:**
- ❌ KHÔNG gọi useAutoCodePreview
- ✅ Load item vào form
- ✅ Validate + submit KHÔNG truyền code
- Code là immutable

**Cách dùng:**
1. Mở file template markdown.
2. Copy khối code `ts` bên trong.
3. Dán vào hook edit thực tế.
4. Thay service, type, fields và validation tương ứng.

---

### 4. `tpl.auto-code-generation.edit-dialog.md`
**Dùng cho:** Dialog CHỈNH SỬA entity

**Gồm:**
- ❌ KHÔNG hiển thị `<AutoCodePreviewDisplay />`
- ✅ Hiển thị `item.code` (readonly)
- ✅ Form fields
- Submit button

**Cách dùng:**
1. Mở file template markdown.
2. Copy khối code `tsx` bên trong.
3. Dán vào dialog edit thực tế.
4. Thay field, type, options và import path.

---

## Quy Trình Tích Hợp

### Bước 1: Chọn Template Markdown Phù Hợp
- `tpl.auto-code-generation.use-create-form.md`
- `tpl.auto-code-generation.create-dialog.md`
- `tpl.auto-code-generation.use-edit-form.md`
- `tpl.auto-code-generation.edit-dialog.md`

Mỗi file chứa 1 khối code hoàn chỉnh để copy sang file thật trong feature của bạn.

### Bước 2: Chỉnh Sửa Template
1. Copy code block từ file markdown vào file `.ts` hoặc `.tsx` thực tế
2. Thay `Employee` → tên entity của bạn
3. Thay `EmployeeApiService` → ApiService của entity bạn
4. Thay `0` (CatalogCodeType) → loại entity của bạn (xem SKILL.md)
5. Thay form fields và options → data của entity bạn

### Bước 3: Tích Hợp vào Page
```tsx
import { CreateEmployeeDialog, EditEmployeeDialog } from '../dialogs'
import { useCreateEmployeeForm, useEditEmployeeForm } from '../hooks'

function YourPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState(null)

  return (
    <>
      <button onClick={() => setShowCreate(true)}>+ Tạo mới</button>

      <CreateEmployeeDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={refreshList}
      />

      <EditEmployeeDialog
        open={editItem !== null}
        onOpenChange={v => { if (!v) setEditItem(null) }}
        item={editItem}
        onSuccess={refreshList}
      />
    </>
  )
}
```

### Bước 4: Test
- [ ] Mở form tạo mới → preview mã hiển thị đúng
- [ ] Điền form → submit → nhận mã từ response
- [ ] Mở form chỉnh sửa → code hiển thị readonly
- [ ] Chỉnh sửa → submit → code không thay đổi
- [ ] Test lỗi: chưa config, network error

---

## Lưu Ý Quan Trọng

### ✅ QUY TẮC TUÂN THỦ

1. **Form tạo:** PHẢI gọi `useAutoCodePreview`
   - Hiển thị preview
   - KHÔNG có field code
   - KHÔNG truyền code vào body

2. **Form chỉnh sửa:** KHÔNG gọi `useAutoCodePreview`
   - Hiển thị code readonly từ item.code
   - KHÔNG cập nhật code
   - KHÔNG truyền code vào body

3. **Response:** Lấy code từ `response.data.code`
   - Dùng để hiển thị hoặc refresh data
   - KHÔNG dùng để pre-fill next entity

### ❌ CẤM

- Pre-fill `preview.nextCode` vào input
- Truyền code vào body request
- Gọi preview khi chỉnh sửa
- Tự sinh mã thay vì dùng hook

---

## Tra Cứu CatalogCodeType

| CatalogCodeType | Entity | Example |
|-----------------|--------|---------|
| 0 | Employee (Nhân viên) | Mã: NV001, NV002, ... |
| 1 | Customer (Khách hàng) | Mã: KH001, KH002, ... |
| 3 | Product (Hàng hóa) | Mã: SP001, SP002, ... |
| 4 | Department (Phòng ban) | Mã: PB001, PB002, ... |

Xem **SKILL.md** để tra cứu 52 loại đầy đủ.

---

## Support

- Nếu lỗi: Kiểm tra SKILL.md → phần "Xử Lý Lỗi"
- API Service không sinh mã: Đảm bảo Admin đã tạo cấu hình qua `/auto-code-configs`
- Preview không hiển thị: Kiểm tra `isNotConfigured` hoặc `previewError`
