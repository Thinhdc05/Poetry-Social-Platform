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
  → thấy danh sách bài thơ mẫu
  → bấm vào một bài
  → xem chi tiết bài thơ
  → quay lại danh sách
```

### Chi tiết từng bước triển khai (Step-by-step Plan)

- **Bước 1: Định nghĩa Type dữ liệu**
  - File: `src/features/poems/poems.types.ts`
  - Khai báo interface `Poem` gồm: `id` (string), `title` (string), `content` (string), `author` (string), `createdAt` (string), `excerpt` (string, optional).
  - Đảm bảo type safety, không dùng `any`.

- **Bước 2: Tạo dữ liệu mẫu & hàm truy xuất**
  - File: `src/features/poems/poems.api.ts`
  - Tạo mảng hằng số `MOCK_POEMS: Poem[]` gồm 3 bài thơ tiếng Việt mộc mạc, có nhiều khổ/dòng (`\n`).
  - Viết các hàm helper đồng bộ:
    - `getMockPoems(): Poem[]`
    - `getMockPoemById(id: string): Poem | undefined`

- **Bước 3: Cài đặt Tailwind CSS v4 & Thiết lập Style "Thơ Mộc"**
  - Cài đặt: `tailwindcss` và `@tailwindcss/vite`
  - File: `vite.config.ts`, `src/styles/index.css`
  - Cấu hình plugin `@tailwindcss/vite` và `@import "tailwindcss";`
  - Tận dụng bảng màu mộc mạc sẵn có của Tailwind (`stone`, `amber`, `neutral`) cho giao diện đọc thơ.

- **Bước 4: Xây dựng Layout & Navigation cơ bản**
  - File: `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/layouts/MainLayout.tsx`
  - `Header`: Logo "Thơ Mộc" (link về `/`), tagline mộc mạc.
  - `Footer`: Chân trang thông tin tối giản.
  - `MainLayout`: Bọc Header, Footer và `<Outlet />` trong container căn giữa.

- **Bước 5: Xây dựng Component hiển thị thẻ thơ (PoemCard)**
  - File: `src/components/poem/PoemCard.tsx`
  - Hiển thị tiêu đề thơ, tác giả, ngày đăng, đoạn trích ngắn (`excerpt` hoặc 2 dòng đầu).
  - Bọc thẻ trong `<Link to={`/poems/${poem.id}`}>` với hover effect nhẹ nhàng.

- **Bước 6: Xây dựng Trang danh sách bài thơ (HomePage)**
  - File: `src/pages/home/HomePage.tsx`
  - Lấy danh sách từ `getMockPoems()`.
  - Hiển thị lưới/danh sách `PoemCard`.
  - Xử lý trạng thái danh sách rỗng (Empty state) nếu không có bài thơ nào.

- **Bước 7: Xây dựng Trang chi tiết bài thơ (PoemDetailPage)**
  - File: `src/pages/poems/PoemDetailPage.tsx`
  - Lấy `id` từ `useParams()`.
  - Tìm bài thơ bằng `getMockPoemById(id)`.
  - Nếu tìm thấy: hiển thị nút "← Quay lại danh sách", tiêu đề, tác giả, ngày đăng, nội dung thơ giữ nguyên định dạng xuống dòng (`white-space: pre-line`).
  - Nếu không tìm thấy: hiển thị giao diện Not Found thân thiện ("Không tìm thấy bài thơ") và nút quay về trang chủ.

- **Bước 8: Cấu hình Router & Tích hợp vào App**
  - File: `src/app/routes.tsx`, `src/app/App.tsx`
  - Cấu hình route: `/` (HomePage), `/poems/:id` (PoemDetailPage), `*` (Not Found fallback).
  - Tích hợp `RouterProvider` vào `App.tsx`.

- **Bước 9: Kiểm tra Type Safety & Build**
  - Chạy `npm run build` để kiểm tra TypeScript compilation và Vite build.

### Checklist nghiệm thu (Acceptance Checklist)

- [x] **1. Type Definition**: `src/features/poems/poems.types.ts` khai báo đầy đủ interface `Poem`.
- [x] **2. Mock Data**: `src/features/poems/poems.api.ts` có 3 bài thơ mẫu tiếng Việt + hàm `getMockPoems()`, `getMockPoemById(id)`.
- [x] **3. Layout & Styling**: `MainLayout`, `Header`, `Footer` và CSS cơ bản hiển thị cân đối, phong cách mộc mạc.
- [x] **4. Trang chủ**: `HomePage` tại route `/` hiển thị đúng danh sách 3 bài thơ qua `PoemCard`.
- [x] **5. Điều hướng**: Bấm vào `PoemCard` chuyển hướng chính xác đến `/poems/:id`.
- [x] **6. Chi tiết bài thơ**: `PoemDetailPage` hiển thị đúng tiêu đề, tác giả, ngày tạo, xuống dòng thơ nguyên vẹn.
- [x] **7. Nút quay lại**: Nút quay về danh sách trên `PoemDetailPage` hoạt động mượt mà.
- [x] **8. Xử lý 404 / Not Found**: Truy cập ID không tồn tại hiển thị thông báo lỗi rõ ràng và có nút quay về trang chủ.
- [x] **9. Tính cô lập**: Không gọi Supabase DB/Auth trong task này.
- [x] **10. Build & Type check**: Chạy `npm run build` thành công, không có lỗi type nào.

### Commit

```text
feat: add poem list and detail flow with mock data
```

---

## Giai đoạn 2 — Tạo Supabase project và database cơ bản

### Mục tiêu

Tạo backend thật nhưng chưa cần tích hợp toàn bộ frontend ngay.

### Checklist nghiệm thu (Đã hoàn thành)

- [x] **1. Database Schema**: Đã tạo project Supabase và các bảng `profiles`, `poems`, `tags`, `poem_tags`, `comments`.
- [x] **2. Triggers & RLS**: Đã bật Email Auth, trigger tạo profile tự động khi user đăng ký, và RLS cơ bản.
- [x] **3. Môi trường**: Đã cấu hình `.env.local` với `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
- [x] **4. Client SDK**: Đã tạo `src/lib/supabaseClient.ts` kết nối an toàn với Supabase.

