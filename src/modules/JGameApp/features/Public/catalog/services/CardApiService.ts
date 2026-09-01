/**
 * CardApiService — Danh mục thẻ game (URD mục 18.1).
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, type ApiResponse } from '../../../../shared/services/api'
import type { CardDenomination, CardProduct, CardProductListParams, CardProductStatus } from '../types/card.types'

/**
 * BE (`JGameApi`) giữ chuẩn enum số nguyên (không dùng JsonStringEnumConverter — xem
 * `quyet-dinh-hop-nhat-api.md` mục "Enum — giữ nguyên chuẩn int"), trong khi Website luôn dùng
 * chuỗi ('active'/'game'...) — nên phải tự map số → chuỗi ở tầng service, không đổi UI.
 */
const CATEGORY_BY_INT: Record<number, CardProduct['category']> = { 0: 'game', 1: 'mobile', 2: 'international' }
const STATUS_BY_INT: Record<number, CardProductStatus> = { 0: 'active', 1: 'inactive' }
const DEFAULT_BRAND_ICON = 'Gamepad2'

function mapDenomination(raw: Omit<CardDenomination, 'status'> & { status: unknown }): CardDenomination {
  return { ...raw, status: STATUS_BY_INT[raw.status as number] ?? 'active' }
}

/** BE trả `brandColorFrom`/`brandColorTo`/`brandIcon` (hex không kèm #, tên icon) thay cho ảnh
 * minh hoạ không liên quan trước đây — build thành `art` để CardArt.tsx vẽ card thương hiệu. */
function mapProduct(
  raw: Omit<CardProduct, 'category' | 'status'> & { category: unknown; status: unknown; brandColorFrom?: string; brandColorTo?: string; brandIcon?: string }
): CardProduct {
  return {
    ...raw,
    category: CATEGORY_BY_INT[raw.category as number] ?? 'game',
    status: STATUS_BY_INT[raw.status as number] ?? 'active',
    denominations: (raw.denominations ?? []).map(d => mapDenomination(d as unknown as Omit<CardDenomination, 'status'> & { status: unknown })),
    art: raw.brandColorFrom
      ? { gradient: [`#${raw.brandColorFrom}`, `#${raw.brandColorTo ?? raw.brandColorFrom}`], icon: raw.brandIcon ?? DEFAULT_BRAND_ICON }
      : undefined,
  }
}

export class CardApiService {
  private static readonly BASE_PATH = '/api/card-products'

  static async getCardProducts(params?: CardProductListParams): Promise<ApiResponse<CardProduct[]>> {
    // Sentinel 'all' chỉ có ý nghĩa ở UI — BE nhận category dạng enum số (0-2), gửi thẳng
    // 'all' sẽ bị BE trả 400. Bỏ qua param khi giá trị là 'all'.
    const realParams: Record<string, unknown> = {}
    if (params?.keyword) realParams.keyword = params.keyword
    if (params?.category && params.category !== 'all') realParams.category = params.category
    const url = buildJGameUrlWithParams(this.BASE_PATH, realParams)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<CardProduct[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(mapProduct)
    return result
  }

  static async getCardProductDetail(productId: string): Promise<ApiResponse<CardProduct>> {
    const url = buildJGameUrl(`${this.BASE_PATH}/${productId}`)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<CardProduct> = await response.json()
    if (result.success && result.data) result.data = mapProduct(result.data)
    return result
  }
}
