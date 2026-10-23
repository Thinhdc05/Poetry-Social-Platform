# Thơ Mộc — Kế hoạch triển khai

## Mục tiêu của kế hoạch

Không làm tất cả chức năng cùng lúc. Mỗi giai đoạn phải hoàn thành một **luồng người dùng có thể chạy từ đầu đến cuối**, sau đó mới chuyển sang luồng tiếp theo.

Thứ tự ưu tiên:

```text
Khung dự án
  → Xem danh sách thơ
  → Xem chi tiết thơ
  → Đăng ký / đăng nhập
  → Tạo bài thơ
  → Sửa / xóa bài thơ của mình
  → Tag và tìm kiếm
  → Bình luận
  → Upload ảnh
  → Realtime comment
  → Phân quyền admin
  → Import JSON
```

## Nguyên tắc làm việc

- Chỉ chuyển giai đoạn khi giai đoạn hiện tại chạy được.
- Mỗi chức năng làm theo thứ tự: giao diện → dữ liệu → xử lý trạng thái → kiểm tra lỗi.
- Không làm UI quá đẹp trước khi luồng dữ liệu hoạt động.
- Không tin vào việc chỉ ẩn nút ở frontend; quyền quan trọng phải được bảo vệ bằng Supabase RLS.
- Sau mỗi luồng hoàn chỉnh, tạo một commit riêng.

---

## Giai đoạn 0 — Chuẩn bị và hiểu khung dự án

### Mục tiêu

Hiểu cấu trúc project và chạy được ứng dụng React trống trên máy.

### Việc cần làm

- Đọc cấu trúc trong `src/`.
- Hiểu vai trò của:
  - `pages/`
  - `components/`
  - `features/`
  - `layouts/`
  - `lib/`
  - `types/`
- Cài dependency.
- Chạy Vite dev server.
- Xóa hoặc giữ các file placeholder phù hợp.
- Tạo file `.env.local` từ `.env.example` khi bắt đầu dùng Supabase.

### Hoàn thành khi

- `npm install` chạy được.
- `npm run dev` mở được trên trình duyệt.
- `npm run build` không lỗi.

### Commit

```text
chore: prepare project skeleton
```

---

## Giai đoạn 1 — Luồng xem danh sách và chi tiết bài thơ bằng dữ liệu giả

### Mục tiêu

Người dùng chưa cần đăng nhập nhưng có thể xem các bài thơ mẫu.

### Luồng cần hoàn thành

```text
Mở trang chủ
  → thấy danh sách bài thơ
  → bấm vào một bài
  → xem chi tiết bài thơ
  → quay lại danh sách
```

### Việc cần làm

- Tạo type `Poem`.
- Tạo dữ liệu mẫu trong một file tạm.
- Làm `MainLayout`, `Header`, `Footer`.
- Làm `PoemCard`.
- Làm `PoemListPage`.
- Làm `PoemDetailPage`.
- Cấu hình React Router.
- Xử lý:
  - loading giả lập nếu cần;
  - bài thơ không tồn tại;
  - danh sách rỗng.

### Hoàn thành khi

- Có thể chuyển trang bằng URL.
- Có thể xem danh sách và chi tiết.
- Refresh trang chi tiết không làm app lỗi.

### Commit

```text
feat: add poem list and detail flow
```

---

## Giai đoạn 2 — Tạo Supabase project và database cơ bản

### Mục tiêu

Tạo backend thật nhưng chưa cần tích hợp toàn bộ frontend ngay.

### Việc cần làm

- Tạo tài khoản Supabase.
- Tạo project mới.
- Tạo database cho:
  - `profiles`
  - `poems`
  - `tags`
  - `poem_tags`
  - `comments`
- Xác định quan hệ giữa các bảng.
- Tạo `supabaseClient.ts`.
- Thêm:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Không commit `.env.local`.

### Hoàn thành khi

