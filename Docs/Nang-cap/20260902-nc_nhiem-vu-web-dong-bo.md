# Nâng cấp: Đồng bộ thiết kế phân hệ "Kiếm tiền" trên Website theo cấu trúc nhiệm vụ mới (mô tả, yêu cầu, các bước, theo dõi tiến độ)

**Ngày tạo:** 02/09/2026
**Project:** Website (JGameApp storefront - React/Vite)
**Trạng thái:** Đã code (Phase 2 xong 02/09/2026) - chờ kiểm thử thật trên trình duyệt với Backend development đã nâng cấp (mục 5)

---

## 1. Phạm vi tác động

### 1.1 Tổng quan

| Mục | Nội dung |
|---|---|
| Project chính | `Website` - `src/modules/JGameApp/features/Public/tasks/` + `features/Account/User/tasks/` |
| Project phụ thuộc | `Backend` - chờ `Backend/JGameApi/Docs/Nang-cap/20260902-nc_nhiem-vu-mo-ta-tien-do.md` Phase 2 xong; thiết kế đồng bộ với App `App/Docs/Nang-cap/20260902-nc_nhiem-vu-app-ux.md` (cùng thứ tự khối thông tin, cùng câu chữ do BE trả) |
| Luồng nghiệp vụ | Kiếm tiền: marketplace -> chi tiết -> đăng ký -> theo dõi tiến độ -> nhận JCoin |
| Loại tác động | [NV] Hiển thị đủ thông tin nghiệp vụ + công cụ theo dõi tiến độ + [KT] Đồng bộ type theo DTO mới, bỏ N+1 ở "Nhiệm vụ của tôi", lọc server-side, bỏ số liệu ước lượng sai lệch ("JCoin đã tích lũy") |
| Mức độ rủi ro | Trung bình - `getMyTasks` đổi shape (breaking, phối hợp Backend); còn lại additive |
| Phụ thuộc nc_ khác | Backend `20260902-nc_nhiem-vu-mo-ta-tien-do.md` (bắt buộc trước) |

### 1.2 Danh sách file/module tác động

| Project | File/Module | Loại thay đổi | Ghi chú |
|---|---|---|---|
| Website | `features/Public/tasks/types/task.types.ts` | Sửa | `GameTask` thêm `description`, `requirementTargetValue`, `requirementHoursPerDay`, `requirementItemNames`, `requirementSummary`, `steps: TaskStep[]`, `status: 'active' \| 'closed'`, `endAt`, `gameAndroidUrl`, `gameIosUrl`, `slotsLeft`; bỏ `deadline?` (thay bằng `endAt`), `description` chuyển từ optional-mock sang field thật; `UserTaskProgress` thêm `status`, `percent`, `registeredAt`, `rewardClaimedAt`, `milestones`, `events`; thêm `MyTaskItem { task, progress }`; giữ `art?` làm fallback ảnh |
| Website | `features/Public/tasks/services/TaskApiService.ts` | Sửa | `normalizeApiTask` map field mới (enum int -> string cho `status`, `source`); `getTasks(params)` build querystring `requirementType` (string -> int) + `keyword`; `getMyTasks()` parse `MyTaskItem[]` (xoá vòng `Promise.all` gọi progress); thêm `syncProgress(taskId)` POST; `normalizeApiProgress` mới |
| Website | `features/Public/tasks/utils/formatRequirement.ts` | Sửa | `formatRequirementSummary` trả `task.requirementSummary` (fallback nhãn cũ nếu rỗng); `getProgressPercent` trả `progress.percent`; **xoá `getEarnedSoFar`** (số ước lượng không có thật); thêm `getStepState(step, progress)`, `formatEventSource(source)` |
| Website | `features/Public/tasks/hooks/useTaskMarketplace.page.fetchData.ts` | Sửa | Chuyển lọc client-side sang gọi `getTasks({requirementType, keyword})` với debounce 400ms; giữ state `keyword`/`requirementType` như cũ để page không đổi chữ ký |
| Website | `features/Public/tasks/hooks/useTaskDetail.page.fetchData.ts` | Sửa | Thêm `handleSync` (gọi `syncProgress`, cập nhật `progress`, lỗi -> `errorMessage`), `syncing`, `syncCooldown` (60s); poll giảm từ 3s xuống 15s, dừng poll khi `progress.isCompleted` |
| Website | `features/Public/tasks/components/TaskRequirementCard.tsx` | Mới | Khối "Bạn cần đạt gì?" - summary + chip mục tiêu/giờ-ngày/thời hạn + danh sách vật phẩm |
| Website | `features/Public/tasks/components/TaskStepsList.tsx` | Mới | Danh sách bước có trạng thái done/current/upcoming |
| Website | `features/Public/tasks/components/TaskProgressPanel.tsx` | Mới | Tiến độ: badge, progress bar có vạch mốc, mốc, "Đồng bộ lần cuối" + nút "Đồng bộ ngay", nhật ký thu gọn |
| Website | `features/Public/tasks/pages/TaskDetailPage.tsx` | Sửa | Bố cục mới (xem 3.2), dùng 3 component trên, bỏ khối "Đã tích lũy x/y JCoin", CTA theo trạng thái task (hết suất/đã đóng/hết hạn) |
| Website | `features/Public/tasks/pages/TasksMarketplacePage.tsx` | Sửa | Card thêm dòng `requirementSummary` từ BE, "Còn X suất", badge "Đã đóng"; empty khi lọc có nút "Xoá bộ lọc" |
| Website | `features/Account/User/tasks/hooks/useMyTasks.page.fetchData.ts` | Sửa | Dùng shape mới; poll 15s; thêm filter `all \| inProgress \| completed` |
| Website | `features/Account/User/tasks/pages/MyTasksPage.tsx` | Sửa | Thẻ tổng quan (đang làm/hoàn thành/JCoin đã nhận), tab lọc, card có `requirementSummary` + `percent` + "Đồng bộ" |
| Website | `.claude/business-rules/kiem-tien-jcoin.md` | Sửa (governance) | Mục "Đồng bộ tiến độ (mock)" và "Chưa triển khai" mô tả timer client mock đã xoá - cập nhật theo cơ chế Backend mới (worker mô phỏng + đồng bộ thủ công); bảng "Cách hiển thị tiến độ" cập nhật theo `requirementSummary` |

