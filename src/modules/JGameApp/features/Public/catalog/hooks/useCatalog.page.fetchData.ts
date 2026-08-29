/**
 * useCatalog.page.fetchData — Logic trang chủ/danh mục thẻ game (SC-01).
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { CardApiService } from '../services/CardApiService'
import type { CardProduct } from '../types/card.types'

export type CatalogCategory = 'all' | CardProduct['category']

export function useCatalogFetchData() {
  const [items, setItems] = useState<CardProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<CatalogCategory>('all')
  const debouncedKeyword = useDebounce(keyword, 400)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const r = await CardApiService.getCardProducts({ keyword: debouncedKeyword, category })
      if (r.success && r.data) setItems(r.data)
      else setErrorMessage(r.message || 'Không tải được danh mục thẻ')
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, category])

  useEffect(() => { void fetchData() }, [fetchData])

  return { items, loading, errorMessage, keyword, setKeyword, category, setCategory, refetch: fetchData }
}
