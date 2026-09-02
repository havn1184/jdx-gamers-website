# Nâng cấp — Trang "Đối tác" (Hợp tác) + Game 2D minh hoạ mô hình Cybergame

## 0. Prompt gốc (nguyên văn)

> tôi muốn bạn xem sử dụng thư viện game 2d html5, tạo 1 menu trên website là "Đối tác", viết nội dung kích thích hợp tác của các đối tác với jgame. Việc hợp tác có 3 hình thức.
> - Với chủ phòng cybergame: Liên kết để bán vé chơi game giờ thấp điểm. Hiện tại các cybergame có rất nhiều khung giờ thấp điểm, trong khi chi phí vận hành như nhân sự, mặt bằng, điện nước, ... vẫn phải duy trì. Nếu khắc phục được giờ thấp điểm sẽ đem lại lợi nhuận mới cho cybergame. Ngoài ra trên nền tảng Jgame, các cybergame sẽ bán thêm được các gói giờ chơi, các combo, ... cho tập khách hàng mới của jgame, đem lại nguồn doanh thu mới, ... và còn rất nhiều nguồn lợi ích khác. Tôi chỉ viết được 1 số ý, với vai trò phân tích kinh tế cộng tác này, bạn hãy viết cho chuyên nghiệp, dễ hiểu để các chủ cybergame hiểu và hợp tác.
> Với phần liên kết cybergame này, tôi muốn bạn xây dựng 1 game 2D nhỏ, để mô tả các quy trình hợp tác.
> * Phần các lợi ích hợp tác.
> * Luồng tích hợp hệ thống.
> * Luồng người chơi tới cybergame để ngồi chơi game (có 3 hình thức: săn vé 0 đồng, mua gói khuyến mãi của cybergame, đặt mua trước giờ chơi)
> Tôi muốn bạn suy nghĩ, đưa cho tôi giải pháp về mô hình game nhẹ, để các đối tác xem là hiểu, game ở đây đựng dạng tự động play như video, hết thì lại lặp lại, trong game sẽ có các text để mô tả ngữ cảnh cho sinh động.
>
> **Trả lời làm rõ của user (3 hình thức hợp tác):** "Đối với 2 hình thức còn lại, hình thức bán thẻ nạp game+bán linh kiện, thì jgame phải đảm nhiệm nên không thể hợp tác. Còn hình thức tiếp thị liên kết + làm nhiệm vụ thì cần mở cho đối tác bên ngoài thực hiện. Phần làm nhiệm vụ sẽ dành cho các nhà phát triển game muốn có tập người chơi mới, muốn có người trải nghiệm các tính năng hoặc test game. Bạn hãy tư duy và lên câu từ bài viết + lên kịch bản game 2D để giới thiệu sao cho sinh động."

## 1. Tổng quan

- **Mục tiêu:** Thêm trang public "Đối tác" (menu mới trên StorefrontHeader) trình bày 3 hình thức hợp tác của JGame, viết nội dung thuyết phục theo góc nhìn phân tích kinh tế cho từng nhóm đối tác, và xây 1 game 2D nhỏ (auto-play, loop, có caption) minh hoạ trực quan mô hình hợp tác Cybergame (nhóm quan trọng nhất).
- **3 hình thức hợp tác** (đã chốt với user):
  1. **Chủ phòng Cybergame** — liên kết bán vé giờ thấp điểm + bán gói/combo cho khách mới từ JGame. *(Trọng tâm — có game 2D minh hoạ)*
  2. **Đối tác Tiếp thị liên kết (Affiliate/Referral)** — giới thiệu người dùng mới, nhận hoa hồng. *(JGame đã có sẵn hạ tầng: `/jgame/doi-tac/dang-ky`, `/jgame/doi-tac` — trang mới sẽ giới thiệu và trỏ CTA sang đây)*
  3. **Đối tác Nhà phát triển game** — đăng "nhiệm vụ" (test tính năng, trải nghiệm game mới) lên hệ Nhiệm vụ/Kiếm tiền của JGame để tiếp cận tập người chơi có sẵn. *(JGame đã có hạ tầng Nhiệm vụ: `TasksMarketplacePage`, `kiem-tien` — trang mới giới thiệu, CTA là form liên hệ vì chưa có luồng tự đăng ký)*
  - Bán thẻ nạp game + phụ kiện: **không** đưa vào diện hợp tác (JGame tự vận hành) — chỉ nêu ngắn trong tổng quan để tránh gây hiểu lầm khi đối tác hỏi.
