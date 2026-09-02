/**
 * ShopRegisterPage — Đăng ký gian hàng cybergame (SC-P2-S1). Đã có gian hàng → tự chuyển sang dashboard.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Store, AlertCircle } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { useMyShop } from '../hooks/useMyShop'
import { useShopRegister } from '../hooks/useShopRegister.page'

export const PAGE_ID = 'jgame-shop-register'
export const PAGE_FEATURES = [{ label: 'Đăng ký gian hàng', code: 'btn-dang-ky-gian-hang' }]

export function ShopRegisterPage() {
  const navigate = useNavigate()
  const { shop, loading: loadingShop } = useMyShop()
  const { name, setName, city, setCity, address, setAddress, description, setDescription, isValid, submitting, errorMessage, handleSubmit } = useShopRegister()

  useEffect(() => {
    if (!loadingShop && shop) navigate('/jgame/chu-cybergame', { replace: true })
  }, [loadingShop, shop, navigate])

  if (loadingShop) return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang kiểm tra gian hàng...</div>

  return (
    <div className='mx-auto max-w-lg px-4 py-12 sm:px-6'>
      <div className='mb-6 text-center'>
        <span className='jgame-gradient-brand mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white'><Store className='h-7 w-7' /></span>
        <h1 className='text-xl font-bold text-white'>Đăng ký gian hàng cybergame</h1>
        <p className='mt-1 text-sm text-white/60'>Mở gian hàng để bán vé giờ chơi trên Chợ vé JGame</p>
      </div>

      <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Tên gian hàng</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder='VD: Alpha Cyber Center' data-qa='i_ten_gian_hang' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Thành phố</label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder='VD: Hà Nội' data-qa='i_thanh_pho' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Địa chỉ</label>
          <Input value={address} onChange={e => setAddress(e.target.value)} placeholder='Số nhà, đường, phường/xã' data-qa='i_dia_chi' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Mô tả gian hàng</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className='w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none'
            placeholder='Cấu hình máy, số chỗ, tiện ích nổi bật...'
            data-qa='i_mo_ta'
          />
        </div>

        {errorMessage && (
          <div className='flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <Button className='jgame-btn-primary w-full text-white' disabled={!isValid || submitting} onClick={handleSubmit} data-qa='btn_dang_ky_gian_hang'>
          {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đăng ký gian hàng
        </Button>
      </div>
    </div>
  )
}
