# DLGNEW-14 — Tabs (nếu có) dùng đúng component

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Nếu dialog có tabs, pattern Danh Mục dùng `DmTabTrigger`; pattern Nghiệp Vụ dùng tab button riêng (VD: `tab_hach_toan`). Không tự chế tabs bằng div/button tùy tiện không theo 2 pattern chuẩn.

## Ví dụ đúng
```tsx
<DmTabTrigger value='thong-tin-chung'>Thông tin chung</DmTabTrigger>
```

## Ví dụ sai
```tsx
<div className='tab' onClick={() => setTab('info')}>Thông tin</div>
```