- Có thể mở Table Editor của Supabase.
- Có thể nhìn thấy các bảng.
- Frontend tạo được Supabase client.
- Build không làm lộ secret hoặc key không cần thiết.

### Commit

```text
chore: configure supabase client and database
```

---

## Giai đoạn 3 — Luồng đăng ký, đăng nhập và đăng xuất

### Mục tiêu

Người dùng có tài khoản và frontend biết người dùng hiện tại là ai.

### Luồng cần hoàn thành

```text
Mở trang đăng ký
  → nhập email và password
  → tạo tài khoản
  → đăng nhập
  → thấy trạng thái đã đăng nhập
  → đăng xuất
```

### Việc cần làm

- Làm `RegisterPage`.
- Làm `LoginPage`.
- Làm `AuthLayout`.
- Viết các hàm trong `features/auth/auth.api.ts`:
  - `signUp`
  - `signIn`
  - `signOut`
  - `getCurrentUser`
- Viết `useAuth`.
- Lắng nghe thay đổi session.
- Hiển thị loading và error rõ ràng.
- Tạo profile sau khi đăng ký nếu cần.

### Hoàn thành khi

- Đăng ký được tài khoản thật.
- Đăng nhập được.
- Refresh trang vẫn giữ session.
- Đăng xuất được.
- Sai email/password có thông báo lỗi.

### Commit

```text
feat: add supabase authentication flow
```

---

## Giai đoạn 4 — Luồng tạo bài thơ

### Mục tiêu

Người dùng đã đăng nhập có thể tạo bài thơ và nhìn thấy bài vừa tạo.

### Luồng cần hoàn thành

```text
Đăng nhập
  → mở trang tạo bài thơ
  → nhập tiêu đề và nội dung
  → bấm đăng bài
  → lưu vào Supabase
  → chuyển tới chi tiết bài thơ
```

### Việc cần làm

- Bảo vệ route `/poems/new`.
- Làm `CreatePoemPage`.
- Làm `PoemForm`.
- Viết `createPoem` trong `poems.api.ts`.
- Validate:
  - tiêu đề bắt buộc;
  - nội dung bắt buộc;
  - giới hạn độ dài.
- Xử lý trạng thái:
  - chưa nhập dữ liệu;
  - đang submit;
  - submit lỗi;
  - submit thành công.
- Thay dữ liệu giả ở chi tiết bằng dữ liệu từ Supabase.

### Hoàn thành khi

- User đăng nhập tạo được bài thơ thật.
- Bài thơ được lưu trong bảng `poems`.
- `author_id` là user hiện tại.
- Sau khi tạo, bài thơ xuất hiện trong danh sách.

### Commit

```text
feat: add create poem flow
```

---

## Giai đoạn 5 — Luồng quản lý bài thơ của mình

### Mục tiêu

Tác giả có thể xem, sửa và xóa bài thơ do mình tạo.

### Luồng cần hoàn thành

```text
Mở "Thơ của tôi"
  → thấy các bài của mình
  → mở một bài
  → chỉnh sửa
  → lưu thay đổi
  → xóa bài nếu cần
```

### Việc cần làm

- Làm `MyPoemsPage`.
- Làm `EditPoemPage`.
- Viết:
  - `getMyPoems`
  - `getPoemById`
  - `updatePoem`
  - `deletePoem`
- Hiển thị nút sửa/xóa đúng người dùng.
- Thêm dialog xác nhận khi xóa.
- Thiết lập RLS cho `poems`.

### Hoàn thành khi

- User A không thấy nút sửa/xóa bài của User B.
- User A không thể sửa/xóa bài của User B dù gọi trực tiếp API.
- User A sửa và xóa được bài của mình.
- Admin chưa cần làm ở giai đoạn này.

### Commit

```text
feat: add personal poem management
```

---

## Giai đoạn 6 — Tag, tìm kiếm và lọc bài thơ

### Mục tiêu

