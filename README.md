# Thơ Mộc — Project Skeleton

Đây là **khung thư mục**, chưa triển khai giao diện, API hay nghiệp vụ. Các file trong `src/pages`, `src/components`, `src/features` và `src/lib` được để trống để tự code từng phần.

## Cây thư mục

```text
src/
├── app/                         # Điểm khởi tạo app, routes, providers
├── assets/                      # Ảnh, icon, font tĩnh
├── components/
│   ├── auth/                    # ProtectedRoute, RoleGuard
│   ├── comment/                 # CommentList, CommentForm
│   ├── common/                  # Button, Input, Modal, trạng thái chung
│   ├── layout/                  # Header, Footer
│   ├── poem/                    # PoemCard, PoemForm, PoemContent
│   └── tag/                     # TagBadge, TagSelector
├── features/
│   ├── admin/                   # Nghiệp vụ quản trị
│   ├── auth/                    # Đăng ký, đăng nhập, session
│   ├── comments/                # CRUD comment, realtime
│   ├── import-poems/            # Đọc và validate JSON thơ
│   ├── poems/                   # CRUD bài thơ
│   └── tags/                    # Tag và gắn tag
├── layouts/                     # Khung layout cho các nhóm route
├── lib/                         # Supabase client, Query client, constants
├── pages/
│   ├── admin/
│   ├── auth/
│   ├── home/
│   ├── poems/
│   └── profile/
├── styles/                      # CSS reset, biến, stylesheet chính
├── types/                       # Type dùng chung và type database
└── main.tsx                     # Entry point

supabase/
├── migrations/                  # Các file SQL migration
└── seed.sql                     # Dữ liệu mẫu tùy chọn
```

## Route dự kiến

| Route | Mục đích | Quyền |
|---|---|---|
| `/` | Trang khám phá thơ | Public |
| `/login` | Đăng nhập | Public |
| `/register` | Đăng ký | Public |
| `/poems` | Danh sách thơ, tìm kiếm, lọc tag | Public |
| `/poems/:id` | Chi tiết thơ và bình luận | Public / comment cần đăng nhập |
| `/poems/new` | Tạo bài thơ | User |
| `/poems/:id/edit` | Sửa bài thơ | Author / Admin |
| `/my-poems` | Thơ của tôi | User |
| `/profile` | Hồ sơ cá nhân | User |
| `/admin` | Quản trị thơ, comment, import JSON | Admin |

## Thứ tự tự triển khai

1. Cài dependencies và tạo Supabase project.
2. Viết migration cho `profiles`, `poems`, `tags`, `poem_tags`, `comments`.
3. Viết `supabaseClient.ts` và xác thực.
4. Làm `Header`, `MainLayout`, routes và các trang public.
5. Làm CRUD thơ.
6. Làm upload ảnh bằng Supabase Storage.
7. Làm tag và comment.
8. Thêm Realtime cho comment.
9. Thêm protected route, role admin và import JSON.

## Lệnh

```bash
npm install
npm run dev
npm run build
```