### 1.3 Rủi ro chi tiết

| Rủi ro cụ thể | Mức độ | Biện pháp xử lý |
|---|---|---|
| Deploy Website trước Backend -> `getMyTasks` nhận shape cũ (`GameTask[]`) -> `item.task` undefined -> trang trắng | Cao | `getMyTasks` kiểm tra `Array.isArray(data) && data[0] && 'task' in data[0]`; shape cũ -> trả `{success:false, message:'Backend chưa cập nhật phân hệ nhiệm vụ'}` để trang hiện lỗi thay vì crash; deploy cùng đợt 3 project như kế hoạch nc_ Backend |
| Field mới undefined trên Backend cũ ở trang detail | Thấp | `normalizeApiTask` default `steps ?? []`, `description ?? ''`, `requirementSummary ?? formatRequirementSummary cũ`; component ẩn khối khi rỗng |
| Trang Kiếm tiền poll 3s hiện tại nhân với nhiều tab mở gây tải Backend khi có worker thật | Thấp | Giảm poll 15s, dừng khi completed, dừng khi `document.hidden` (visibilitychange) |
| Xoá `getEarnedSoFar` có nơi khác import | Thấp | Grep toàn `Website/src` trước khi xoá (hiện chỉ `TaskDetailPage.tsx` dùng) |
| Lỗi TS tồn đọng ở module khác làm khó lọc lỗi mới | Thấp | Theo skill `dong-bo-thiet-ke-mockdata` (Website): `npx tsc -b` rồi grep theo `tasks` để chỉ xét lỗi liên quan file mình sửa |

---

## 2. Hiện trạng & Vấn đề

### 2.1 Hiện trạng thực tế (khảo sát trực tiếp code)