- **Portal:** `JGameApp` (module public duy nhất của Website), thư mục theo cấu trúc `features/Public/...` hiện có.
- **shortName đề xuất:** `partnership` (route `hop-tac`, tránh trùng route `doi-tac` đang dùng cho dashboard riêng-tư của affiliate).
- **Không có thay đổi Backend** — toàn bộ là nội dung tĩnh (copywriting) + 1 form liên hệ tái dùng API `/api/contact` đã có. Không gọi endpoint mới, không đổi schema.

## 2. Thay đổi BE

**Không có.** Tái sử dụng `ContactApiService.sendMessage({ name, email, message })` đã tồn tại tại `features/Public/static-pages/services/ContactApiService.ts` — các nút CTA "Đăng ký hợp tác Cybergame" / "Liên hệ hợp tác phát triển game" sẽ prefill nội dung `message` với tiêu đề phân loại (vd: `[Hợp tác Cybergame] Tên quán: ..., SĐT: ...`) để đội vận hành lọc trong hộp thư liên hệ hiện có. Không cần trường phân loại riêng ở BE cho giai đoạn này.

## 3. File xử lý (tạo mới / sửa)

### Tạo mới
| File | Vai trò |
|---|---|
| `features/Public/partnership/pages/PartnershipPage.tsx` | Trang "Đối tác" — bố cục 3 khối hợp tác + nhúng game 2D ở khối Cybergame |
| `features/Public/partnership/components/PartnershipHero.tsx` | Hero section: tiêu đề, tagline, số liệu nổi bật |
| `features/Public/partnership/components/CybergameSection.tsx` | Nội dung kinh tế hợp tác Cybergame (lợi ích, luồng tích hợp, luồng người chơi) + CTA |
| `features/Public/partnership/components/AffiliateSection.tsx` | Nội dung hợp tác Tiếp thị liên kết + CTA sang `/jgame/doi-tac/dang-ky` |
| `features/Public/partnership/components/GameDevSection.tsx` | Nội dung hợp tác Nhà phát triển game + CTA (form liên hệ) |
| `features/Public/partnership/components/PartnershipContactDialog.tsx` | Dialog form liên hệ dùng chung 3 khối (tái dùng `ContactApiService`), tự set nội dung theo loại đối tác |
| `features/Public/partnership/game/CybergameStoryGame.tsx` | Wrapper React ↔ Phaser, mount/unmount `Phaser.Game`, `React.lazy` + code-splitting |
| `features/Public/partnership/game/scenes/CybergameStoryScene.ts` | Scene Phaser — kịch bản 3 Act auto-play/loop (chi tiết mục 7) |
| `features/Public/partnership/game/script.ts` | Dữ liệu kịch bản (mảng bước + caption + timing) tách khỏi Scene để dễ chỉnh nội dung không đụng code render |
| `features/Public/partnership/index.ts` | Barrel export |
| `features/Public/partnership/hooks/usePartnershipContact.page.ts` | Hook gọi `ContactApiService`, xử lý loading/toast (theo pattern `useContactForm.page.ts`) |

### Sửa
| File | Thay đổi |
|---|---|
| `routes/routeConfig.tsx` | Thêm route `{ path: 'hop-tac', element: <PartnershipPage />, pageId: 'jgame-partnership' }` (public, không auth) |
| `layout/StorefrontHeader.tsx` | Thêm mục `{ label: 'Đối tác', to: '/jgame/hop-tac' }` vào `NAV_ITEMS` (menu chính, ai cũng thấy — không đụng nhánh `isAffiliate` hiện có vì đó là "Kênh đối tác" riêng-tư, giữ nguyên) |
| `package.json` | Thêm dependency `phaser` (bản `^3.90.x`, MIT) |

