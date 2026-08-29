# DLGNEW-17 — Cấm tự thêm field vào type DTO khi BE chưa có

**Mức độ:** ERROR (kiểm tra thủ công)
**Kiểm tra:** thủ công

## Mô tả
Tuyệt đối không tự ý thêm field vào type DTO (`.types.api.ts`) khi UI cần nhưng backend chưa hỗ trợ. Phải yêu cầu BE bổ sung trước. FE tự thêm field vào type sẽ khiến API bỏ qua field đó hoặc lỗi kiểu dữ liệu, dẫn tới mất dữ liệu âm thầm.

## Ví dụ đúng
> Liên hệ BE bổ sung field `ghiChu` vào response API trước khi thêm field này vào UI/type.

## Ví dụ sai
```ts
// XxxDto.types.api.ts
export interface XxxDto {
  id: string;
  ten: string;
  ghiChu?: string; // ❌ BE chưa trả field này, tự thêm vào type FE
}
```

## Ghi chú
Không dễ kiểm tra tự động vì cần đối chiếu với tài liệu/response thực tế của backend — reviewer cần xác nhận thủ công khi thấy field mới trong type DTO.