- `task.types.ts` tự ghi chú "TỰ QUYẾT ... `requirement` chi tiết bị bỏ, BE chỉ trả `requirementType` phẳng - UI chỉ hiển thị được tên loại yêu cầu chung chung"; `art`/`description`/`deadline` là optional chỉ có ở mock đã xoá -> hiện `description` và `deadline` luôn undefined trên API thật.
- `formatRequirement.ts`: `formatRequirementSummary` trả nhãn cố định ("Đạt cấp độ mục tiêu" / "Duy trì thời lượng chơi theo ngày" / "Sưu tập đủ vật phẩm") - khác câu chữ App ("Cấp độ" / "Giờ chơi" / "Sưu tập") -> 2 FE không nhất quán. `getEarnedSoFar` ước lượng tuyến tính "JCoin đã tích lũy" hiển thị ở `TaskDetailPage` như số thật - gây hiểu nhầm (JCoin chỉ cộng 1 lần khi hoàn thành).
- `TaskDetailPage.tsx`: có khung 2 cột (gallery trái, thông tin phải), có badge quỹ NPH, có mã đăng ký, có "Đồng bộ lần cuối", CTA theo auth - tốt. Thiếu: mô tả, mục tiêu cụ thể, các bước, thời hạn, mốc, nhật ký, đồng bộ thủ công; hiển thị "Đã tích lũy" sai bản chất.
- `TasksMarketplacePage.tsx`: hero + search + 4 tab lọc + grid card - tốt; nhưng `TaskApiService.getTasks(_params)` bỏ qua tham số, hook lọc client-side; card không có dòng yêu cầu cụ thể.
- `TaskApiService.getMyTasks`: gọi `/api/tasks/my` rồi `Promise.all` gọi `/progress` cho từng task (N+1); `useMyTasks.page.fetchData.ts` poll 3s -> N+1 mỗi 3 giây.
- `MyTasksPage.tsx`: card có progress bar + `formatProgressSummary` + đồng bộ lần cuối - tốt; thiếu tổng quan, lọc trạng thái, câu yêu cầu cụ thể.
- Theme storefront tối (`text-white/60`, `bg-white/5`, `jgame-gradient-brand`) - khác App (light) nhưng cùng bộ màu thương hiệu; **không đổi theme**, chỉ đồng bộ cấu trúc thông tin và câu chữ.

### 2.2 Vấn đề cần giải quyết

- [NV] Người dùng Website cũng không biết nhiệm vụ làm gì / cần đạt gì / các bước / thời hạn - cùng vấn đề App.
- [NV] Thiếu công cụ theo dõi: mốc, nhật ký, đồng bộ thủ công; số "JCoin đã tích lũy" là ước lượng gây hiểu nhầm.
- [KT] Câu diễn giải yêu cầu khác App -> không nhất quán cross-FE; cần dùng `requirementSummary` từ BE.
- [KT] N+1 request + poll 3s ở Nhiệm vụ của tôi; lọc client-side dù đã có tham số.

---

## 3. Giải pháp nâng cấp

### 3.1 Hướng giải quyết

- Dùng field Backend mới làm nguồn duy nhất cho câu chữ (`requirementSummary`), `percent`, `status`, `milestones`, `events` - App và Website hiển thị y hệt nội dung (khác theme).
- Cấu trúc khối thông tin ở `TaskDetailPage` theo đúng thứ tự App (là gì -> cần đạt gì -> các bước -> tiến độ -> mã -> CTA) để người dùng chuyển giữa 2 nền tảng không lạc.
- Thay số ước lượng bằng dữ liệu thật: mốc đạt được + thời điểm, nhật ký đồng bộ.
- Giữ nguyên kiến trúc file hiện có (`services/hooks/pages/components/utils`), chỉ thêm 3 component thuần hiển thị; không đổi HashRouter/route.
- `getMyTasks` 1 request; poll 15s và dừng khi hoàn thành/ẩn tab.

### 3.2 Bố cục sau nâng cấp

**TaskDetailPage (cột phải, từ trên xuống):**