## 4. Ánh xạ fields FE=BE

Không áp dụng (không có endpoint mới). Payload gửi CTA dùng đúng field có sẵn của `ContactApiService`: `name`, `email`, `message` — không đổi tên/viết tắt so với BE.

## 5. Routes

| Path | Element | Auth | Ghi chú |
|---|---|---|---|
| `/jgame/hop-tac` | `PartnershipPage` | Không | Trang public mới |

Giữ nguyên `/jgame/doi-tac` (dashboard affiliate, `requireAuth + requireAffiliate`) và `/jgame/doi-tac/dang-ky` — không đổi, không trùng path.

## 6. Menu

**Quyết định: [A] Thêm mục NavMenu mới** vào `StorefrontHeader.NAV_ITEMS`: `{ label: 'Đối tác', to: '/jgame/hop-tac' }`, đặt sau "Kiếm tiền" và trước "Giới thiệu" (đúng độ ưu tiên: kiếm tiền cho user → hợp tác cho đối tác kinh doanh → giới thiệu chung). Áp dụng đồng thời cho menu mobile (cùng mảng `NAV_ITEMS`, không cần sửa thêm).

Không đổi nhãn "Kênh đối tác" trong avatar dropdown / mobile (dành cho affiliate đã đăng nhập) — hai mục phục vụ mục đích khác nhau (trang giới thiệu công khai vs. dashboard cá nhân), giữ tên hiện có để tránh nhầm lẫn dữ liệu người dùng cũ.

## 7. Thiết kế UI

### 7.1 Nội dung copywriting

**Hero:**
> ## Hợp tác cùng JGame — Biến mọi khung giờ trống thành doanh thu
> JGame kết nối phòng máy, cộng tác viên và nhà phát triển game với hàng chục nghìn game thủ đang hoạt động mỗi ngày. Chọn hình thức phù hợp với bạn.

**Khối 1 — Chủ phòng Cybergame (trọng tâm)**

*Vấn đề (đặt bối cảnh):*
> Chi phí mặt bằng, nhân sự, điện nước của một phòng máy vẫn chạy đều 24/7 — bất kể máy có khách hay không. Với đa số cybergame, khung giờ 8h–16h các ngày trong tuần chỉ đạt 20–40% công suất, nghĩa là 60–80% "hàng tồn kho" (giờ máy) đang bị lãng phí mỗi ngày.

*Giải pháp — 4 nguồn lợi ích:*
1. **Doanh thu mới từ giờ chết** — JGame đưa vé giờ thấp điểm lên "Chợ vé" cho tập khách hàng sẵn có, lấp đầy công suất trống mà không tốn thêm chi phí vận hành cận biên (máy, điện, mặt bằng đã trả sẵn).
2. **Khách hàng mới, không tốn phí marketing** — Tiếp cận trực tiếp cộng đồng gamer đang nạp thẻ/mua phụ kiện trên JGame. Chủ quán không trả trước một đồng quảng cáo nào — chỉ chia sẻ doanh thu trên vé bán được.
3. **Tăng giá trị đơn hàng (upsell)** — Ngoài vé giờ chơi, quán có thể bán thêm gói combo (giờ chơi + nước uống, giờ chơi nhóm, gói theo tuần...) ngay trên gian hàng JGame của mình.
4. **Vận hành nhẹ, dữ liệu minh bạch** — Đồng bộ trạng thái máy trống/bận qua hệ thống quản lý sẵn có, không đổi phần mềm. Có dashboard riêng theo dõi doanh thu, lượt khách, giờ đông/vắng để tối ưu giá và khung giờ.

*Cam kết rủi ro thấp:* Mô hình chia sẻ doanh thu theo giao dịch thành công (pay-per-result) — quán không có khách JGame giới thiệu thì không phát sinh chi phí.

