```tsx
// Skeleton tổng thể của 1 Sub Page
export default function TenFeatureDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { formData, errors, touched, saving, handleChange, handleBlur, handleSubmit } = useTenFeatureDetail(id)
  const isCreate = !id
  const [pageMode, setPageMode] = useState<'view' | 'edit'>(isCreate ? 'edit' : 'view')
  const isView = pageMode === 'view'
  const isEdit = pageMode === 'edit'

  return (
    <div className='space-y-6 p-6'>

      {/* [1] Breadcrumb + Page Header — xem tpl.sub-page.breadcrumb-and-header.md */}

      {/* [2] Card thông tin chính — xem tpl.sub-page.card-info.md */}
      <Card className='border-[#e0e0e0]'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-base font-semibold'>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-4'>
          ...
        </CardContent>
      </Card>

      {/* [3] Card bảng chi tiết (nếu có) — xem tpl.sub-page.card-detail-lines.md */}

      {/* [4] Card bổ sung / Tabs (nếu có) */}

    </div>
  )
}
```

```tsx
// Route config cho sub page
{
  path: 'ten-feature',
  element: <TenFeaturePage />,         // master page
},
{
  path: 'ten-feature/tao-moi',
  element: <TenFeatureDetailPage />,   // sub page — tạo mới (id = undefined)
},
{
  path: 'ten-feature/:id',
  element: <TenFeatureDetailPage />,   // sub page — xem/sửa
},
```
