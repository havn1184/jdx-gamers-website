# MPAGE-11 — data-qa trên các button

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Các nút trên Master Page phải có `data-qa` với tiền tố `btn_` (VD: `btn_lam_moi`, `btn_them_moi`, `btn_xem_{id}`, `btn_sua_{id}`, `btn_xoa_{id}`).

## Ví dụ đúng
```tsx
<Button data-qa='btn_lam_moi'>Làm mới</Button>
```

## Ví dụ sai
```tsx
<Button>Làm mới</Button> {/* thiếu data-qa */}
```
