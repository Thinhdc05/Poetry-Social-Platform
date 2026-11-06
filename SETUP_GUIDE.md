# Cẩm Nang Cài Đặt & Hoàn Thiện Dự Án Thơ Mộc

Tài liệu này lưu lại toàn bộ các bước cấu hình biến môi trường, cơ sở dữ liệu Supabase, phân quyền (RLS), Realtime và Storage để bạn hoàn thiện hệ thống khi sẵn sàng.

---

## 1. Hướng dẫn lấy biến môi trường Supabase

1. Truy cập vào [Supabase Dashboard](https://supabase.com/dashboard) và đăng nhập vào tài khoản của bạn.
2. Chọn dự án **Thơ Mộc** của bạn (hoặc tạo một New Project).
3. Tại thanh menu bên trái, vào mục **Project Settings** (biểu tượng bánh răng ⚙️) $\rightarrow$ chọn tab **API** (hoặc Data API).
4. Tìm 2 giá trị sau:
   - **Project URL**: Ví dụ `https://xyzabcdefghijklm.supabase.co`
   - **Project API Keys**: Copy khóa có nhãn `anon` `public` (Ví dụ `eyJhbGciOi...`).
5. Tạo tệp `.env.local` tại thư mục gốc của dự án (`d:\Downloads\SocialP\.env.local`) với nội dung:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...chuoi_anon_key_cua_ban...
```

> [!NOTE]
> File `.env.local` đã được cấu hình trong `.gitignore` để không bao giờ bị lộ lên GitHub. Khi có file này, ứng dụng sẽ tự động chuyển từ Mock Mode sang kết nối Supabase thật.

---

## 2. Kịch bản SQL khởi tạo Database (Schema & Triggers)

Vào Supabase Dashboard $\rightarrow$ **SQL Editor** $\rightarrow$ **New Query**, dán toàn bộ đoạn mã sau và bấm **Run**:

```sql
-- 1. Bảng Profiles (Hồ sơ người dùng)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Trigger tự động tạo profile khi người dùng đăng ký tài khoản mới qua Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    null,
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Bảng Poems (Bài thơ)
create table if not exists public.poems (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Bảng Tags & Poem_Tags (Chủ đề / Tâm trạng thơ)
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null
);

create table if not exists public.poem_tags (
  poem_id uuid references public.poems(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (poem_id, tag_id)
);

-- 4. Bảng Comments (Lời bình thơ)
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  poem_id uuid references public.poems(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  line_index integer, -- bình luận theo dòng cụ thể (nếu có)
  created_at timestamptz default now()
);

-- 5. Bảng Reactions (Cảm xúc: tim, đồng cảm, chạm)
create table if not exists public.reactions (
  id uuid default gen_random_uuid() primary key,
  poem_id uuid references public.poems(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text default 'heart' check (type in ('heart', 'touch', 'sympathy')),
  created_at timestamptz default now(),
  unique(poem_id, user_id, type)
);

-- 6. Bảng Collections / Bookmarks (Bộ sưu tập thơ)
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.collection_poems (
  collection_id uuid references public.collections(id) on delete cascade,
  poem_id uuid references public.poems(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (collection_id, poem_id)
);
```

---

## 3. Cấu hình Row Level Security (RLS) bảo mật dữ liệu

Chạy tiếp đoạn script sau trong **SQL Editor**:

```sql
-- Bật RLS cho các bảng
alter table public.profiles enable row level security;
alter table public.poems enable row level security;
alter table public.tags enable row level security;
alter table public.poem_tags enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.collections enable row level security;
alter table public.collection_poems enable row level security;

-- Policies: Ai cũng đọc được hồ sơ, thơ, bình luận, tag
create policy "Công khai profiles" on public.profiles for select using (true);
create policy "Người dùng sửa profile của mình" on public.profiles for update using (auth.uid() = id);

create policy "Công khai xem bài thơ" on public.poems for select using (true);
create policy "Người dùng đăng thơ mới" on public.poems for insert with check (auth.uid() = author_id);
create policy "Tác giả sửa bài thơ của mình" on public.poems for update using (auth.uid() = author_id);
create policy "Tác giả xóa bài thơ của mình" on public.poems for delete using (auth.uid() = author_id);

create policy "Công khai bình luận" on public.comments for select using (true);
create policy "Người dùng gửi bình luận" on public.comments for insert with check (auth.uid() = user_id);
create policy "Người dùng xóa bình luận của mình" on public.comments for delete using (auth.uid() = user_id);

create policy "Công khai cảm xúc" on public.reactions for select using (true);
create policy "Người dùng thả/hủy cảm xúc" on public.reactions for all using (auth.uid() = user_id);
```

---

## 4. Kích hoạt Supabase Realtime

Để bình luận và cảm xúc hiển thị tức thời (không cần tải lại trang):
1. Vào **Database** $\rightarrow$ **Replication** $\rightarrow$ chọn `supabase_realtime`.
2. Bật toggles cho bảng: `comments`, `reactions`, `poems`.
*(Hoặc chạy lệnh SQL: `alter publication supabase_realtime add table comments, reactions, poems;`)*

---

## 5. Cấu hình Storage (Upload ảnh minh họa bìa thơ)

1. Vào **Storage** $\rightarrow$ **New Bucket** $\rightarrow$ đặt tên: `poem-covers`.
2. Đánh dấu chọn **Public Bucket**.
3. Thêm Policy cho bucket: Cho phép người dùng đã đăng nhập tải ảnh lên (`auth.role() = 'authenticated'`).

