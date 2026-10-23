-- =========================================
-- THƠ MỘC - FULL DATABASE SCHEMA
-- =========================================

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Người yêu chữ',
  avatar_url text,
  role text not null default 'USER',
  created_at timestamptz not null default now()
);

-- 2. Poems
create table if not exists public.poems (
  id uuid primary key default gen_random_uuid(),

  author_id uuid not null
    references public.profiles(id)
    on delete cascade,

  title text not null
    check (char_length(title) between 1 and 160),

  content text not null
    check (char_length(content) between 1 and 10000),

  image_url text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- 3. Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 4. Quan hệ nhiều-nhiều giữa poems và tags
create table if not exists public.poem_tags (
  poem_id uuid not null
    references public.poems(id)
    on delete cascade,

  tag_id uuid not null
    references public.tags(id)
    on delete cascade,

  primary key (poem_id, tag_id)
);

-- 5. Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),

  poem_id uuid not null
    references public.poems(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  content text not null
    check (char_length(content) between 1 and 1000),

  created_at timestamptz not null default now()
);

-- =========================================
-- TRIGGER TỰ TẠO PROFILE KHI ĐĂNG KÝ
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Tạo profile cho các user đã tồn tại
insert into public.profiles (
  id,
  display_name
)
select
  id,
  coalesce(
    raw_user_meta_data->>'display_name',
    split_part(email, '@', 1)
  )
from auth.users
on conflict (id) do nothing;

-- =========================================
-- HÀM KIỂM TRA ADMIN
-- =========================================

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
      and role = 'ADMIN'
  );
$$;

-- =========================================
-- BẬT ROW LEVEL SECURITY
-- =========================================

alter table public.profiles enable row level security;
alter table public.poems enable row level security;
alter table public.tags enable row level security;
alter table public.poem_tags enable row level security;
alter table public.comments enable row level security;

-- =========================================
-- XÓA POLICY CŨ ĐỂ CHẠY LẠI KHÔNG LỖI
-- =========================================

drop policy if exists "Anyone can view profiles" on public.profiles;
drop policy if exists "profiles are public" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;

drop policy if exists "Anyone can view poems" on public.poems;
drop policy if exists "poems are public" on public.poems;
drop policy if exists "Users can create own poems" on public.poems;
drop policy if exists "signed users create poems" on public.poems;
drop policy if exists "Authors can update own poems" on public.poems;
drop policy if exists "owners and admins update poems" on public.poems;
drop policy if exists "Authors can delete own poems" on public.poems;
drop policy if exists "owners and admins delete poems" on public.poems;

drop policy if exists "Anyone can view tags" on public.tags;
drop policy if exists "tags are public" on public.tags;
drop policy if exists "Authenticated users manage tags" on public.tags;
drop policy if exists "signed users manage tags" on public.tags;

drop policy if exists "Anyone can view poem tags" on public.poem_tags;
drop policy if exists "poem tags are public" on public.poem_tags;
drop policy if exists "Authenticated users manage poem tags" on public.poem_tags;
drop policy if exists "signed users manage poem tags" on public.poem_tags;

drop policy if exists "Anyone can view comments" on public.comments;
drop policy if exists "comments are public" on public.comments;
drop policy if exists "Authenticated users create comments" on public.comments;
drop policy if exists "signed users create comments" on public.comments;
drop policy if exists "Users and admins can delete comments" on public.comments;
drop policy if exists "owners and admins delete comments" on public.comments;

-- =========================================
-- POLICY CHO PROFILES
-- =========================================

create policy "Anyone can view profiles"
on public.profiles
for select
using (true);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================================
-- POLICY CHO POEMS
-- =========================================

create policy "Anyone can view poems"
on public.poems
for select
using (true);

create policy "Users can create own poems"
on public.poems
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "Authors and admins can update poems"
on public.poems
for update
to authenticated
using (
  auth.uid() = author_id
  or public.is_admin()
)
with check (
  auth.uid() = author_id
  or public.is_admin()
);

create policy "Authors and admins can delete poems"
on public.poems
for delete
to authenticated
using (
  auth.uid() = author_id
  or public.is_admin()
);

-- =========================================
-- POLICY CHO TAGS
-- =========================================

create policy "Anyone can view tags"
on public.tags
for select
using (true);

create policy "Authenticated users manage tags"
on public.tags
for all
to authenticated
using (true)
with check (true);

-- =========================================
-- POLICY CHO POEM_TAGS
-- =========================================

create policy "Anyone can view poem tags"
on public.poem_tags
for select
using (true);

create policy "Authenticated users manage poem tags"
on public.poem_tags
for all
to authenticated
using (true)
with check (true);

-- =========================================
-- POLICY CHO COMMENTS
-- =========================================

create policy "Anyone can view comments"
on public.comments
for select
using (true);

create policy "Authenticated users create comments"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users and admins can delete comments"
on public.comments
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

-- =========================================
-- INDEXES
-- =========================================

create index if not exists poems_author_id_idx
on public.poems(author_id);

create index if not exists poems_created_at_idx
on public.poems(created_at desc);

create index if not exists poem_tags_tag_id_idx
on public.poem_tags(tag_id);

create index if not exists comments_poem_id_idx
on public.comments(poem_id);

create index if not exists comments_created_at_idx
on public.comments(created_at);

-- =========================================
-- TAG MẪU
-- =========================================

insert into public.tags (name, slug)
values
  ('Tình yêu', 'tinh-yeu'),
  ('Thiên nhiên', 'thien-nhien'),
  ('Quê hương', 'que-huong'),
  ('Tuổi trẻ', 'tuoi-tre'),
  ('Cuộc sống', 'cuoc-song')
on conflict (slug) do nothing;