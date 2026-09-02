/**
 * script.ts — Kịch bản nội dung (caption) của game 2D minh hoạ mô hình hợp tác
 * Cybergame. Tách riêng khỏi CybergameStoryScene để đội content chỉnh sửa câu chữ
 * mà không cần đụng vào code dựng cảnh/animation.
 */

export interface StoryCaption {
  /** Thời điểm hiện caption tính từ đầu Act (ms) */
  at: number
  text: string
}

export const ACT1_BENEFITS = {
  title: 'Lợi ích hợp tác',
  captions: [
    { at: 0, text: '14:00 — Giờ thấp điểm tại quán' },
    { at: 2600, text: 'Điện, nhân sự, mặt bằng vẫn tính phí dù máy trống...' },
    { at: 5600, text: '💰 Lợi ích 1 — Tăng doanh thu giờ thấp điểm: lấp đầy chỗ trống bằng khách JGame' },
    { at: 8200, text: 'Bán thêm gói/combo cho khách mới — tăng doanh thu mỗi giờ máy' },
    { at: 11000, text: '👥 Lợi ích 2 — Phát triển khách hàng mới từ cộng đồng gamer JGame' },
    { at: 14400, text: '🔔 Lợi ích 3 — Remarketing: gửi ưu đãi tới đúng cộng đồng đang có nhu cầu chơi game' },
  ] as StoryCaption[],
}

export const ACT2_INTEGRATION = {
  title: 'Luồng tích hợp hệ thống',
  outro: '3 giai đoạn diễn ra tự động — quán chỉ cần tập trung phục vụ khách',
  phase1: {
    title: 'Giai đoạn 1\nKết nối tài khoản',
    steps: [
      { icon: 'clipboard-list', label: 'Đăng ký', caption: 'Đăng ký tài khoản Đối tác Cybergame' },
      { icon: 'key-round', label: 'Mã liên kết', caption: 'Nhập mã liên kết để đồng bộ với JGame' },
      { icon: 'wrench', label: 'Khai báo giá', caption: 'Khai báo/Đồng bộ gói giá, combo của quán' },
    ],
  },
  phase2: {
    title: 'Giai đoạn 2\nVận hành song song',
    lanes: [
      { icon: 'monitor', label: 'Cybergame', caption: 'Cybergame đồng bộ realtime tình trạng sử dụng máy' },
      { icon: 'gamepad-2', label: 'Người chơi JGame', caption: 'Người chơi JGame order vé, đến chơi và mua thêm đồ ăn/nước uống' },
    ],
  },
  phase3: {
    title: 'Giai đoạn 3\nĐối soát',
    steps: [
      { icon: 'wallet', label: 'Đối soát', caption: 'Đối soát & thanh toán tiền cho Cybergame theo kỳ' },
    ],
  },
}

export const AFFILIATE_STORY = {
  title: 'Luồng hoa hồng Tiếp thị liên kết',
  captions: [
    { at: 0, text: 'Chia sẻ đường link giới thiệu JGame — không cần vốn, không cần kho hàng' },
    { at: 3400, text: 'Bạn bè bấm vào link — nạp thẻ, mua vé chơi game, mua phụ kiện' },
    { at: 7600, text: 'Mỗi giao dịch thành công — hoa hồng cộng dồn minh bạch, tự động' },
    { at: 11400, text: 'Theo dõi lượt click, đơn hàng, hoa hồng real-time trên Kênh đối tác' },
  ] as StoryCaption[],
}

export const GAMEDEV_STORY = {
  title: 'Luồng nhiệm vụ trải nghiệm game',
  captions: [
    { at: 0, text: 'Đăng nhiệm vụ trải nghiệm/test game lên JGame' },
    { at: 3600, text: 'Nhiệm vụ hiển thị trên "Chợ nhiệm vụ" cho hàng nghìn người chơi' },
    { at: 7600, text: 'Người chơi thật hoàn thành nhiệm vụ, để lại đánh giá thật' },
    { at: 11400, text: 'Trả JCoin theo kết quả — bạn nhận báo cáo phản hồi & dữ liệu thật' },
  ] as StoryCaption[],
}

export const ACT3_PLAYER_FLOWS = {
  title: 'Luồng người chơi tới cybergame',
  outro: 'Doanh thu quán tăng đều — dù khách đến từ hình thức nào',
  lanes: [
    {
      icon: 'gift',
      title: 'Săn vé 0 đồng',
      caption: 'Săn vé 0 đồng — trải nghiệm miễn phí, có cơ hội thành khách quen',
    },
    {
      icon: 'tag',
      title: 'Mua gói khuyến mãi',
      caption: 'Mua gói khuyến mãi của quán — khách trả tiền ngay, quán chủ động ưu đãi',
    },
    {
      icon: 'calendar',
      title: 'Đặt trước giờ chơi',
      caption: 'Đặt vé giữ chỗ trước — quán chủ động sắp xếp công suất',
    },
  ],
}
