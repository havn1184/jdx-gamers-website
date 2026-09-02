```tsx
// Dialog nhiều tab — dùng maxWidth='920px' className='w-[920px]'
<Tabs defaultValue='thong-tin'>
  <TabsList>
    <TabsTrigger value='thong-tin' data-qa='tab_thong_tin'>Thông tin</TabsTrigger>
    <TabsTrigger value='lich-su' data-qa='tab_lich_su'>Lịch sử</TabsTrigger>
  </TabsList>
  <TabsContent value='thong-tin' className='space-y-4 pt-4'>
    {/* Các fields chính */}
  </TabsContent>
  <TabsContent value='lich-su' className='pt-4'>
    {/* Lịch sử thay đổi */}
  </TabsContent>
</Tabs>
```

```tsx
// Saving state trong hook của dialog
const [saving, setSaving] = useState(false)

async function handleSubmit() {
  if (!validateAllFields()) return
  setSaving(true)
  try {
    await saveAction()
    onSuccess()
    onClose()
  } finally {
    setSaving(false)
  }
}
```
