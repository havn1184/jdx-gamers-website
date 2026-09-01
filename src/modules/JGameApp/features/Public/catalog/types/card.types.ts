/**
 * Types cho danh mục thẻ game (CardProduct/CardDenomination) — theo URD mục 19.
 * Field FE dùng camelCase, giữ nguyên ý nghĩa gợi ý snake_case trong URD (BE thật chưa có).
 */

export type CardProductStatus = 'active' | 'inactive'

/** Ảnh mock cho 1 loại thẻ — gradient CSS + icon, không dùng logo thương hiệu thật. */
export interface MockCardArt {
  /** 2 màu gradient (from → to), dạng hex */
  gradient: [string, string]
  /** Tên icon lucide-react (VD: 'Gamepad2', 'Smartphone', 'ShoppingBag') */
  icon: string
}

export interface CardDenomination {
  id: string
  productId: string
  /** Mệnh giá danh nghĩa (VNĐ) */
  faceValue: number
  /** Giá bán thực tế (có thể khác mệnh giá do chiết khấu/phụ phí) */
  sellPrice: number
  supplierSku: string
  /** Số lượng tồn khả dụng (mock — NCC thật có thể không hỗ trợ tra cứu) */
  stockQuantity: number | null
  status: CardProductStatus
}

export interface CardProduct {
  id: string
  name: string
  /** Danh mục hiển thị: 'game' | 'mobile' | 'international' */
  category: 'game' | 'mobile' | 'international'
  /** Tên NCC hiển thị (VD: Garena, Viettel, Google Play...) */
  supplierName: string
  description: string
  /** Điều khoản sử dụng / chính sách đổi trả riêng theo loại thẻ (FR-6.7.2) */
  policyText: string
  status: CardProductStatus
  /** `art` build từ BrandColorFrom/BrandColorTo/BrandIcon của BE (CardApiService.mapProduct) —
   * card thương hiệu nền trắng + khối màu, thay ảnh minh hoạ không liên quan trước đây. */
  art?: MockCardArt
  /** Logo thật của NCC — BE hiện luôn trả null (chưa sourcing logo thật), `art` là hiển thị chính. */
  imageUrl?: string
  denominations: CardDenomination[]
}

export interface CardProductListParams {
  keyword?: string
  category?: CardProduct['category'] | 'all'
}
