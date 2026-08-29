# DLG-06 — Disable nút submit khi đang lưu

**Mức độ:** ERROR

Nút submit phải có `disabled={...}` gắn với trạng thái `submitting`/`saving`/`loading` để tránh double-submit khi đang gọi API.
