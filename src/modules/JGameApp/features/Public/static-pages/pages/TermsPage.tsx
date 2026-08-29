/**
 * TermsPage — Điều khoản sử dụng (SC-23).
 */
export const PAGE_ID = 'jgame-terms'

const SECTIONS = [
  { title: '1. Phạm vi áp dụng', body: 'Điều khoản này áp dụng cho mọi giao dịch mua thẻ game, vé giờ chơi và phụ kiện gaming trên nền tảng JGame.' },
  { title: '2. Tài khoản người dùng', body: 'Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập của mình. JGame khuyến nghị bật xác thực 2 lớp để tăng cường bảo mật.' },
  { title: '3. Thanh toán & Giao mã thẻ', body: 'Mã thẻ được giao tự động ngay sau khi thanh toán thành công. Trường hợp NCC gián đoạn, JGame tự động hoàn tiền toàn bộ cho khách hàng.' },
  { title: '4. Chính sách đổi trả', body: 'Mã thẻ đã hiển thị không được đổi trả trừ trường hợp lỗi kỹ thuật xác nhận từ phía NCC. Phụ kiện vật lý được đổi trả trong 7 ngày nếu còn nguyên tem, chưa qua sử dụng.' },
  { title: '5. Chương trình Referral', body: 'Đối tác giới thiệu vi phạm (tự mua qua link của mình để trục lợi) sẽ bị khóa tài khoản và thu hồi hoa hồng đã ghi nhận.' },
  { title: '6. Giới hạn trách nhiệm', body: 'JGame không chịu trách nhiệm với thiệt hại phát sinh từ việc người dùng tự ý chia sẻ mã thẻ/tài khoản cho bên thứ ba.' },
]

export function TermsPage() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-16 sm:px-6'>
      <h1 className='mb-2 text-3xl font-extrabold text-white'>Điều khoản sử dụng</h1>
      <p className='mb-10 text-sm text-white/50'>Cập nhật lần cuối: 28/08/2026</p>
      <div className='space-y-6'>
        {SECTIONS.map(s => (
          <div key={s.title}>
            <h2 className='mb-1 text-base font-semibold text-white'>{s.title}</h2>
            <p className='text-sm leading-relaxed text-white/60'>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