```
publisherName + badge quỹ NPH | h1 title | chip trạng thái (Đang mở / Đã đóng / Hết suất / Hết hạn dd/MM)
Khối thưởng + suất: "40.000 JCoin" | "Còn 54/150 suất" (đỏ nhấp nháy nếu <=5% như hiện tại) | "Hạn: 30/09/2026" (nếu endAt)
"Nhiệm vụ này là gì?": description + nút "Tải Android"/"Tải iOS" (chỉ khi có URL)
TaskRequirementCard: requirementSummary + chip (Cấp 30 | 2 giờ/ngày x 7 ngày | ...) + danh sách vật phẩm (collection)
TaskStepsList: steps[] với trạng thái done/current/upcoming (quy tắc giống App: notRegistered->b1; inProgress&percent=0->b2,b3; percent>0->b4; completed->all)
TaskProgressPanel (đã đăng nhập & isRegistered):
   badge Đang thực hiện / Đã nhận thưởng | "3/7 - 43%" | progress bar có vạch mốc
   4 mốc (tick + label + reachedAt) | "Đồng bộ lần cuối: ..." + nút "Đồng bộ ngay" (cooldown 60s, disabled khi syncing)
   nhật ký: 3 event mới nhất + "Xem tất cả (n)"
   completed: banner "Chúc mừng! Đã nhận 40.000 JCoin vào ví lúc ..." (giữ PartyPopper hiện có)
Mã đăng ký (KeyRound) - giữ, thêm nút copy
CTA: guest "Đăng nhập để đăng ký" | "Đăng ký nhiệm vụ" | disabled "Đã đủ số lượng" / "Nhiệm vụ đã đóng" / "Đã hết hạn"
Link "<- Xem các nhiệm vụ khác" giữ
```

**TasksMarketplacePage:** giữ hero/search/tab; `getTasks({requirementType, keyword})` server-side (debounce 400ms); card: dòng `requirementSummary` thay nhãn cố định; "Còn X suất"; badge "Đã đóng" khi `status==='closed'`; empty có nút "Xoá bộ lọc".

**MyTasksPage:** thẻ tổng quan 3 số (đang làm / hoàn thành / JCoin đã nhận = tổng `rewardJcoin` các item `isCompleted`); tab "Tất cả / Đang làm / Hoàn thành"; card: `requirementSummary`, `percent` từ BE, badge, đồng bộ lần cuối; link sang detail giữ.

### 3.3 API thay đổi

Website không tạo API. Tiêu thụ:

| Endpoint | Method | Loại | Dùng ở |
|---|---|---|---|
| `/api/tasks?requirementType=&keyword=` | GET | Sửa (additive) | `getTasks(params)` |
| `/api/tasks/{id}` | GET | Sửa (additive) | `getTaskDetail` |
| `/api/tasks/{id}/progress` | GET | Sửa (additive) | `getMyProgress` |
| `/api/tasks/{id}/progress/sync` | POST | Mới | `syncProgress` |
| `/api/tasks/my` | GET | Sửa (BREAKING) | `getMyTasks` -> `MyTaskItem[]` |

### 3.4 Data model thay đổi (TS)

```ts
export type GameTaskStatus = 'active' | 'closed'
export interface TaskStep { order: number; title: string; detail: string }
export interface GameTask {
  id: string; title: string; publisherName: string
  requirementType: TaskRequirementType
  requirementTargetValue: number; requirementHoursPerDay?: number | null; requirementItemNames: string[]
  requirementSummary: string
  description: string; steps: TaskStep[]
  rewardJcoin: number; slotLimit: number; slotUsed: number; slotsLeft: number
  publisherFundStatus: boolean; status: GameTaskStatus; endAt?: string | null
  gameAndroidUrl?: string | null; gameIosUrl?: string | null
  galleryImages?: string[]
  art?: MockTaskArt   // fallback ảnh khi galleryImages rỗng - giữ
}
export type UserTaskStatus = 'notRegistered' | 'inProgress' | 'completed'
export type TaskProgressEventSource = 'simulation' | 'publisher' | 'manualSync' | 'registration'
export interface TaskMilestone { value: number; label: string; reached: boolean; reachedAt?: string | null }
export interface TaskProgressEvent { at: string; value: number; delta: number; source: TaskProgressEventSource; note: string }
export interface UserTaskProgress {
  taskId: string; status: UserTaskStatus; currentValue: number; targetValue: number; percent: number
  isRegistered: boolean; isCompleted: boolean
  registrationCode?: string | null; registeredAt?: string | null; lastSyncedAt?: string | null; rewardClaimedAt?: string | null
  milestones: TaskMilestone[]; events: TaskProgressEvent[]
}
export interface MyTaskItem { task: GameTask; progress: UserTaskProgress }
```

Adapter int -> string: `STATUS_BY_INT = ['active','closed']`, `USER_STATUS_BY_INT = ['notRegistered','inProgress','completed']`, `SOURCE_BY_INT = ['simulation','publisher','manualSync','registration']` (cùng chỗ với `REQUIREMENT_TYPE_BY_INT` hiện có).

