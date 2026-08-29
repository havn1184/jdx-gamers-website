/**
 * AdminAccessoryFormPage — Sub-page Thêm/Sửa sản phẩm phụ kiện (tách riêng khỏi danh sách,
 * đủ chỗ cho bộ ảnh minh hoạ + đầy đủ thông tin, phong cách tối giản hoá từ Shopee Seller Center).
 */
import { Link } from 'react-router-dom'
import { ChevronLeft, Loader2, ImagePlus, Star, X, AlertCircle, Wand2 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAccessoryFormPage, ACCESSORY_CATEGORY_LABEL, type AccessoryCategoryAdmin } from '../hooks/useAccessoryForm.page'

export const PAGE_ID = 'jgame-admin-accessory-form'
export const PAGE_FEATURES = [
  { label: 'Thêm ảnh sản phẩm', code: 'btn-them-anh' },
  { label: 'Đặt ảnh bìa', code: 'btn-dat-anh-bia' },
  { label: 'Tự sinh mã sản phẩm', code: 'btn-tu-sinh-ma' },
  { label: 'Lưu sản phẩm', code: 'btn-luu' },
]

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
      <h2 className='text-sm font-semibold text-white'>{title}</h2>
      {description && <p className='mt-0.5 text-xs text-white/50'>{description}</p>}
      <div className='mt-4'>{children}</div>
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <label className='text-sm text-white/70'>{label} {required && <span className='text-red-400'>*</span>}</label>
      {children}
      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  )
}