Người dùng dễ khám phá bài thơ theo nội dung và chủ đề.

### Luồng cần hoàn thành

```text
Trang danh sách
  → nhập từ khóa
  → thấy bài phù hợp
  → chọn tag
  → chỉ thấy bài thuộc tag đó
```

### Việc cần làm

- Tạo và lấy danh sách tag.
- Làm `TagBadge`.
- Làm `TagSelector`.
- Gắn nhiều tag khi tạo/sửa bài thơ.
- Làm `PoemFilters`.
- Viết query tìm kiếm và lọc.
- Xử lý trạng thái không có kết quả.

### Hoàn thành khi

- Một bài thơ gắn được nhiều tag.
- Có thể lọc theo tag.
- Có thể tìm theo tiêu đề hoặc nội dung.
- Sửa bài thơ không làm mất tag cũ nếu không thay đổi.

### Commit

```text
feat: add poem tags and filters
```

---

## Giai đoạn 7 — Bình luận cơ bản

### Mục tiêu

Người dùng đăng nhập có thể bình luận trên bài thơ.

### Luồng cần hoàn thành

```text
Mở chi tiết bài thơ
  → xem danh sách comment
  → nhập comment
  → gửi
  → comment xuất hiện trong danh sách
```

### Việc cần làm

- Làm `CommentList`.
- Làm `CommentForm`.
- Viết:
  - `getCommentsByPoemId`
  - `createComment`
  - `deleteComment`
- Chỉ user đăng nhập mới được gửi comment.
- Tác giả comment có thể xóa comment của mình.
- Admin có thể xóa comment vi phạm sau này.
- Thiết lập RLS cho `comments`.

### Hoàn thành khi

- Comment được lưu vào database.
- Refresh trang vẫn còn comment.
- Người chưa đăng nhập chỉ xem được comment.
- Người chưa đăng nhập không gửi được comment.

### Commit

```text
feat: add poem comments
```

---

## Giai đoạn 8 — Upload ảnh minh họa

### Mục tiêu

Người dùng có thể thêm ảnh vào bài thơ.

### Luồng cần hoàn thành

```text
Tạo hoặc sửa bài thơ
  → chọn ảnh
  → upload lên Supabase Storage
  → nhận image URL
  → lưu URL vào poems
  → hiển thị ảnh ở chi tiết
```

### Việc cần làm

- Tạo Storage bucket cho ảnh bài thơ.
- Kiểm tra loại file.
- Giới hạn kích thước file.
- Upload file.
- Xử lý tên file và đường dẫn.
- Xóa ảnh cũ khi thay ảnh nếu cần.
- Hiển thị preview trước khi upload.

### Hoàn thành khi

- Ảnh được lưu trong Storage.
- Bài thơ lưu đúng `image_url`.
- Reload trang vẫn hiển thị ảnh.
- File không hợp lệ bị từ chối rõ ràng.

### Commit

```text
feat: add poem image upload
```

---

## Giai đoạn 9 — Realtime comment

### Mục tiêu

Comment mới xuất hiện trên các trình duyệt đang mở cùng bài thơ mà không cần refresh.

### Luồng cần hoàn thành

```text
Mở cùng một bài thơ bằng hai trình duyệt
  → User A gửi comment
  → User B thấy comment mới tự động
```

### Việc cần làm

- Tạo channel theo `poem_id`.
- Subscribe sự kiện insert vào bảng `comments`.
- Cập nhật React state khi nhận event.
- Hủy subscription khi rời trang.
- Tránh hiển thị trùng comment vừa được gửi.
- Hiển thị trạng thái kết nối nếu cần.

### Hoàn thành khi

- Hai cửa sổ trình duyệt nhận được comment mới.
- Không cần F5.
- Không bị trùng comment.
- Rời trang không để lại subscription thừa.

### Commit

```text
feat: add realtime poem comments
```

---

