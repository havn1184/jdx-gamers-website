# Nâng cấp: Trang "Bảng xếp hạng JCoin" (tuần/tháng/năm)

**Ngày tạo:** 02/09/2026
**Project:** Website (JGameApp) - đồng bộ với Backend (JGameApi) và App (Flutter)
**Trạng thái:** Draft - chờ duyệt Phase 1
**Tài liệu Backend (nguồn contract):** `Backend/JGameApi/Docs/Nang-cap/20260902-nc_xep-hang-jcoin.md`

---

## 1. Phạm vi tác động

### 1.1 Hiện trạng thực tế (đã khảo sát)

- `routes/routeConfig.tsx`: nhóm "Kiếm tiền" hiện có `kiem-tien` (marketplace, public), `kiem-tien/:taskId` (chi tiết, public), `kiem-tien/nhiem-vu-cua-toi` (requireAuth). Chưa có route ranking.
- `features/Public/tasks/`: đã có `services/TaskApiService.ts`, `types/task.types.ts`, `pages/TasksMarketplacePage.tsx` - route ranking mới sẽ đặt cùng cấp (`features/Public/tasks/ranking/` hoặc `pages/TaskRankingPage.tsx` ngay trong `features/Public/tasks/pages/`, quyết định lúc code theo mức độ phức tạp thực tế của hook/component).
- Chưa có pattern hiển thị "bảng xếp hạng nhiều người" ở bất kỳ trang nào hiện có trong JGameApp - cần thiết kế mới (không có UI tương tự để tái dùng), tham khảo phong cách bảng đã có (`AdminReferralPartnersPage.tsx`) cho khung bảng, nhưng phần "Top 3 nổi bật" là UI mới hoàn toàn.

### 1.2 Danh sách file/module tác động

| File/Module | Loại |
|---|---|
| `features/Public/tasks/types/task.types.ts` (+`TaskRankingPeriod`, `TaskRankingEntry`, `TaskRanking`) | Sửa |
| `features/Public/tasks/services/TaskApiService.ts` (+`getRanking`) | Sửa |
| `features/Public/tasks/hooks/useTaskRanking.page.fetchData.ts` (mới) | Mới |
| `features/Public/tasks/pages/TaskRankingPage.tsx` (mới) | Mới |
| `features/Public/tasks/pages/TasksMarketplacePage.tsx` (+nút/banner "Xem bảng xếp hạng") | Sửa |
| `routes/routeConfig.tsx` (+`kiem-tien/xep-hang`) | Sửa |
| `.claude/business-rules/kiem-tien-jcoin.md`, `system-architect/routing-va-layout.md`, `CHANGELOG.md` | Sửa |

---

## 2. Thiết kế UI - "Bảng xếp hạng JCoin" (`/jgame/kiem-tien/xep-hang`, public)

### 2.1 Bố cục tổng thể (từ trên xuống)

1. **Header**: tiêu đề "Bảng xếp hạng JCoin" + phụ đề ngắn ("Kiếm càng nhiều JCoin, thứ hạng càng cao").
2. **Tab chọn kỳ**: 3 tab dạng pill `Tuần này | Tháng này | Năm nay` (giống pattern tab `Đối tác/Giao dịch` ở `AdminReferralPartnersPage.tsx`), đổi tab gọi lại API tương ứng.
3. **Top 3 nổi bật** (chỉ khi có đủ dữ liệu): 3 thẻ dạng "bục vinh danh" (podium) - hạng 2 bên trái, hạng 1 ở giữa (to hơn, có viền/glow vàng), hạng 3 bên phải - avatar tròn lớn, tên, số JCoin, huy hiệu 🥇🥈🥉. Đây là điểm nhấn hình ảnh chính của trang theo đúng yêu cầu "sinh động, khoa học, đẹp".
4. **Danh sách hạng 4-50**: bảng/list dạng hàng ngang - cột thứ hạng (số, không huy hiệu), avatar nhỏ, tên, số JCoin (căn phải, đơn vị rõ ràng qua `formatNumber`/icon JCoin đã dùng ở Ví).
5. **Thanh "Vị trí của tôi"** (sticky ở đáy nội dung, chỉ hiện khi đã đăng nhập): tách biệt hẳn phần cuộn ở trên bằng viền/nền khác màu (giống card gradient thương hiệu `jgame-gradient-brand` đã dùng) - hiển thị hạng của user hiện tại (hoặc "Chưa có JCoin nào kỳ này" nếu `rank == null`) + số JCoin đã kiếm trong kỳ. Nếu chưa đăng nhập: thay bằng dòng "Đăng nhập để xem thứ hạng của bạn" + link đăng nhập.