export function AdminAccessoryFormPage() {
  const {
    isEdit, loading, notFound, formData, setFormData, errors, touched, handleBlur,
    submitting, serverError, serverErrorOpen, setServerErrorOpen, handleSubmit,
    brandSuggestions, suggestSku, newImageUrl, setNewImageUrl, addImageUrl, removeImage, setCoverImage,
  } = useAccessoryFormPage()

  if (loading) {
    return <AdminLayout><div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div></AdminLayout>
  }
  if (notFound) {
    return <AdminLayout><div className='py-24 text-center text-white/60'>Không tìm thấy sản phẩm</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <Link to='/jgame/quan-tri/phu-kien' className='mb-4 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white' data-qa='btn_quay_lai'>
        <ChevronLeft className='h-4 w-4' /> Phụ kiện Gamer
      </Link>
      <h1 className='mb-6 text-xl font-bold text-white'>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-3'>
        <div className='space-y-5 lg:col-span-2'>
          <SectionCard title='Hình ảnh sản phẩm' description='Ảnh đầu tiên là ảnh bìa — hiển thị ở danh sách và làm ảnh đại diện Kho phụ kiện.'>
            {formData.galleryImages.length === 0 ? (
              <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/20 py-10 text-white/40'>
                <ImagePlus className='h-8 w-8' />
                <p className='text-sm'>Chưa có ảnh nào — thêm ít nhất 1 ảnh bên dưới</p>
              </div>
            ) : (
              <div className='grid grid-cols-3 gap-3 sm:grid-cols-4'>
                {formData.galleryImages.map((img, idx) => (
                  <div key={img + idx} className='group relative aspect-square overflow-hidden rounded-xl border border-white/10'>
                    <img src={img} alt={`Ảnh ${idx + 1}`} className='h-full w-full object-cover' />
                    {idx === 0 && (
                      <span className='absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-semibold text-white'>
                        <Star className='h-2.5 w-2.5 fill-white' /> Ảnh bìa
                      </span>
                    )}
                    <div className='absolute inset-0 flex items-end justify-between gap-1 bg-black/0 p-1.5 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100'>
                      {idx !== 0 && (
                        <button type='button' className='rounded-md bg-white/90 px-1.5 py-1 text-[10px] font-medium text-black hover:bg-white' onClick={() => setCoverImage(idx)} data-qa={`btn_dat_anh_bia_${idx}`}>
                          Đặt làm bìa
                        </button>
                      )}
                      <button type='button' className='ml-auto rounded-full bg-red-500/90 p-1 text-white hover:bg-red-500' onClick={() => removeImage(idx)} data-qa={`btn_xoa_anh_${idx}`}>
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {touched.images && errors.images && <p className='mt-2 text-xs text-red-400'>{errors.images}</p>}

            <div className='mt-4 flex gap-2'>
              <Input
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); handleBlur('images') } }}
                placeholder='Dán URL ảnh sản phẩm rồi bấm Thêm'
                className='flex-1'
                data-qa='i_url_anh'
              />
              <Button variant='outline' className='flex-shrink-0 gap-1.5 border-white/20 bg-transparent text-white hover:bg-white/10' onClick={() => { addImageUrl(); handleBlur('images') }} data-qa='btn_them_anh'>
                <ImagePlus className='h-4 w-4' /> Thêm
              </Button>
            </div>
          </SectionCard>

          <SectionCard title='Thông tin cơ bản'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Field label='Mã sản phẩm (SKU)' required error={touched.sku ? errors.sku : null}>
                <div className='flex gap-2'>
                  <Input value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} onBlur={() => handleBlur('sku')} placeholder='VD: PK-MOUSE-LOGI-001' className={cn('flex-1', touched.sku && errors.sku && 'border-red-500')} data-qa='i_ma_san_pham' />
                  <Button type='button' variant='outline' size='icon' className='border-white/20 bg-transparent text-white hover:bg-white/10' title='Tự sinh mã' onClick={suggestSku} data-qa='btn_tu_sinh_ma'><Wand2 className='h-4 w-4' /></Button>
                </div>
              </Field>
              <Field label='Nhóm sản phẩm' required>
                <select
                  value={formData.category}
                  onChange={e => setFormData(p => ({ ...p, category: e.target.value as AccessoryCategoryAdmin }))}
                  aria-label='Chọn nhóm sản phẩm'
                  className='w-full rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
                  data-qa='sel_nhom_san_pham'
                >
                  {(Object.keys(ACCESSORY_CATEGORY_LABEL) as AccessoryCategoryAdmin[]).map(c => <option key={c} value={c}>{ACCESSORY_CATEGORY_LABEL[c]}</option>)}
                </select>
              </Field>
              <Field label='Tên sản phẩm' required error={touched.name ? errors.name : null}>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} onBlur={() => handleBlur('name')} placeholder='VD: Chuột Logitech G502 HERO' className={cn(touched.name && errors.name && 'border-red-500')} data-qa='i_ten_san_pham' />
              </Field>
              <Field label='Hãng sản xuất' required error={touched.brand ? errors.brand : null}>
                <Input
                  value={formData.brand}
                  onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
                  onBlur={() => handleBlur('brand')}
                  placeholder='VD: Logitech, Razer...'
                  className={cn(touched.brand && errors.brand && 'border-red-500')}
                  list='dl_hang_san_xuat'
                  data-qa='i_hang_san_xuat'
                />
                <datalist id='dl_hang_san_xuat'>
                  {brandSuggestions.map(b => <option key={b} value={b} />)}
                </datalist>
              </Field>
              <Field label='Thông số kỹ thuật'>
                <textarea
                  value={formData.specs}
                  onChange={e => setFormData(p => ({ ...p, specs: e.target.value }))}
                  rows={3}
                  className='w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none sm:col-span-2'
                  placeholder='VD: 25600 DPI · 11 nút · Hero Sensor · Có dây'
                  data-qa='i_thong_so'
                />
              </Field>
            </div>
          </SectionCard>
        </div>

        <div className='space-y-5'>
          <SectionCard title='Giá & Kho hàng'>
            <div className='space-y-4'>
              <Field label='Giá bán (VNĐ)' required error={touched.price ? errors.price : null}>
                <Input
                  type='text' inputMode='numeric'
                  value={formData.price || ''}
                  onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                  onBlur={() => handleBlur('price')}
                  placeholder='0'
                  className={cn(touched.price && errors.price && 'border-red-500')}
                  data-qa='i_gia_ban'
                />
              </Field>
              <Field label='Tồn kho'>
                <Input
                  type='text' inputMode='numeric'
                  value={formData.stockQuantity || ''}
                  onChange={e => setFormData(p => ({ ...p, stockQuantity: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                  placeholder='0'
                  data-qa='i_ton_kho'
                />
              </Field>
              <Field label='Trạng thái'>
                <select
                  value={formData.status}
                  onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'active' | 'inactive' }))}
                  aria-label='Chọn trạng thái'
                  className='w-full rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
                  data-qa='sel_trang_thai'
                >
                  <option value='active'>Đang bán</option>
                  <option value='inactive'>Ngừng bán</option>
                </select>
              </Field>
            </div>
          </SectionCard>

          {serverErrorOpen && (
            <div className='flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' /> {(serverError as { message?: string } | null)?.message || 'Có lỗi xảy ra'}
              <button type='button' className='ml-auto text-red-300/70 hover:text-red-200' onClick={() => setServerErrorOpen(false)}><X className='h-3.5 w-3.5' /></button>
            </div>
          )}

          <div className='flex gap-2'>
            <Button className='jgame-btn-primary flex-1 text-white' disabled={submitting} onClick={handleSubmit} data-qa='btn_luu'>
              {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Lưu sản phẩm
            </Button>
            <Link to='/jgame/quan-tri/phu-kien' className='flex-shrink-0'>
              <Button variant='ghost' className='text-white/70 hover:bg-white/10' data-qa='btn_huy'>Hủy</Button>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