---

## 4. Trình tự thực hiện

1. **Types** - sửa `task.types.ts` theo 3.4. Skill: `api-service-conventions`, `quy-tac-code`.
2. **Service** - `TaskApiService.ts`: normalize task/progress, `getTasks` querystring, `getMyTasks` shape mới + guard shape cũ, `syncProgress`. Skill: `api-service-conventions`.
3. **Utils** - `formatRequirement.ts`: dùng field BE, xoá `getEarnedSoFar` (grep trước), thêm `getStepState`, `formatEventSource`. Skill: `quy-tac-code`.
4. **Hooks** - `useTaskMarketplace.page.fetchData.ts` (server-side + debounce), `useTaskDetail.page.fetchData.ts` (sync + cooldown + poll 15s + dừng khi hidden/completed), `useMyTasks.page.fetchData.ts` (shape mới + filter). Skill: `hook-conventions`.
5. **Components** - `TaskRequirementCard.tsx`, `TaskStepsList.tsx`, `TaskProgressPanel.tsx` (Tailwind class theo theme storefront hiện có, icon lucide). Skill: `cau-truc-du-an`, `quy-tac-code`.
6. **Pages** - `TaskDetailPage.tsx`, `TasksMarketplacePage.tsx`, `MyTasksPage.tsx` theo 3.2; giữ `data-qa` hiện có, thêm `data-qa='btn_dong_bo_ngay'`, `btn_xoa_bo_loc`, `tab_loc_trang_thai`. Skill: `quy-tac-code`.
7. **Kiểm tra** - `npx tsc -b` (grep `tasks`), mở `#/jgame/kiem-tien`, `#/jgame/kiem-tien/:id`, `#/jgame/kiem-tien/nhiem-vu-cua-toi` với Backend Development đã nâng cấp; xác nhận N+1 không còn (Network tab 1 request `/api/tasks/my`). Skill: `checklist-sau-code`, `dev-workflow`.
8. **Governance** - cập nhật `Website/.claude/business-rules/kiem-tien-jcoin.md`. Skill: `checklist-sau-code`.

---

## 5. Checklist sau khi code xong

### Code & Build
- [ ] `grep -rn "getEarnedSoFar" Website/src` = 0
- [ ] `getMyTasks` không còn `Promise.all` gọi `getMyProgress`
- [ ] Không còn nhãn yêu cầu cố định trong `formatRequirement.ts` ngoài fallback khi `requirementSummary` rỗng
- [ ] `npx tsc -b` - 0 lỗi mới liên quan `tasks`
- [ ] Kiểm tra thật 3 trang (bước 7)

### Hoàn thiện sau code
- [ ] Cập nhật `Website/.claude/business-rules/kiem-tien-jcoin.md`
- [ ] Đối chiếu App (`20260902-nc_nhiem-vu-app-ux.md`) - cùng câu `requirementSummary`, cùng thứ tự khối
- [ ] Commit theo quy ước Website

### Nếu phát sinh từ Bug / Inbox Task
- N/A.

---

## 6. Tham chiếu

- **Skills áp dụng (Website):** `api-service-conventions`, `hook-conventions`, `cau-truc-du-an`, `quy-tac-code`, `checklist-sau-code`, `dev-workflow`, `dong-bo-thiet-ke-mockdata` (quy trình sau khi Backend trả field mới).
- **Business rules:** `Website/.claude/business-rules/kiem-tien-jcoin.md`.
- **System rules:** `Website/.claude/system-architect/auth-va-phan-quyen.md` (CTA theo `isAuthenticated`), `routing-va-layout.md` (không đổi route).
- **Source pattern tham chiếu:** `features/Public/tasks/pages/TaskDetailPage.tsx` (khung 2 cột hiện có), `features/Public/accessories/pages/AccessoryDetailPage.tsx` (khối điểm nổi bật/chính sách/mô tả - pattern đã redesign kiểu Shopee), `features/Account/User/accessories/pages/AccessoryOrderTrackingPage.tsx` (timeline - tái dùng ý tưởng cho stepper/nhật ký).
- **Tài liệu Backend nguồn:** `Backend/JGameApi/Docs/Nang-cap/20260902-nc_nhiem-vu-mo-ta-tien-do.md` mục 3.4.
