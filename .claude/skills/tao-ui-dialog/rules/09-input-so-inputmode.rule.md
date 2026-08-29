# DLG-09 — Input số dùng inputMode, không dùng type="number"

**Mức độ:** ERROR

Input nhập số phải dùng `type="text" inputMode="numeric"`, KHÔNG dùng `type="number"` (tránh các vấn đề UX của input number gốc trên trình duyệt/mobile: scroll đổi giá trị, ký tự e/+/-, spinner...).
