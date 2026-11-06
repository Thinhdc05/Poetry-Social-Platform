-- ==============================================================================
-- THƠ MỘC - SCHEMA & SECURITY MIGRATION V2 (ĐÃ BỔ SUNG HÀM IS_ADMIN & TỰ ĐỘNG KHỞI TẠO)
-- Tăng cường bảo mật: Chặn leo thang quyền role, bảo vệ bài thơ riêng tư,
-- chuẩn hóa bảng Dữ liệu thực tế: Likes, Bookmarks, Highlights, Marginalia, Duels,
-- Chuẩn hóa Tác giả (Authors), Báo cáo bản quyền (Reports), Trà Thất bảo mật.
-- ==============================================================================

-- 0. ĐẢM BẢO BẢNG PROFILES ĐỦ CỘT & ĐỊNH NGHĨA HÀM KIỂM TRA QUYỀN ADMIN (IS_ADMIN)
alter table public.profiles add column if not exists role text not null default 'USER';
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text default '📜';
alter table public.profiles add column if not exists display_name text default 'Người yêu chữ';
alter table public.profiles add column if not exists full_name text;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and upper(coalesce(role, '')) = 'ADMIN'
  );
$$;

-- 1. BẢO VỆ BẢNG PROFILES: CHẶN LEO THANG QUYỀN (PRIVILEGE ESCALATION)
-- Ngăn người dùng thông thường tự ý đổi cột `role` thành 'ADMIN' khi update profile.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Nếu role bị thay đổi và người thực hiện không phải admin hoặc service_role
  if (new.role is distinct from old.role) then
    if not (public.is_admin() or current_user = 'service_role') then
      -- Giữ nguyên role cũ của người dùng
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_protect_profile_role on public.profiles;
create trigger tr_protect_profile_role
before update on public.profiles
for each row
execute function public.protect_profile_role();

-- 2. BẢO VỆ BẢNG POEMS: THÊM CỘT `is_public` & CẬP NHẬT RLS
alter table public.poems add column if not exists is_public boolean not null default true;
alter table public.poems add column if not exists curator_name text;
alter table public.poems add column if not exists author_type text default 'original';
alter table public.poems add column if not exists source_citation text; -- Nguồn trích / nhà xuất bản
alter table public.poems add column if not exists likes_count int not null default 0;
alter table public.poems add column if not exists views_count int not null default 0;

-- Cập nhật policy SELECT cho poems:
-- Khách và thành viên chỉ đọc được bài công khai (is_public = true).
-- Bài riêng tư (is_public = false) CHỈ chủ nhân (author_id) hoặc ADMIN mới đọc được.
drop policy if exists "Anyone can view poems" on public.poems;
drop policy if exists "Public poems are viewable by everyone" on public.poems;
create policy "Public poems are viewable by everyone"
on public.poems
for select
using (
  is_public = true
  or (auth.uid() is not null and auth.uid() = author_id)
  or public.is_admin()
);

-- 3. BẢNG TRI ÂM (POEM_LIKES)
create table if not exists public.poem_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  poem_id uuid not null references public.poems(id) on delete cascade,
  reaction_type text not null default 'heart',
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);
alter table public.poem_likes enable row level security;

drop policy if exists "Mọi người có thể xem lượt thích" on public.poem_likes;
create policy "Mọi người có thể xem lượt thích" on public.poem_likes for select using (true);

drop policy if exists "Người dùng có thể thích bài thơ" on public.poem_likes;
create policy "Người dùng có thể thích bài thơ" on public.poem_likes for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Người dùng có thể bỏ thích bài thơ" on public.poem_likes;
create policy "Người dùng có thể bỏ thích bài thơ" on public.poem_likes for delete to authenticated using (auth.uid() = user_id);

-- Trigger đồng bộ likes_count vào bảng poems
create or replace function public.sync_poem_likes_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update public.poems set likes_count = likes_count + 1 where id = new.poem_id;
  elsif tg_op = 'DELETE' then
    update public.poems set likes_count = greatest(0, likes_count - 1) where id = old.poem_id;
  end if;
  return null;
end;
$$;

drop trigger if exists tr_sync_poem_likes on public.poem_likes;
create trigger tr_sync_poem_likes
after insert or delete on public.poem_likes
for each row execute function public.sync_poem_likes_count();

