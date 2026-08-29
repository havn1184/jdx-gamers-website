/**
 * PrivacyPolicyPage — Chính sách bảo mật (SC-24).
 */
export const PAGE_ID = 'jgame-privacy-policy'

const SECTIONS = [
  { title: '1. Dữ liệu thu thập', body: 'JGame thu thập email, số điện thoại, lịch sử giao dịch để phục vụ xác thực tài khoản và xử lý đơn hàng.' },
  { title: '2. Bảo mật mã thẻ', body: 'Mã thẻ (serial/pin) được mã hoá khi lưu trữ, chỉ hiển thị đầy đủ cho đúng chủ sở hữu giao dịch và ẩn một phần khi xem lại trong lịch sử.' },
  { title: '3. Không lưu thông tin thanh toán', body: 'JGame không lưu trữ thông tin thẻ ngân hàng — mọi giao dịch thanh toán QR được xử lý qua cổng jPay.' },
  { title: '4. Chia sẻ dữ liệu với đối tác Referral', body: 'Đối tác Referral chỉ xem được mã đơn hàng đã ẩn định danh khách hàng, không truy cập được thông tin cá nhân đầy đủ.' },
  { title: '5. Quyền của người dùng', body: 'Người dùng có quyền yêu cầu chỉnh sửa hoặc xoá dữ liệu cá nhân bằng cách liên hệ support@jgame.vn.' },
]

export function PrivacyPolicyPage() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-16 sm:px-6'>
      <h1 className='mb-2 text-3xl font-extrabold text-white'>Chính sách bảo mật</h1>
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
