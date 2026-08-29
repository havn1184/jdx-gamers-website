# Báo Cáo Quét — Dialog Đóng Không Báo Lỗi BE (KiemThuApp)

> **Ngày:** 2026-08-13 | **Portal:** KiemThuApp | **Script:** `20260813_scan-dialog-success-check.cjs`
> **Phạm vi:** Toàn bộ `*Dialog.tsx` (59 dialogs) + mọi file trong thư mục `hooks/` (142 hooks) = **201 files**

---

## 1. Lỗi Gốc Được Báo Cáo

Tạo SR mới với Mô tả < 20 ký tự → BE trả `VALIDATION_ERROR`:

```json
{
  "success": false,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "errorCode": "VALIDATION_ERROR",
  "errorDetails": [{ "message": "Mô tả tối thiểu 20 ký tự" }]
}
```

**Triệu chứng:** Dialog đóng luôn, không thông báo lỗi (chỉ thấy trong Network tab).

**Nguyên nhân gốc (root cause):**
1. `apiCall` (ApiClient.ts) **normalize HTTP 400/500 về response `success:false` (status 200), KHÔNG throw** — comment trong code: *"caller xử lý qua `if (res.success)` ... else setServerError(res)"*.
2. `SwRequestDialog.handleSubmit` gọi `await SwRequestApiService.create(...)` nhưng **KHÔNG check `res.success`** → code chạy tiếp `toast.success(...)` + `onOpenChange(false)` → dialog đóng dù BE lỗi.
3. **Thiếu pre-validate FE:** hook form chỉ check `validateRequired('Mô tả')` — không có rule "tối thiểu 20 ký tự" của BE.

---

## 2. Kết Quả Quét

| Loại lỗi | Mô tả | Số lượng | Trong phạm vi dialog? |
|----------|-------|:--------:|:---------------------:|
| **BUG-1** 🔴 | Gọi API + `toast.success` nhưng KHÔNG check `res.success` → BE lỗi vẫn đóng dialog | **3 chỗ** (SwRequestDialog, handleCommit, handleAction) | ✅ Đã sửa |
| **BUG-2** 🔴 | `useState<any>` cho serverError | 0 | — |
| **BUG-3** 🔴 | `errorCode={serverError?.name}` (sai prop) | 0 | — |
| **BUG-4** 🟡 | `toast.error` khi API lỗi thay vì `ValidationErrorDialog` | 6 | ❌ Page hooks (tồn đọng) |
| **maxWidth** 🔴 | DialogContent thiếu prop `maxWidth` → width không hiệu lực | 1 | ✅ Đã sửa |

> **Kết luận:** 100% dialogs (59/59) sau khi sửa đều check `res.success` trước khi toast thành công + đóng. Không còn dialog nào vi phạm lỗi "đóng không báo lỗi".

---

## 3. Các File Đã Sửa

### 3.1 `SwRequestDialog.tsx` (BUG-1 + pre-validate) — File gây lỗi báo cáo

| Thay đổi | Chi tiết |
|----------|----------|
| Check `res.success` | `const res = mode === 'create' ? await create(...) : await update(...)` → `if (!res.success) { setServerError(res); return }` |
| Bỏ `any` | `useState<any>` → `useState<ApiResponse<unknown> \| null>` |
| Sửa prop sai | `errorCode={serverError?.name}` → `errorCode={serverError?.errorCode}` |
| Catch typing | `catch (error: any)` → `catch (error: unknown)` + cast |

### 3.2 `useSwRequest.dlg.form.ts` (pre-validate theo BE)

- Thêm rule: **Mô tả tối thiểu 20 ký tự** → `VALIDATION_MESSAGES.MIN_LENGTH('Mô tả', 20)` (khớp BE `VALIDATION_ERROR "Mô tả tối thiểu 20 ký tự"`)

### 3.3 `useSwRequestDetailPage.ts` (BUG-1 — phát hiện khi quét)

| Function | Lỗi | Fix |
|----------|-----|-----|
| `handleCommit` | `await commit(...)` không check `res.success` → toast thành công dù BE lỗi | `const res = await commit(...)` → `if (!res.success) { setServerError(res); return }` |
| `handleAction` | `await actionFn()` (start/complete/decline/reject/resubmit) không check response | Check `'success' in result && result.success === false` → `setServerError` |

### 3.4 `SwRequestDialog.tsx` — fix kèm (check-dialog.cjs CRITICAL)