## Giai đoạn 10 — Profile và phân quyền Admin

### Mục tiêu

Tách quyền `USER` và `ADMIN`, bảo vệ khu vực quản trị.

### Luồng cần hoàn thành

```text
User thường
  → không truy cập được /admin

Admin
  → truy cập /admin
  → xem danh sách bài thơ/comment
  → xóa nội dung vi phạm
```

### Việc cần làm

- Hoàn thiện `profiles`.
- Thêm role `USER` và `ADMIN`.
- Làm `ProfilePage`.
- Làm `RoleGuard`.
- Làm `AdminPage`.
- Thiết lập RLS cho admin.
- Không cho frontend tự quyết định quyền duy nhất.

### Hoàn thành khi

- User thường bị chặn khỏi `/admin`.
- Admin truy cập được `/admin`.
- Admin xóa được bài thơ/comment theo policy.
- Gọi API trái quyền vẫn bị Supabase từ chối.

### Commit

```text
feat: add admin role and content moderation
```

---

## Giai đoạn 11 — Import thơ từ JSON

### Mục tiêu

Admin có thể chọn file JSON và thêm nhiều bài thơ.

### Format JSON dự kiến

```json
[
  {
    "title": "Chiều quê",
    "content": "Chiều nghiêng trên mái nhà xưa",
    "tags": ["quê hương", "thiên nhiên"]
  }
]
```

### Luồng cần hoàn thành

```text
Admin mở trang import
  → chọn file JSON
  → kiểm tra dữ liệu
  → xem lỗi nếu format sai
  → xác nhận import
  → các bài thơ được tạo
```

### Việc cần làm

- Đọc file bằng `FileReader`.
- Parse JSON an toàn.
- Validate từng item.
- Báo dòng hoặc item bị lỗi.
- Tìm hoặc tạo tag.
- Insert dữ liệu theo batch nếu phù hợp.
- Hiển thị kết quả thành công/thất bại.

### Hoàn thành khi

- File đúng format được import.
- File sai format không làm app crash.
- Item lỗi được báo rõ.
- Chỉ admin mới import được.

### Commit

```text
feat: add poem json import
```

---

## Giai đoạn 12 — Hoàn thiện và triển khai demo

### Mục tiêu

Chuẩn bị sản phẩm để trình bày với mentor.

### Việc cần làm

- Kiểm tra toàn bộ route.
- Kiểm tra mobile.
- Kiểm tra loading, empty, error state.
- Kiểm tra quyền bằng nhiều tài khoản.
- Kiểm tra RLS trực tiếp.
- Bổ sung README:
  - cách cài;
  - biến môi trường;
  - database setup;
  - tài khoản demo;
  - các chức năng đã hoàn thành.
- Deploy frontend.
- Cấu hình biến môi trường trên nơi deploy.

### Luồng demo cuối

```text
Đăng ký
  → đăng nhập
  → tạo bài thơ
  → thêm tag
  → upload ảnh
  → xem bài thơ
  → tài khoản khác bình luận
  → comment realtime
  → admin quản lý nội dung
```

### Commit

```text
chore: prepare project for demo
```

---

## Checklist tổng kết

- [ ] Project chạy được.
- [ ] Xem danh sách thơ.
- [ ] Xem chi tiết thơ.
- [ ] Đăng ký.
- [ ] Đăng nhập.
- [ ] Đăng xuất.
- [ ] Tạo bài thơ.
- [ ] Sửa bài thơ của mình.
- [ ] Xóa bài thơ của mình.
- [ ] Tag.
- [ ] Tìm kiếm.
- [ ] Lọc.
- [ ] Comment.
- [ ] Upload ảnh.
- [ ] Comment realtime.
- [ ] Profile.
- [ ] Phân quyền User/Admin.
- [ ] Admin quản lý nội dung.
- [ ] Import JSON.
- [ ] Responsive.
- [ ] Deploy demo.
