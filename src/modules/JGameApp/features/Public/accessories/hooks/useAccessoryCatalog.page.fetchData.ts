/**
 * useAccessoryCatalog.page.fetchData — Logic trang Danh mục phụ kiện (SC-26).
 * Lọc theo danh mục (nhóm thiết bị) + hãng sản xuất + từ khoá.
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { AccessoryApiService } from '../services/AccessoryApiService'
import type { AccessoryProduct, AccessoryCategory } from '../types/accessory.types'

export type AccessoryCategoryFilter = 'all' | AccessoryCategory

export function useAccessoryCatalogFetchData() {
  const [items, setItems] = useState<AccessoryProduct[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<AccessoryCategoryFilter>('all')
  const [brand, setBrand] = useState<string>('all')
  const debouncedKeyword = useDebounce(keyword, 400)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await AccessoryApiService.getProducts({ keyword: debouncedKeyword, category, brand })
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, category, brand])

  useEffect(() => { void fetchData() }, [fetchData])

  const loadBrands = useCallback(async () => {
    const r = await AccessoryApiService.getBrands()
    if (r.success && r.data) setBrands(r.data)
  }, [])

  useEffect(() => { void loadBrands() }, [loadBrands])

  return { items, loading, keyword, setKeyword, category, setCategory, brand, setBrand, brands }
}
