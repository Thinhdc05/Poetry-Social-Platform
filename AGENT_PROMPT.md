# Prompt làm việc với agent — Dự án Thơ Mộc

Bạn đang làm việc trong repository:

```text
/Users/thinh/Poetry Social Platform
```

Repository GitHub:

```text
https://github.com/Thinhdc05/Poetry-Social-Platform.git
```

## Bối cảnh dự án

Thơ Mộc là một nền tảng chia sẻ thơ bằng React + TypeScript.

Các chức năng dự kiến:

- Xem danh sách bài thơ.
- Xem chi tiết bài thơ.
- Đăng ký, đăng nhập, đăng xuất.
- Tạo, sửa, xóa bài thơ của mình.
- Gắn tag, tìm kiếm và lọc bài thơ.
- Bình luận.
- Upload ảnh minh họa.
- Bình luận realtime.
- Phân quyền User/Admin.
- Admin import thơ từ JSON.

Backend dùng Supabase:

- Supabase Auth.
- PostgreSQL Database.
- Storage.
- Realtime.
- Row Level Security.

## Trạng thái hiện tại

- Project React + TypeScript + Vite đã được tạo.
- `npm install` đã chạy.
- `npm run dev` chạy được.
- `npm run build` chạy được.
- Supabase project đã được tạo.
- `.env.local` đã được cấu hình và không được commit.
- Database Supabase đã có:
  - `profiles`
  - `poems`
  - `tags`
  - `poem_tags`
  - `comments`
- Supabase Auth Email đã bật.
- Trigger tự tạo `profiles` khi user đăng ký đã có.
- RLS cơ bản đã có.
- Project hiện là skeleton, nhiều file trong `src/` đang để trống để triển khai dần.

## Nguyên tắc bắt buộc

1. Làm từng luồng hoàn chỉnh, không làm tất cả chức năng cùng lúc.
2. Trước khi sửa file, phải đọc cấu trúc và nội dung liên quan.
3. Không tự ý đổi công nghệ hoặc cài thêm thư viện nếu chưa cần.
4. Không tự ý tạo giao diện phức tạp.
5. Không tự ý sửa Supabase schema nếu chưa giải thích rõ.
6. Không đọc, in ra hoặc commit các giá trị bí mật trong `.env.local`.
7. Không commit `node_modules`, `dist`, `.env.local`.
8. Giữ type safety, không dùng `any` nếu không cần thiết.
9. Sau khi sửa phải chạy kiểm tra phù hợp.
10. Không làm các task ngoài phạm vi hiện tại.
11. Nếu có nhiều hướng xử lý hợp lý, hãy hỏi trước thay vì tự quyết định.
12. Khi hoàn thành, báo rõ:
    - Đã thay đổi file nào.
    - Đã hoàn thành luồng nào.
    - Đã chạy lệnh kiểm tra nào.
    - Còn việc gì chưa làm.

## Cách làm việc theo từng luồng

Mỗi luồng cần theo thứ tự:

```text
Đọc yêu cầu
→ kiểm tra file liên quan
→ lập phạm vi nhỏ
→ code
→ chạy build/test/lint phù hợp
→ kiểm tra hành vi
→ tóm tắt thay đổi
```

Không chuyển sang luồng tiếp theo nếu luồng hiện tại chưa chạy được.

## Task hiện tại: Luồng xem danh sách và chi tiết bài thơ bằng dữ liệu giả

Chỉ làm task này. Chưa làm Auth, CRUD thật, Storage, Comment, Realtime hoặc Admin.

### Luồng cần đạt

```text
Mở trang chủ
→ thấy danh sách bài thơ mẫu
→ bấm vào một bài thơ
→ xem trang chi tiết
→ bấm quay lại danh sách
```

### Phạm vi triển khai

1. Định nghĩa type `Poem` trong:

```text
src/features/poems/poems.types.ts
```

Type tối thiểu nên có:

```text
id
title
content
author
createdAt
```

Có thể thêm `imageUrl` hoặc `tags` nếu thật sự cần cho luồng này, nhưng không mở rộng quá mức.

2. Tạo dữ liệu mẫu trong:

```text
src/features/poems/poems.api.ts
```

Giai đoạn này chưa gọi Supabase. Có khoảng 3 bài thơ mẫu.

3. Cấu hình router trong:

```text
src/app/routes.tsx
```

Route tối thiểu:

```text
/
/poems/:id
```

4. Tạo layout tối thiểu nếu cần:

```text
src/layouts/MainLayout.tsx
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
```

5. Tạo component hiển thị thẻ thơ:

```text
src/components/poem/PoemCard.tsx
```

6. Tạo trang danh sách:

```text
src/pages/home/HomePage.tsx
```

7. Tạo trang chi tiết:

```text
src/pages/poems/PoemDetailPage.tsx
```

8. Xử lý trạng thái không tìm thấy bài thơ.

9. Thêm CSS tối thiểu để nội dung dễ đọc. Không cần thiết kế hoàn chỉnh.

### Tiêu chí hoàn thành

- `npm run dev` mở được trang danh sách.
- Trang `/` hiển thị 3 bài thơ mẫu.
- Bấm vào card sẽ đi tới `/poems/:id`.
- Trang chi tiết hiển thị đúng bài thơ.
- ID không tồn tại hiển thị trạng thái Not Found thân thiện.
- Có thể quay lại trang danh sách.
- `npm run build` chạy thành công.
- Không có dữ liệu Supabase nào bị gọi trong task này.

### Không làm trong task hiện tại

- Không làm đăng ký/đăng nhập.
- Không làm `supabaseClient`.
- Không gọi database.
- Không làm form tạo bài thơ.
- Không làm sửa/xóa.
- Không làm Storage.
- Không làm comment.
- Không làm Realtime.
- Không làm Admin.
- Không import JSON.
- Không cài TanStack Query, React Hook Form hoặc thư viện mới nếu chưa cần.

## Sau khi task hiện tại hoàn thành

Dừng lại và báo cáo. Chưa tự động làm task tiếp theo.

Task tiếp theo dự kiến:

```text
Kết nối Supabase Auth:
đăng ký → đăng nhập → giữ session → đăng xuất
```

Nhưng chỉ bắt đầu khi người dùng xác nhận.