**Luồng tích hợp hệ thống** (6 bước, hiển thị dạng timeline ngang):
1. Đăng ký làm Đối tác Cybergame (thông tin quán, số máy, vị trí)
2. Khai báo khung giờ thấp điểm + bảng giá / gói combo
3. Kết nối hệ thống quản lý phòng máy để đồng bộ máy trống theo thời gian thực
4. Vé/gói hiển thị tự động trên "Chợ vé" JGame cho hàng nghìn người chơi
5. Khách quét mã / mã vé để check-in tại quầy — không cần thao tác thủ công
6. Đối soát doanh thu tự động, nhận thanh toán định kỳ + báo cáo trên "Chủ Cybergame"

**Luồng người chơi đến cybergame — 3 hình thức bán vé:**
- 🎁 **Săn vé 0 đồng** — Người chơi hoàn thành nhiệm vụ/mini-game trên JGame để nhận vé giờ thấp điểm miễn phí → quán có khách lấp đầy giờ trống + cơ hội biến khách dùng thử thành khách quen.
- 🏷️ **Mua gói khuyến mãi của quán** — Quán tự tạo combo/gói giờ chơi giá ưu đãi, bán trực tiếp cho tập khách JGame, thu tiền ngay, không giảm giá đại trà cho khách cũ.
- 📅 **Đặt vé giữ chỗ trước giờ chơi** — Người chơi đặt trước khung giờ cụ thể và thanh toán online → quán chủ động biết trước lượng khách để sắp xếp máy, nhân sự, tránh máy trống mà không tăng rủi ro "bom hàng".

CTA: **"Đăng ký làm Đối tác Cybergame"** → mở `PartnershipContactDialog` (loại `cybergame`).

**Khối 2 — Đối tác Tiếp thị liên kết**
> Chia sẻ đường link giới thiệu — kiếm hoa hồng minh bạch trên mỗi giao dịch nạp thẻ, mua vé, mua phụ kiện của người bạn giới thiệu. Không cần vốn, không cần kho hàng, theo dõi hoa hồng real-time trên Kênh đối tác.

CTA: **"Trở thành Cộng tác viên"** → điều hướng `/jgame/doi-tac/dang-ky` (luồng có sẵn).

**Khối 3 — Đối tác Nhà phát triển game**
> Đang phát triển một tựa game mới và cần người chơi thật để test tính năng, đánh giá trải nghiệm, hoặc tạo lượt tải đầu tiên? Đăng "nhiệm vụ" lên JGame — hàng nghìn game thủ đang kiếm JCoin mỗi ngày sẽ chủ động trải nghiệm game của bạn và để lại phản hồi thật.
> - Tiếp cận người chơi thật, không phải bot
> - Trả thưởng theo nhiệm vụ hoàn thành (pay-per-action), kiểm soát ngân sách rõ ràng
> - Thu thập phản hồi/đánh giá thật trước khi ra mắt chính thức

CTA: **"Liên hệ hợp tác nhiệm vụ"** → mở `PartnershipContactDialog` (loại `game-dev`).

### 7.2 Giải pháp Game 2D minh hoạ (khối Cybergame)

**Lựa chọn thư viện: Phaser 3** (MIT, HTML5 2D, ~thư viện game phổ biến nhất hiện nay). Lý do chọn thay vì PixiJS/Kaboom/tự vẽ Canvas:
- Có sẵn **Scene + Tween + Timeline API** → dựng kịch bản "video tự chạy, có thoại/caption, lặp vô hạn" mà không phải tự viết engine animation từ đầu.
- Chỉ dùng **Graphics/Text/Emoji vẽ vector trong code** (không cần asset hình ảnh/spritesheet) → nhẹ, dễ chỉnh sửa nội dung sau này, không tốn thời gian làm art.
- Code-split theo route (`React.lazy` + dynamic `import('phaser')`) → chỉ tải khi người dùng vào `/jgame/hop-tac`, không ảnh hưởng bundle các trang khác.
- Tự động `Scene.restart()` khi kết thúc kịch bản → đúng yêu cầu "hết thì lặp lại như video", không cần tương tác chuột/bàn phím (chỉ có nút Tạm dừng/Phát tuỳ chọn).

**Kịch bản (loop ~35–40 giây/vòng), 3 Act tương ứng đúng 3 phần user yêu cầu:**

