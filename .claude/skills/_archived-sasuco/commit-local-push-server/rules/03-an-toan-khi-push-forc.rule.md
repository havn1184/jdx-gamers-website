# Rule: An Toàn Khi Push FORCE (Vượt Ngưỡng)

## Khi nào dùng `--push --force`

- User yêu cầu **push luôn / push ngay** dù chưa đủ ngưỡng.
- Muốn đẩy các commit dù mỗi repo chỉ có 1–2 commit.

Các alias tương đương: `-f` / `-F` / `--force` / `--push-luon` / `--push-ngay` / `--push-now` / `--push-all`.

## Điều kiện bắt buộc (an toàn)

| ✅ ĐƯỢC | ❌ KHÔNG |
| ------- | ------- |
| Push FORCE khi repo sạch (đã commit hết) | Push FORCE khi repo còn **thay đổi chưa commit** — phải commit trước |
| Push FORCE khi đang ở đúng branch | Push FORCE khi đang ở `main` hoặc branch sai |
| Đồng bộ `pull --rebase` trước khi push FORCE | Bỏ qua pull → bị reject non-fast-forward |

> Script **từ chối** push FORCE với repo đang có thay đổi chưa commit hoặc branch sai —
> những repo đó chỉ được liệt kê vào danh sách "cần xử lý thủ công", không tự push.

## Luồng kiểm tra trước khi commit

1. Chạy script (KHÔ) → liệt kê file chưa commit của từng repo.
2. Agent chạy **`get_errors`** trên các file đó để kiểm tra lỗi nhanh.
3. Có lỗi → sửa hết. Không lỗi → chạy `--commit`.
4. Chạy `--push` (đủ ngưỡng) hoặc `--push --force` (push luôn, bỏ ngưỡng).
