/**
 * Types cho Kho phụ kiện Gamer (Giai đoạn 3 — URD mục 8).
 */
import type { PaymentMethod } from '../../wallet/types/wallet.types'

export type AccessoryCategory = 'mouse' | 'keyboard' | 'headset' | 'gpu' | 'pc' | 'monitor' | 'chair'

export interface MockAccessoryArt {
  gradient: [string, string]
  icon: string
}

/** 1 dòng trong bảng "Thông số kỹ thuật" ở trang chi tiết (BE: `AccessorySpecItemResponse`). */
export interface AccessorySpecItem {
  label: string
  value: string
}

/** 1 đánh giá khách hàng ở mục "Đánh giá sản phẩm" (BE: `AccessoryReviewResponse`). */
export interface AccessoryReview {
  reviewerName: string
  /** 1–5 sao */
  rating: number
  comment: string
  createdAt: string
}

export interface AccessoryProduct {
  id: string
  /** Mã sản phẩm (SKU) — quản trị viên khai báo, hiển thị cho khách để tra cứu/đối chiếu */
  sku: string
  name: string
  category: AccessoryCategory
  /** Hãng sản xuất — dùng để lọc theo hãng (VD: Logitech, Razer, ASUS ROG...) */
  brand: string
  /** Tóm tắt 1 dòng — dùng cho card danh sách (khác `description` dài ở trang chi tiết) */
  specs: string
  price: number
  /** Giá gốc trước giảm — null nếu không đang giảm giá. Có giá trị và lớn hơn `price` thì hiển
   *  thị giá gạch ngang + % giảm (kiểu Shopee). */
  originalPrice?: number | null
  stockQuantity: number
  status: 'active' | 'inactive'
  /** Ảnh bìa (= galleryImages[0]) — ảnh thật từ kho ảnh miễn phí (Pexels), sưu tầm theo danh mục */
  imageUrl: string
  /** Bộ ảnh minh hoạ sản phẩm — hiển thị dạng thumbnail chọn ảnh ở trang chi tiết (kiểu Shopee) */
  galleryImages: string[]
  /** Điểm đánh giá trung bình (0–5) */
  rating: number
  /** Số lượt đánh giá */
  reviewCount: number
  /** Số lượng đã bán — hiển thị cạnh rating (kiểu "Đã bán 1,2k") */
  soldCount: number
  /** Số tháng bảo hành chính hãng — null nếu sản phẩm không có bảo hành */
  warrantyMonths?: number | null
  /** Mô tả dài dạng marketing — khác `specs` (tóm tắt 1 dòng cho card danh sách) */
  description?: string
  /** Điểm nổi bật dạng bullet — hiển thị ngay dưới tên sản phẩm ở trang chi tiết */
  highlights?: string[]
  /** Bảng thông số kỹ thuật dạng label/value — hiển thị dạng bảng (kiểu Shopee) */
  specifications?: AccessorySpecItem[]
  /** Đánh giá của khách hàng — mock, chưa có hệ thống review thật */
  reviews?: AccessoryReview[]
  /** Fallback khi ảnh lỗi/không tải được — gradient + icon. UI-only, BE thật không trả field này. */
  art?: MockAccessoryArt
}

export interface AccessoryListParams {
  keyword?: string
  category?: AccessoryCategory | 'all'
  brand?: string | 'all'
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface ShippingMethod {
  id: string
  name: string
  fee: number
  etaDays: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
}

export type AccessoryOrderStatus = 'PENDING' | 'PAID' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'

export interface AccessoryOrderItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
}

/** 1 mốc trong lịch sử trạng thái đơn — BE trả thêm field này (App có sẵn, Website chưa hiển thị UI). */
export interface AccessoryOrderTimelineEntry {
  status: AccessoryOrderStatus
  timestamp: string
  note: string
}

export interface AccessoryOrder {
  id: string
  userId: string
  items: AccessoryOrderItem[]
  shippingAddress: ShippingAddress
  shippingMethodId: string
  shippingFee: number
  itemsTotal: number
  totalAmount: number
  status: AccessoryOrderStatus
  trackingCode?: string
  /** Ngày giao dự kiến từ BE (GHTK thật hoặc ước tính theo phương thức giao) + ghi chú nguồn (20260902-nc_du-lieu-don-hang-va-webhook-nph.md B). */
  estimatedDeliveryAt?: string | null
  estimatedDeliveryNote?: string | null
  /** Chỉ có ở GET detail (BE) — null/undefined ở GET list. Tuỳ chọn hiển thị thêm, chưa bắt buộc dùng ở UI. */
  timeline?: AccessoryOrderTimelineEntry[]
  createdAt: string
  updatedAt: string
}

export interface CreateAccessoryOrderPayload {
  items: CartItem[]
  shippingAddress: ShippingAddress
  shippingMethodId: string
  /** Bắt buộc — ví VND hoặc JCoin dùng thanh toán đơn (nc_vi-2-loai-tien-thanh-toan.md). */
  paymentMethod: PaymentMethod
  /** Mã refer hiện có trong localStorage tại thời điểm đặt hàng — BE lưu vào chính đơn để trace,
   * kể cả khi không hợp lệ/không tính hoa hồng (20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 3.2). */
  referrerCode?: string
  referralLinkCode?: string
}