### 2.2 Trạng thái

- Loading: skeleton cho 3 khối podium + vài dòng danh sách (tái dùng pattern loading "Đang tải..." đã dùng trong toàn bộ JGameApp nếu chưa có skeleton component riêng - không tạo skeleton mới nếu không cần).
- Rỗng (chưa ai kiếm JCoin trong kỳ): thông điệp trung tính "Chưa có ai lọt bảng xếp hạng kỳ này - hãy là người đầu tiên!" kèm nút "Khám phá nhiệm vụ" quay lại marketplace.
- Lỗi tải: thông báo lỗi + nút thử lại (pattern chung toàn app).

### 2.3 Lối vào

- Nút/banner nổi bật "🏆 Xem bảng xếp hạng" ở `TasksMarketplacePage.tsx` (đầu trang, cạnh tiêu đề marketplace).
- (Tuỳ chọn, quyết định lúc code nếu không tốn thêm effort đáng kể) thêm link tương tự ở `MyTasksPage.tsx`.

## 3. Type & Service

```ts
export type TaskRankingPeriod = 'week' | 'month' | 'year'

export interface TaskRankingEntry {
  rank: number | null
  userId: string
  name: string
  avatarUrl: string | null
  jcoinEarned: number
  isCurrentUser: boolean
}

export interface TaskRanking {
  period: TaskRankingPeriod
  periodStart: string
  periodEnd: string
  items: TaskRankingEntry[]
  myEntry: TaskRankingEntry | null
}
```

`TaskApiService.getRanking(period)` → `GET /api/tasks/ranking?period=...` (BE trả nguyên object `TaskRankingResponse` - field **giống hệt BE**, không đổi tên).

## 4. Trình tự thực hiện

1. Thêm type + service method (làm trước, các bước sau dùng đúng type).
2. `useTaskRanking.page.fetchData.ts`: state `period`, gọi lại API khi đổi tab.
3. `TaskRankingPage.tsx`: layout theo mục 2 (header, tab, podium Top 3, danh sách 4-50, thanh vị trí của tôi).
4. Thêm route `kiem-tien/xep-hang` + nút vào từ `TasksMarketplacePage.tsx`.
5. `npx tsc -b` sạch, boot dev server kiểm tra cả 3 tab không lỗi console, kiểm tra trạng thái rỗng/lỗi.
6. Cập nhật governance (`kiem-tien-jcoin.md`, `routing-va-layout.md`, `CHANGELOG.md`).

## 5. Checklist sau khi code xong

- [ ] `npx tsc -b` sạch
- [ ] 3 tab kỳ đều gọi đúng API, hiển thị đúng dữ liệu
- [ ] Thanh "Vị trí của tôi" đúng cả 3 trạng thái: đã đăng nhập trong Top 50 / ngoài Top 50 / chưa đăng nhập
- [ ] Trạng thái rỗng/lỗi hiển thị đúng
- [ ] Commit + push

## 6. Tham chiếu

- Backend: `Backend/JGameApi/Docs/Nang-cap/20260902-nc_xep-hang-jcoin.md`
- Pattern tham chiếu: `AdminReferralPartnersPage.tsx` (tab pill), Ví JCoin (`features/Public/wallet/`, cách hiển thị số JCoin)
