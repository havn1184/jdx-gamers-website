/**
 * useAccessoryForm.page — Logic trang Thêm/Sửa sản phẩm phụ kiện (sub-page riêng, không phải
 * form nhúng trong danh sách) — khai báo mã sản phẩm, nhóm sản phẩm, hãng sản xuất, bộ ảnh
 * minh hoạ và chi tiết giá/kho.
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { AccessoryCategoryAdmin, AccessoryFormPayload, EntityStatus } from '../../types/jgame.types'

const CATEGORY_PREFIX: Record<AccessoryCategoryAdmin, string> = {
  mouse: 'MOUSE', keyboard: 'KEYB', headset: 'HEAD', gpu: 'GPU', pc: 'PC', monitor: 'MON', chair: 'CHAIR',
}

function emptyForm(): AccessoryFormPayload {
  return { sku: '', name: '', category: 'mouse', brand: '', specs: '', price: 0, stockQuantity: 0, status: 'active', galleryImages: [] }
}

export function useAccessoryFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(productId)

  const [formData, setFormData] = useState<AccessoryFormPayload>(emptyForm)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<unknown>(null)
  const [serverErrorOpen, setServerErrorOpen] = useState(false)
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    void (async () => {
      const r = await JGameApiServiceAdmin.getAccessoryBrands()
      if (r.success && r.data) setBrandSuggestions(r.data)
    })()
  }, [])

  useEffect(() => {
    if (!productId) { setFormData(emptyForm()); setLoading(false); return }
    setLoading(true)
    void (async () => {
      const r = await JGameApiServiceAdmin.getAccessoryById(productId)
      if (r.success && r.data) {
        const p = r.data
        setFormData({ id: p.id, sku: p.sku, name: p.name, category: p.category, brand: p.brand, specs: p.specs, price: p.price, stockQuantity: p.stockQuantity, status: p.status, galleryImages: p.galleryImages })
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })()
  }, [productId])

  const errors = {
    name: touched.name && !formData.name.trim() ? 'Tên sản phẩm là bắt buộc' : null,
    sku: touched.sku && !formData.sku.trim() ? 'Mã sản phẩm là bắt buộc' : null,
    brand: touched.brand && !formData.brand.trim() ? 'Hãng sản xuất là bắt buộc' : null,
    price: touched.price && formData.price <= 0 ? 'Giá bán phải lớn hơn 0' : null,
    images: touched.images && formData.galleryImages.length === 0 ? 'Cần ít nhất 1 ảnh minh hoạ' : null,
  }

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const suggestSku = useCallback(() => {
    const prefix = CATEGORY_PREFIX[formData.category]
    const brandPart = formData.brand.trim().slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GEN'
    setFormData(p => ({ ...p, sku: `PK-${prefix}-${brandPart}-${Date.now().toString().slice(-4)}` }))
  }, [formData.category, formData.brand])

  const addImageUrl = useCallback(() => {
    const url = newImageUrl.trim()
    if (!url) return
    setFormData(p => ({ ...p, galleryImages: [...p.galleryImages, url] }))
    setNewImageUrl('')
  }, [newImageUrl])

  const removeImage = useCallback((idx: number) => {
    setFormData(p => ({ ...p, galleryImages: p.galleryImages.filter((_, i) => i !== idx) }))
  }, [])

  const setCoverImage = useCallback((idx: number) => {
    setFormData(p => {
      const images = [...p.galleryImages]
      const [picked] = images.splice(idx, 1)
      images.unshift(picked)
      return { ...p, galleryImages: images }
    })
  }, [])

  const handleSubmit = async () => {
    setTouched({ name: true, sku: true, brand: true, price: true, images: true })
    if (!formData.name.trim() || !formData.sku.trim() || !formData.brand.trim() || formData.price <= 0 || formData.galleryImages.length === 0) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc')
      return
    }
    setSubmitting(true)
    try {
      const r = formData.id
        ? await JGameApiServiceAdmin.updateAccessory(formData)
        : await JGameApiServiceAdmin.createAccessory(formData)
      if (r.success) {
        toast.success(formData.id ? 'Cập nhật thành công' : 'Tạo mới thành công')
        navigate('/jgame/quan-tri/phu-kien')
      } else {
        setServerError(r)
        setServerErrorOpen(true)
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    isEdit, loading, notFound,
    formData, setFormData, errors, touched, handleBlur,
    submitting, serverError, serverErrorOpen, setServerErrorOpen, handleSubmit,
    brandSuggestions, suggestSku,
    newImageUrl, setNewImageUrl, addImageUrl, removeImage, setCoverImage,
  }
}

export const ACCESSORY_CATEGORY_LABEL: Record<AccessoryCategoryAdmin, string> = {
  mouse: 'Chuột', keyboard: 'Bàn phím', headset: 'Tai nghe', gpu: 'Card đồ họa', pc: 'PC Gaming', monitor: 'Màn hình', chair: 'Ghế',
}

export type { AccessoryCategoryAdmin, EntityStatus }