| Thay đổi | Chi tiết |
|----------|----------|
| maxWidth | `DialogContent` thiếu prop `maxWidth` → width 640px không hiệu lực (bị giới hạn `sm:max-w-lg` 512px). Đã thêm `maxWidth='640px'` → check-dialog PASS |

---

## 4. Tồn Đọng (Ngoài Phạm Vi Dialog — Page Hooks)

6 lỗi BUG-4 tại các **page hooks** (action inline trên trang list/detail, không phải dialog). Ghi nhận để xử lý sau:

| File | Function | Ghi chú |
|------|----------|---------|
| `bugs/hooks/useBugMemberAssign.ts` | `assignBug` | Gán bug → `toast.error` khi API lỗi |
| `bugs/hooks/useBugReplies.ts` | `submitReply` | Reply bug |
| `bugs/hooks/useBugTableActions.ts` | `handleStatusSubmit`, `handleSourceSubmit` | Đổi trạng thái/nguồn nhanh |
| `doc-review/hooks/useDocReviewPage.ts` | `handleApprove`, `handleApproveAll` | Duyệt tài liệu |

**Đề xuất:** Chuyển sang `setServerError(res)` + `ValidationErrorDialog` (page cần có sẵn `ValidationErrorDialog` render), hoặc giữ `toast.error` nếu sản phẩm chấp nhận UX toast cho action nhanh — cần quyết định sản phẩm.

---

## 5. Script Mới + Tích Hợp

### 5.1 Script quét (deliverable)

| Script | Vị trí |
|--------|--------|
| `20260813_scan-dialog-success-check.cjs` | `.github/script-run-daily/` (chạy 1 lần, in báo cáo đầy đủ) |
| `check-dialog-success-check.cjs` | `.claude/skills/checklist-sau-code/scripts/check-for-skill/` (chính thức, nhận `PortalPath [feature]`, in FAIL-only) |
| `check-all.cjs` | Đã đăng ký: map skill + thêm vào `checks[]` → **38 scripts** |
| `SKILL.md` (`checklist-sau-code`) | Đã cập nhật bảng script (#28) + mô tả frontmatter (38 scripts) |

### 5.2 Cách chạy

```bash
# Toàn portal
node .claude/skills/checklist-sau-code/scripts/check-for-skill/check-dialog-success-check.cjs src/modules/KiemThuApp

# 1 feature
node .claude/skills/checklist-sau-code/scripts/check-for-skill/check-dialog-success-check.cjs src/modules/KiemThuApp features/yeu-cau-phan-mem/sw-requests

# Qua check-all (37 scripts)
node .claude/skills/checklist-sau-code/scripts/check-for-skill/check-all.cjs src/modules/KiemThuApp
```

### 5.3 Logic phát hiện (4 pattern)

1. **BUG-1 🔴 CRITICAL:** function gọi `ApiService.method()` + `toast.success` nhưng không có `.success` check (regex `(?<!toast)\.success` — loại trừ `toast.success`).
2. **BUG-2 🔴 CRITICAL:** `useState<any>` cho serverError.
3. **BUG-3 🔴 CRITICAL:** `errorCode={serverError?.name}`.
4. **BUG-4 🟡 HIGH:** `toast.error` **ngoài catch block** (catch = lỗi mạng thực sự, hợp lệ) **và SAU service call** (loại `toast.error` validate client-side trước call).

### 5.4 Điểm cần lưu ý khi dùng script

- Script là **heuristic regex** — có thể false positive/negative. Khi nghi ngờ → đối chiếu thủ công với skill `tich-hop-api-ui` + `tao-ui-dialog`.
- BUG-4 chỉ là tín hiệu cần review thủ công, không phải lỗi tuyệt đối (toast.error trong catch mạng là hợp lệ).

---

## 6. Tuân Thủ Quy Tắc Đã Sửa

| Quy tắc | Trạng thái |
|---------|:----------:|
| FE pre-validate theo yêu cầu BE (Mô tả ≥ 20 ký tự) | ✅ |
| BE trả lỗi → `ValidationErrorDialog` hiển thị rõ, KHÔNG đóng dialog | ✅ |
| Không dùng `any` | ✅ |
| Prop đúng: `errorCode` (không phải `name`) | ✅ |
| Ghi nhận tồn đọng ngoài phạm vi | ✅ |