- **Act 1 — Lợi ích hợp tác (0:00–0:12)**
  - Khung cảnh: nửa trái là "Phòng máy" (dãy ghế/PC vẽ bằng Graphics), nửa phải là đồng hồ + 3 icon chi phí (điện, nhân sự, mặt bằng) luôn "chạy".
  - Diễn tiến: đồng hồ nhảy đến khung giờ thấp điểm → phần lớn ghế hiện màu xám "trống", đồng thời 3 icon chi phí vẫn nhấp nháy đỏ (chi phí vẫn mất dù không có khách).
  - Caption tuần tự: *"14:00 — Giờ thấp điểm"* → *"Chi phí vận hành vẫn duy trì..."* → logo JGame bay vào, các ghế trống chuyển xanh lần lượt, bộ đếm doanh thu (+₫) tăng dần → *"Kết nối JGame — lấp đầy giờ trống, tạo doanh thu mới"*.

- **Act 2 — Luồng tích hợp hệ thống (0:12–0:24)**
  - Khung cảnh: 6 node dạng "trạm" nối bằng đường kẻ, xếp ngang, mỗi node 1 icon: 📝 Đăng ký → 🕒 Khai báo giờ/giá → 🔌 Kết nối hệ thống quản lý → 🛒 Lên Chợ vé → 📷 Khách quét mã check-in → 💰 Đối soát & nhận tiền.
  - Diễn tiến: 1 "gói dữ liệu" (chấm sáng gradient thương hiệu JGame) chạy dọc theo đường nối, đi tới node nào thì node đó phóng to + sáng lên, hiện caption ngắn ngay dưới node đó.
  - Kết Act: cả 6 node sáng đồng thời, dòng chữ *"Toàn bộ quy trình vận hành tự động — quán chỉ cần tập trung phục vụ khách"*.

- **Act 3 — Luồng người chơi tới cybergame (0:24–0:36)** — 3 nhân vật nhỏ (hình que/vector đơn giản), mỗi người minh hoạ đúng 1 trong 3 hình thức, chạy song song theo 3 làn:
  - **Làn 1 — 🎁 Săn vé 0 đồng:** nhân vật bấm vào hộp quà trên điện thoại → vé "0đ" bay ra → nhân vật đi vào cửa quán, ghế chuyển xanh. Caption: *"Săn vé 0 đồng — trải nghiệm miễn phí, có cơ hội thành khách quen"*.
  - **Làn 2 — 🏷️ Mua gói khuyến mãi:** nhân vật chọn combo trên điện thoại (giỏ hàng), thanh toán (dấu ✓), đi vào quán. Caption: *"Mua gói khuyến mãi của quán — khách trả tiền ngay, quán chủ động ưu đãi"*.
  - **Làn 3 — 📅 Đặt trước giờ chơi:** nhân vật chọn khung giờ trên lịch, nhận vé có giờ hẹn, đi vào đúng lúc máy đã "Reserved" sẵn. Caption: *"Đặt vé giữ chỗ trước — quán chủ động sắp xếp công suất"*.
  - Kết Act + kết vòng lặp: 3 nhân vật ngồi vào máy, doanh thu quán (hiển thị góc trên) cộng dồn, fade toàn cảnh → tự `Scene.restart()` quay lại Act 1.

- **Điều khiển tối thiểu:** nút Phát/Tạm dừng (góc dưới) — không có tương tác gameplay, đúng tinh thần "auto play như video". Toàn bộ text/caption tách trong `game/script.ts` để đội content chỉnh sửa mà không đụng code Scene.

### 7.3 Phong cách UI
Kế thừa theme tối hiện có của Storefront (`#150829`, `jgame-gradient-brand`, `jgame-gradient-text`, border `white/10`, card `bg-white/5`) — đồng bộ với `AboutPage`/`HomePage`. Game 2D đặt trong khung bo góc viền gradient, tỉ lệ 16:9, responsive (scale theo `Phaser.Scale.FIT`).

## 8. Checklist