-- 4. BẢNG SỔ TAY LƯU THƠ (POEM_BOOKMARKS)
create table if not exists public.poem_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  poem_id uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);
alter table public.poem_bookmarks enable row level security;

drop policy if exists "Chủ nhân xem sổ tay của mình" on public.poem_bookmarks;
create policy "Chủ nhân xem sổ tay của mình" on public.poem_bookmarks for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Chủ nhân thêm bài vào sổ tay" on public.poem_bookmarks;
create policy "Chủ nhân thêm bài vào sổ tay" on public.poem_bookmarks for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Chủ nhân xóa bài khỏi sổ tay" on public.poem_bookmarks;
create policy "Chủ nhân xóa bài khỏi sổ tay" on public.poem_bookmarks for delete to authenticated using (auth.uid() = user_id);

-- 5. BẢNG CÂU THƠ GẠCH CHÂN TÂM ĐẮC (VERSE_HIGHLIGHTS)
create table if not exists public.verse_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  poem_id uuid not null references public.poems(id) on delete cascade,
  line_index int not null,
  line_text text not null,
  created_at timestamptz not null default now(),
  unique(user_id, poem_id, line_index)
);
alter table public.verse_highlights enable row level security;

drop policy if exists "Chủ nhân xem và quản lý câu gạch chân" on public.verse_highlights;
create policy "Chủ nhân xem và quản lý câu gạch chân" on public.verse_highlights for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Mọi người xem câu gạch chân để thống kê" on public.verse_highlights;
create policy "Mọi người xem câu gạch chân để thống kê" on public.verse_highlights for select using (true);

-- 6. BẢNG CHÚ GIẢI LỀ SÁCH (MARGINALIA_NOTES)
create table if not exists public.marginalia_notes (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  line_index int not null,
  line_text text not null,
  content text not null check (char_length(content) between 1 and 2000),
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.marginalia_notes enable row level security;

drop policy if exists "Xem chú giải công khai hoặc chú giải riêng tư của chính mình" on public.marginalia_notes;
create policy "Xem chú giải công khai hoặc chú giải riêng tư của chính mình"
on public.marginalia_notes for select
using (
  is_private = false
  or (auth.uid() is not null and auth.uid() = user_id)
  or public.is_admin()
);

drop policy if exists "Thêm chú giải lề sách" on public.marginalia_notes;
create policy "Thêm chú giải lề sách"
on public.marginalia_notes for insert
with check (
  (auth.uid() is null and is_private = false)
  or (auth.uid() is not null and auth.uid() = user_id)
);

drop policy if exists "Chủ nhân xóa chú giải của mình" on public.marginalia_notes;
create policy "Chủ nhân xóa chú giải của mình"
on public.marginalia_notes for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

-- 7. BẢNG THƠ HỌA ĐÁP (POEM_RESPONSES)
create table if not exists public.poem_responses (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  title text,
  content text not null check (char_length(content) between 1 and 5000),
  rhyme_note text default 'Thơ họa đáp',
  is_author_endorsed boolean not null default false,
  likes_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.poem_responses enable row level security;

drop policy if exists "Mọi người có thể đọc thơ họa đáp" on public.poem_responses;
create policy "Mọi người có thể đọc thơ họa đáp" on public.poem_responses for select using (true);

drop policy if exists "Đăng thơ họa đáp" on public.poem_responses;
create policy "Đăng thơ họa đáp" on public.poem_responses for insert with check (
  auth.uid() is null or auth.uid() = author_id
);

drop policy if exists "Tác giả bài thơ hoặc admin duyệt điểm xuyết bài họa" on public.poem_responses;
create policy "Tác giả bài thơ hoặc admin duyệt điểm xuyết bài họa"
on public.poem_responses for update
to authenticated
using (
  exists (select 1 from public.poems where id = poem_id and author_id = auth.uid())
  or author_id = auth.uid()
  or public.is_admin()
);

-- 8. BẢNG TRÀ THẤT BẢO MẬT (LOUNGE_MESSAGES)
create table if not exists public.lounge_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null,
  sender_seal text default '📜',
  content text not null check (char_length(content) between 1 and 500),
  msg_type text default 'chat',
  created_at timestamptz not null default now()
);
alter table public.lounge_messages enable row level security;

drop policy if exists "Mọi người đều có thể đọc tin nhắn trà thất" on public.lounge_messages;
create policy "Mọi người đều có thể đọc tin nhắn trà thất" on public.lounge_messages for select using (true);

drop policy if exists "Chỉ thi hữu đã gia nhập mới được gửi tin nhắn" on public.lounge_messages;
create policy "Chỉ thi hữu đã gia nhập mới được gửi tin nhắn"
on public.lounge_messages for insert
to authenticated
with check (auth.uid() = user_id);

-- Trigger tự động điền sender_name từ profiles để chống giả danh
create or replace function public.sanitize_lounge_message()
returns trigger language plpgsql security definer as $$
begin
  new.user_id := auth.uid();
  select coalesce(full_name, display_name, 'Thi hữu tri âm') into new.sender_name
  from public.profiles where id = auth.uid();
  return new;
end;
$$;

drop trigger if exists tr_sanitize_lounge on public.lounge_messages;
create trigger tr_sanitize_lounge
before insert on public.lounge_messages
for each row execute function public.sanitize_lounge_message();

-- Bật Realtime cho lounge_messages an toàn (kiểm tra tồn tại trước khi add)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'lounge_messages'
  ) then
    alter publication supabase_realtime add table public.lounge_messages;
  end if;
