# DLGNEW-13 — [Nghiệp Vụ] Input số dùng type='text' inputMode='numeric'

**Mức độ:** WARN
**Kiểm tra:** tự động (bỏ qua pattern Danh Mục CRUD — có `DmFormField`)

## Mô tả
Trường nhập số (đơn giá, số lượng, tiền...) phải dùng `type='text' inputMode='numeric'`, KHÔNG dùng `type='number'` (tránh vấn đề UX của input number trên trình duyệt/mobile).

## Ví dụ đúng
```tsx
<Input type='text' inputMode='numeric' className='text-right' value={soLuong} />
```

## Ví dụ sai
```tsx
<Input type='number' value={soLuong} />
```