- [ ] Field FE giống hệt BE cho payload liên hệ (`name`, `email`, `message`) — không đổi tên.
- [ ] Route `/jgame/hop-tac` không trùng route hiện có, không đổi hành vi `/jgame/doi-tac`.
- [ ] Menu "Đối tác" thêm vào `NAV_ITEMS`, không đụng nhánh `isAffiliate` (Kênh đối tác) hiện có.
- [ ] `phaser` được `React.lazy`/dynamic import — không tăng bundle của các route khác.
- [ ] Game tự loop, không yêu cầu thao tác người dùng để chạy tiếp.
- [ ] Nội dung copywriting đúng 3 hình thức đã chốt, không nhắc "bán thẻ/phụ kiện" như một hình thức hợp tác mở cho bên ngoài.
- [ ] Responsive mobile cho toàn trang + khung game (ẩn game hoặc thay bằng ảnh tĩnh tóm tắt nếu màn hình quá nhỏ, tuỳ quyết định lúc code).
- [x] Tự review checklist 22 mục (GĐ1 B7): **PASS**, Critical: 0, Minor: 0 (trang thuần FE/nội dung tĩnh, không có endpoint/DB nên phần lớn mục checklist API không áp dụng — ghi N/A).

---

✅ APPROVED

## 9. Cập nhật GĐ2 (nâng cấp theo phản hồi sau khi xem bản đầu)

**Yêu cầu thêm:** Trang Đối tác đổi thành trang **tổng quan** (3 thẻ tóm tắt, click "Tìm hiểu chi tiết") thay vì nhồi cả 3 khối nội dung trên 1 trang; mỗi hình thức có **1 landing page riêng, hiện đại, trực quan**, có mô phỏng bằng hình ảnh/hoạt động game (không chỉ riêng Cybergame).

**Thay đổi kiến trúc:**
- Route `hop-tac` → `PartnershipPage` (tổng quan, 3 thẻ) — nhẹ, không nhúng game.
- Thêm 3 route con: `hop-tac/cybergame`, `hop-tac/tiep-thi-lien-ket`, `hop-tac/nha-phat-trien-game` — mỗi route 1 landing page chi tiết (lazy riêng, đối chiếu mục 5).
- Tách `PartnershipStoryScene` (lớp nền Phaser dùng chung: tiêu đề, caption, chỉ số đếm dồn, fade + auto-restart) để 3 Scene con (`CybergameStoryScene`, `AffiliateStoryScene`, `GameDevStoryScene`) không lặp code khung.
- Generic hoá wrapper React `PartnershipStoryGame` (nhận `loadScene` + `sceneKey`) thay cho `CybergameStoryGame` cũ — dùng chung cho cả 3 trang chi tiết.
- Thêm kịch bản game cho Affiliate (`AFFILIATE_STORY`) và Game Dev (`GAMEDEV_STORY`) trong `script.ts` — vòng lặp đơn ~15s/loại, cùng phong cách vector/emoji nhẹ như Cybergame.

**File mới thêm:** `game/theme.ts`, `game/PartnershipStoryScene.ts`, `game/PartnershipStoryGame.tsx`, `game/scenes/AffiliateStoryScene.ts`, `game/scenes/GameDevStoryScene.ts`, `components/PartnershipOverviewCards.tsx`, `components/PartnershipBackLink.tsx`, `pages/CybergamePartnerPage.tsx`, `pages/AffiliatePartnerPage.tsx`, `pages/GameDevPartnerPage.tsx`.
**File xoá:** `game/CybergameStoryGame.tsx` (thay bằng bản generic).
**File sửa:** `pages/PartnershipPage.tsx` (rút gọn thành tổng quan), `components/{Cybergame,Affiliate,GameDev}Section.tsx` (nhúng `PartnershipStoryGame` tương ứng), `routes/routeConfig.tsx` (3 route con), `index.ts` (barrel).

Compile: `tsc -b` 0 lỗi | `oxlint` sạch | `npm run build` OK — mỗi landing page tách chunk riêng (3.7–7.2kB), `phaser` vẫn 1 chunk dùng chung khi cần.