end;
$$;

-- 9. BẢNG TÁC GIẢ CHUẨN HÓA CÓ SLUG & BẢO HỘ (AUTHORS)
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  period text, -- Thời kỳ: Cổ điển, Thơ Mới (1932-1945), Kháng chiến, Đương đại
  birth_year int,
  death_year int,
  is_public_domain boolean default false, -- Hết hạn bảo hộ quyền tác sản (>50 năm)
  bio text,
  created_at timestamptz not null default now()
);
alter table public.authors enable row level security;

drop policy if exists "Mọi người đều có thể xem tác giả" on public.authors;
create policy "Mọi người đều có thể xem tác giả" on public.authors for select using (true);

drop policy if exists "Chỉ admin mới được thêm/sửa tác giả lịch sử" on public.authors;
create policy "Chỉ admin mới được thêm/sửa tác giả lịch sử"
on public.authors for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Dữ liệu mẫu một số thi nhân lịch sử
insert into public.authors (name, slug, period, birth_year, death_year, is_public_domain, bio)
values
  ('Hàn Mặc Tử', 'han-mac-tu', 'Thơ Mới (1932-1945)', 1912, 1940, true, 'Nhà thơ tài hoa của phong trào Thơ Mới, tác giả bài Đây Thôn Vĩ Dạ.'),
  ('Nguyễn Bính', 'nguyen-binh', 'Thơ Mới (1932-1945)', 1918, 1966, true, 'Thi sĩ chân quê, tác giả Mưa xuân, Chân quê.'),
  ('Xuân Diệu', 'xuan-dieu', 'Thơ Mới (1932-1945)', 1916, 1985, false, 'Nhà thơ mới nhất trong các nhà thơ mới, hoàng tử thơ tình.'),
  ('Xuân Quỳnh', 'xuan-quynh', 'Hiện đại', 1942, 1988, false, 'Nữ thi sĩ tiêu biểu với Sóng, Thuyền và Biển, Tiếng gà trưa.'),
  ('Quang Dũng', 'quang-dung', 'Kháng chiến', 1921, 1988, false, 'Tác giả Tây Tiến lẫy lừng của nền thơ kháng chiến.')
on conflict (slug) do nothing;

-- 10. BẢNG BÁO CÁO VI PHẠM & BẢN QUYỀN (POEM_REPORTS)
create table if not exists public.poem_reports (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null, -- copyright, inappropriate, spam, other
  details text,
  status text not null default 'pending', -- pending, reviewed, resolved, rejected
  created_at timestamptz not null default now()
);
alter table public.poem_reports enable row level security;

drop policy if exists "Mọi người có thể gửi báo cáo" on public.poem_reports;
create policy "Mọi người có thể gửi báo cáo" on public.poem_reports for insert with check (true);

drop policy if exists "Chỉ admin mới được xem danh sách báo cáo" on public.poem_reports;
create policy "Chỉ admin mới được xem danh sách báo cáo" on public.poem_reports for select using (public.is_admin());

-- Tải lại cấu hình schema của PostgREST
notify pgrst, 'reload schema';
