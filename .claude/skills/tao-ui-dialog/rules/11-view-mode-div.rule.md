# DLG-11 — View mode hiển thị div, không dùng input disabled

**Mức độ:** ERROR (kiểm tra thủ công)

Ở mode "View" (chỉ xem), field phải hiển thị bằng `<div>`/`<span>` tĩnh, KHÔNG dùng `<input disabled>` (tránh style xám mờ gây cảm giác "bị khóa" thay vì "đang xem").

> Ghi chú: script hiện tại luôn pass rule này vì việc phân biệt "input disabled thật" với "input hợp lệ có disabled tạm thời" cần đọc hiểu ngữ cảnh — cần review thủ công khi có mode View.
