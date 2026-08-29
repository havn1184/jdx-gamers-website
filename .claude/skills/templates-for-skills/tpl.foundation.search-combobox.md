# Template: SearchCombobox

## Import

```tsx
import { SearchCombobox } from '@/shared/components/common'
import type { ComboboxOption } from '@/shared/components/common'
```

---

## loadOptions mẫu — Nhà cung cấp (BaseIndexApp)

```ts
import { NhaCungCapApiService } from '@/modules/BaseIndexApp/features/doi-tac/nha-cung-cap/services/nha-cung-cap-api.service'

async function loadNhaCungCapOptions(keyword: string): Promise<ComboboxOption[]> {
  const res = await NhaCungCapApiService.getList({ term: keyword, pageSize: 20 })
  return res.data.map(i => ({ value: i.id, label: i.name, subLabel: i.code }))
}
```

---

## loadOptions mẫu — Hàng hóa/Sản phẩm (BaseIndexApp, loại 1=Hàng hóa)

```ts
import { SanPhamApiService } from '@/modules/BaseIndexApp/features/hang-hoa/san-pham/services/san-pham-api.service'
import type { SanPhamType } from '@/modules/BaseIndexApp/features/hang-hoa/san-pham/types/san-pham.types'

const LOAI_HANG_HOA: SanPhamType = 1

async function loadHangHoaOptions(keyword: string): Promise<ComboboxOption[]> {
  const res = await SanPhamApiService.getList({ term: keyword, pageSize: 20, productType: LOAI_HANG_HOA })
  return res.data.map(i => ({
    value: i.id,
    label: i.name,
    subLabel: [i.code, i.baseUnitName].filter(Boolean).join(' · '),
  }))
}
```

---

## Cách dùng trong form

```tsx
<SearchCombobox
  value={formData.nhaCungCapId}
  onChange={(value, label) => handleChange('nhaCungCapId', value, label)}
  loadOptions={loadNhaCungCapOptions}
  placeholder='Chọn nhà cung cấp'
  searchPlaceholder='Tìm theo tên...'
  dataQa='sel_nha_cung_cap'
/>
```

---

## Quy tắc cross-portal API

- Được phép gọi cross-portal từ BaseIndexApp, SsoApp... qua service đã có sẵn
- Không tạo lại service nếu đã có trong `BaseIndexApp/features/`
- `ComboboxOption` luôn có `value = id`, `label = name`, `subLabel = code hoặc thông tin phụ`
