import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { WalletHoldAdmin, WalletHoldAdminFilterParams } from '../../types/jgame.types'

export function useWalletHoldsFetchData() {
  const [items, setItems] = useState<WalletHoldAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<WalletHoldAdminFilterParams>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    const result = await JGameApiServiceAdmin.getWalletHolds(filters)
    if (result.success && result.data) {
      setItems(result.data)
      setErrorMessage(null)
    } else {
      setErrorMessage(result.message || 'Không tải được danh sách giao dịch chờ xác nhận.')
    }
    setLoading(false)
  }, [filters])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleFlag = useCallback(async (id: string) => {
    const result = await JGameApiServiceAdmin.flagWalletHold(id)
    if (result.success) void fetchData()
    return result
  }, [fetchData])

  const handleConfirm = useCallback(async (id: string) => {
    const result = await JGameApiServiceAdmin.confirmWalletHold(id)
    if (result.success) void fetchData()
    return result
  }, [fetchData])

  const handleReverse = useCallback(async (id: string) => {
    const result = await JGameApiServiceAdmin.reverseWalletHold(id)
    if (result.success) void fetchData()
    return result
  }, [fetchData])

  return { items, loading, errorMessage, filters, setFilters, refetch: fetchData, handleFlag, handleConfirm, handleReverse }
}