---

## Giai đoạn 3 — Luồng đăng ký, đăng nhập và đăng xuất (Supabase Auth)

### Mục tiêu

Người dùng có thể đăng ký tài khoản mới, đăng nhập, duy trì phiên làm việc (session) khi refresh trang, và đăng xuất an toàn.

### Luồng cần hoàn thành

```text
Mở trang đăng ký
  → nhập email, password, tên hiển thị
  → bấm đăng ký (tài khoản được tạo trên Supabase)
  → đăng nhập vào hệ thống
  → Header hiển thị thông tin người dùng
  → F5 refresh trang vẫn giữ phiên đăng nhập
  → bấm đăng xuất (quay về trạng thái khách)
```

### Chi tiết từng bước triển khai (Step-by-step Plan)

- **Bước 1: Định nghĩa Type cho Auth**
  - File: `src/features/auth/auth.types.ts`
  - Khai báo interface: `SignUpInput`, `SignInInput`, `UserProfile`.

- **Bước 2: Viết các hàm Auth API với Supabase**
  - File: `src/features/auth/auth.api.ts`
  - Các hàm gọi trực tiếp `supabase.auth`:
    - `signUp({ email, password, fullName })`
    - `signIn({ email, password })`
    - `signOut()`
    - `getCurrentSession()`
    - `getCurrentUser()`

- **Bước 3: Tạo AuthContext & Hook `useAuth`**
  - File: `src/features/auth/useAuth.ts` (hoặc Context Provider trong `src/app/providers.tsx`)
  - Quản lý `user`, `session`, `loading`.
  - Lắng nghe sự kiện `supabase.auth.onAuthStateChange` để tự động đồng bộ trạng thái đăng nhập toàn ứng dụng.

- **Bước 4: Xây dựng Layout cho Auth (AuthLayout)**
  - File: `src/layouts/AuthLayout.tsx`
  - Giao diện khung thẻ căn giữa (Centered Card), logo Thơ Mộc, liên kết quay về trang chủ.

- **Bước 5: Xây dựng Trang Đăng ký (RegisterPage)**
  - File: `src/pages/auth/RegisterPage.tsx`
  - Form nhập: Email, Mật khẩu, Tên hiển thị.
  - Xử lý submit, loading state, hiển thị thông báo lỗi từ Supabase nếu có.

- **Bước 6: Xây dựng Trang Đăng nhập (LoginPage)**
  - File: `src/pages/auth/LoginPage.tsx`
  - Form nhập: Email, Mật khẩu.
  - Xử lý submit, báo lỗi nếu sai tài khoản/mật khẩu, chuyển hướng sau khi thành công.

- **Bước 7: Cập nhật Header hiển thị trạng thái User**
  - File: `src/components/layout/Header.tsx`
  - Nếu chưa đăng nhập: Nút "Đăng nhập", "Đăng ký".
  - Nếu đã đăng nhập: Hiển thị tên/email + nút "Đăng xuất".

- **Bước 8: Cấu hình Routes cho Auth**
  - File: `src/app/routes.tsx`
  - Thêm route `/login` và `/register`.

- **Bước 9: Kiểm tra thực tế & Build**
  - Đăng ký tài khoản thật $\rightarrow$ Đăng nhập $\rightarrow$ Refresh $\rightarrow$ Đăng xuất.
  - Chạy `npm run build` đảm bảo không có lỗi type.

### Checklist nghiệm thu (Acceptance Checklist)

- [x] **1. Auth Types**: `src/features/auth/auth.types.ts` định nghĩa đầy đủ interface cần thiết.
- [x] **2. Auth API**: `src/features/auth/auth.api.ts` bao bọc đầy đủ các phương thức Auth của Supabase.
- [x] **3. Session Management**: Hook/Context `useAuth` lắng nghe `onAuthStateChange` chuẩn xác.
- [ ] **4. Auth Layout**: `AuthLayout.tsx` hiển thị trang nhã, tập trung.
- [ ] **5. Trang Đăng ký**: `RegisterPage` cho phép tạo tài khoản thành công lên Supabase.
- [ ] **6. Trang Đăng nhập**: `LoginPage` xác thực đúng email/password và lưu session.
- [ ] **7. Xử lý lỗi & Loading**: Báo lỗi rõ ràng khi sai pass, email trùng hoặc mạng yếu.
- [ ] **8. Header đồng bộ**: Header đổi giao diện linh hoạt giữa khách và người dùng đã đăng nhập.
- [ ] **9. Duy trì Session**: Refresh (F5) trang không bị văng đăng nhập.
- [ ] **10. Đăng xuất**: Nút đăng xuất xóa sạch session và đưa về trang chủ.
- [ ] **11. Build & Type check**: `npm run build` vượt qua không lỗi.

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
