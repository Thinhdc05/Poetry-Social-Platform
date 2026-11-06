-- ====================================================================
-- THƠ MỘC: BỘ DỮ LIỆU SEED MẪU (3 THI NHÂN, 18 THI PHẨM, TƯƠNG TÁC CHÉO)
-- Tác giả: Thơ Mộc Database Team
-- Hướng dẫn: Copy toàn bộ nội dung file này và chạy trong Supabase SQL Editor
-- ====================================================================

create extension if not exists pgcrypto;

-- 1. TẠO 3 TÀI KHOẢN NGƯỜI DÙNG TRONG AUTH.USERS
-- Mật khẩu chung của cả 3 tài khoản là: ThoMoc2026@
-- (Được mã hóa bằng hàm crypt và gen_salt bf của Postgres)

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token,
  is_sso_user,
  created_at,
  updated_at
) values
(
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tuxuong@thomoc.vn',
  crypt('ThoMoc2026@', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Tú Xương Hài Hước","full_name":"Tú Xương Hài Hước"}',
  '', '', '', '', '', '', '', '', false,
  now(),
  now()
),
(
  'a2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'butche@thomoc.vn',
  crypt('ThoMoc2026@', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Thi Sĩ Bút Chế","full_name":"Thi Sĩ Bút Chế"}',
  '', '', '', '', '', '', '', '', false,
  now(),
  now()
),
(
  'a3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'hadong@thomoc.vn',
  crypt('ThoMoc2026@', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Hà Đông Khách Thơ","full_name":"Hà Đông Khách Thơ"}',
  '', '', '', '', '', '', '', '', false,
  now(),
  now()
)
on conflict (id) do update set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_user_meta_data = excluded.raw_user_meta_data,
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  email_change = '',
  phone_change = '',
  phone_change_token = '',
  reauthentication_token = '',
  is_sso_user = false;

-- 1.1 TẠO BẢN GHI ĐỒNG BỘ TRONG AUTH.IDENTITIES (BẮT BUỘC ĐỂ SUPABASE AUTH GOTRUE ĐĂNG NHẬP ĐƯỢC)
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values
(
  'a1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'tuxuong@thomoc.vn'),
  'email',
  'tuxuong@thomoc.vn',
  now(),
  now(),
  now()
),
(
  'a2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', 'a2222222-2222-2222-2222-222222222222', 'email', 'butche@thomoc.vn'),
  'email',
  'butche@thomoc.vn',
  now(),
  now(),
  now()
),
(
  'a3333333-3333-3333-3333-333333333333',
  'a3333333-3333-3333-3333-333333333333',
  jsonb_build_object('sub', 'a3333333-3333-3333-3333-333333333333', 'email', 'hadong@thomoc.vn'),
  'email',
  'hadong@thomoc.vn',
  now(),
  now(),
  now()
)
on conflict (provider, provider_id) do update set
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at;

-- 2. TẠO HỒ SƠ THI NHÂN TRONG PUBLIC.PROFILES
insert into public.profiles (id, display_name, role, bio)
values
(
  'a1111111-1111-1111-1111-111111111111',
  'Tú Xương Hài Hước',
  'USER',
  'Học dốt thi trượt mấy khoa liền, nay lên Thơ Mộc viết thơ cười đời cho đỡ buồn.'
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Thi Sĩ Bút Chế',
  'USER',
  'Ngày cày deadline văn phòng, tối về gõ thơ tình và thơ chế cho quên kiếp tư bản.'
),
(
  'a3333333-3333-3333-3333-333333333333',
  'Hà Đông Khách Thơ',
  'USER',
  'Sợ vợ là đạo làm chồng, đội vợ lên đầu là trường thọ vô biên. Thích cà phê vỉa hè ngắm mưa.'
)
on conflict (id) do update set
  display_name = excluded.display_name,
  bio = excluded.bio;

-- Đảm bảo cả 2 cột full_name và display_name (nếu có) đều đồng bộ
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name') then
    update public.profiles set full_name = display_name where id in (
      'a1111111-1111-1111-1111-111111111111',
      'a2222222-2222-2222-2222-222222222222',
      'a3333333-3333-3333-3333-333333333333'
    );
  end if;
end $$;

-- 3. XÓA BỚT CÁC BÀI THƠ CŨ CỦA 3 USER NÀY NẾU CHẠY LẠI
delete from public.poems where author_id in (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333'
);

-- 4. THÊM 18 BÀI THƠ (MỖI USER 6 BÀI HÀI HƯỚC, CHẾ, VĂN NGHỆ ĐỘC ĐÁO)
insert into public.poems (
  id,
  author_id,
  title,
  content,
  author,
  author_type,
  mood,
  is_public,
  likes_count,
  created_at
) values
-- ===== USER 1: TÚ XƯƠNG HÀI HƯỚC =====
(
  'b0000000-0000-0000-0000-000000000001',
  'a1111111-1111-1111-1111-111111111111',
  'Đêm Ngồi Lướt Phây',
  'Nửa đêm tắt điện lên giường
Tay cầm điện thoại vấn vương nỗi niềm
Lướt phây tìm bóng người quen
Bỗng dưng lạc bước vào xem video

Hết coi múa lửa xiếc mèo
Lại xem livestream chốt kèo bán son
Đến khi gà gáy đầu thôn
Mắt thâm quầng vượn, tâm hồn lơ mơ.',
  'Tú Xương Hài Hước',
  'original',
  'Nỗi nhớ',
  true,
  15,
  now() - interval '6 days'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a1111111-1111-1111-1111-111111111111',
  'Vịnh Tiền Lương Cuối Tháng',
  'Sáng nay tin nhắn báo ting ting
Tài khoản vừa dâng chút ấm tình
Chưa kịp mừng thầm mua bát phở
Tiền nhà, tiền điện giật giật mình

Tiền wifi đến đòi như nợ
Chủ quán đầu ngõ đứng rình rình
Ngoảnh đi ngoảnh lại tiền không thấy
Còn đúng trăm ngàn ngắm bình minh.',
  'Tú Xương Hài Hước',
  'original',
  'Cô đơn',
  true,
  24,
  now() - interval '5 days'
),
(
  'b0000000-0000-0000-0000-000000000003',
  'a1111111-1111-1111-1111-111111111111',
  'Mồng Một Đi Xin Quẻ',
  'Đầu năm áo gấm đi đền
Rút một quẻ bói xem duyên thế nào
Thầy nhìn quẻ phán xôn xao:
"Số con đào hoa dạt dào như sông!"

Con mừng con hỏi: "Có không?"
Thầy cười tủm tỉm: "Chờ đông năm nào...
Hoa rơi cửa Phật ngọt ngào
Năm nay ế tiếp, chớ gào làm chi!"',
  'Tú Xương Hài Hước',
  'original',
  'Tĩnh lặng',
  true,
  18,
  now() - interval '4 days'
),
(
  'b0000000-0000-0000-0000-000000000004',
  'a1111111-1111-1111-1111-111111111111',
  'Thi Bằng Lái Xe',
  'Trời sinh ta vốn chữ văn hay
Mỗi tội sa hình lái chẳng may
Nhấp nhổm vào chuồng de lệch bánh
Lùi xe chạm vạch mất toi tay

Giám khảo ngồi bên liền khẽ lắc:
"Xuống đi em hỡi hẹn tuần sau!"
Ta về ngậm đắng nhìn xe máy
Chân đạp số lùi dạ xót đau.',
  'Tú Xương Hài Hước',
  'original',
  'Hoài niệm',
  true,
  12,
  now() - interval '3 days'
),
(
  'b0000000-0000-0000-0000-000000000005',
  'a1111111-1111-1111-1111-111111111111',
  'Bát Phở Không Hành',
  'Dẫn nàng đi dạo phố ban trưa
Tạt vào quán phở dưới cơn mưa
Nàng kêu một bát thơm lừng nước
Dặn khẽ: "Cho em phở không hành!"

Chủ quán trố mắt nhìn nàng mãi
Ta ngồi ngơ ngác nuốt không trôi
Yêu nhau chín núi mười con suối
Không ăn cọng hành... vỡ mộng tôi!',
  'Tú Xương Hài Hước',
  'original',
  'Bình yên',
  true,
  31,
  now() - interval '2 days'
),
(
  'b0000000-0000-0000-0000-000000000006',
  'a1111111-1111-1111-1111-111111111111',
  'Thơ Chúc Sếp Cuối Năm',
  'Năm hết Tết sang dạ nôn nao
Nhìn sếp hiền từ mắt sáng sao
Em chúc sếp ta thêm sức khỏe
Lợi nhuận công ty ngút đỉnh cao

Nhưng nhớ mở hầu bao rực rỡ
Thưởng thêm cho chúng em dăm hào
Để em mua yến mua đào tết
Sang năm cày tiếp... khỏi lao đao!',
  'Tú Xương Hài Hước',
  'original',
  'Tình yêu',
  true,
  19,
  now() - interval '1 day'
),

-- ===== USER 2: THI SĨ BÚT CHẾ =====
(
  'b0000000-0000-0000-0000-000000000007',
  'a2222222-2222-2222-2222-222222222222',
  'Chạy Deadline Đêm Mưa',
  'Đêm mưa rả rích gõ hiên ngoài
Bàn phím gõ lách cách mệt nhoài
Màn hình chớp tắt dòng code đỏ
Sửa một dòng bug đẻ gấp hai

Mười hai giờ đêm sếp nhắn hỏi:
"Xong chưa em hỡi để mai release?"
Ta ngước nhìn trời than một tiếng:
"Em đang sửa gấp... sếp ngủ đi!"',
  'Thi Sĩ Bút Chế',
  'original',
  'Mưa rơi',
  true,
  42,
  now() - interval '5 days'
),
(
  'b0000000-0000-0000-0000-000000000008',
  'a2222222-2222-2222-2222-222222222222',
  'Kẹt Xe Giờ Tan Tầm',
  'Ngã tư Hàng Xanh khói mịt mùng
Người xe chen chúc bước dùng dằng
Trời thu se lạnh lòng như lửa
Đèn đỏ ba giây đứng ngập ngừng

Đứng giữa dòng đời nhìn ngơ ngẩn
Mùi khói bốc lên ngỡ sương giăng
Nửa tiếng đi được vài mét đất
Về tới nhà xong hóa hóa thân!',
  'Thi Sĩ Bút Chế',
  'original',
  'Mùa thu',
  true,
  16,
  now() - interval '4 days'
),
(
  'b0000000-0000-0000-0000-000000000009',
  'a2222222-2222-2222-2222-222222222222',
  'Hỏi Em Mấy Độ Trăng Rằm',
  'Nhắn một tin yêu gửi tới nàng
Từ lúc hoàng hôn đổ bóng vàng
Đợi mãi trăng lên rồi trăng lặn
Sáng hôm sau thấy chữ: "Seen" ngang

Em bảo em bận đi tắm gội
Nước chảy mười hai tiếng chưa tan
Hỡi ôi tình ảo thời công nghệ
Một chữ "Seen" thôi vỡ mộng trần!',
  'Thi Sĩ Bút Chế',
  'original',
  'Tình yêu',
  true,
  28,
  now() - interval '3 days'
),
(
  'b0000000-0000-0000-0000-000000000010',
  'a2222222-2222-2222-2222-222222222222',
  'Mùa Đông Không Lạnh',
  'Người ta có gấu để ôm ấp
Nắm tay dạo bước dưới mưa đông
Còn ta có chiếc chăn hoa mỏng
Kéo kín từ chân tới tận đầu

Độc thân sướng thế ai nào hiểu
Khỏi tốn tiền hoa, khỏi nhọc sầu
Gió bắc lạnh lùng thôi mặc kệ
Nằm lướt TikTok ấm làm sao!',
  'Thi Sĩ Bút Chế',
  'original',
  'Cô đơn',
  true,
  22,
  now() - interval '2 days'
),
(
  'b0000000-0000-0000-0000-000000000011',
  'a2222222-2222-2222-2222-222222222222',
  'Gửi Cô Gái Trà Sữa',
  'Mỗi ngày một cốc size khổng lồ
Bảy mươi phần đường, đá nhấp nhô
Trân châu đen trắng nhai sần sật
Kem cheese béo ngậy dạ ngẩn ngơ

Nàng bảo: "Hôm nay em giảm béo
Chỉ uống trà xanh giữ nét ngà!"
Nhưng vừa tạt qua tiệm đồ ngọt
Lại gọi full topping... hỡi người ta!',
  'Thi Sĩ Bút Chế',
  'original',
  'Bình yên',
  true,
  35,
  now() - interval '1 day'
),
(
  'b0000000-0000-0000-0000-000000000012',
  'a2222222-2222-2222-2222-222222222222',
  'Thảm Họa Cắt Tóc',
  'Cầm ảnh tài tử xứ Hàn sang
Gặp anh thợ kéo miệng rộn ràng:
"Cắt y như mẫu em đừng ngại
Đẹp trai ngời ngợi gái xin hàng!"

Kéo lia thoăn thoắt chừng mươi phút
Mở mắt nhìn gương lệ trào dâng
Tài tử Hàn đâu ta chẳng thấy
Chỉ thấy đầu đinh... giống sư thầy!',
  'Thi Sĩ Bút Chế',
  'original',
  'Nỗi nhớ',
  true,
  39,
  now() - interval '12 hours'
),

-- ===== USER 3: HÀ ĐÔNG KHÁCH THƠ =====
(
  'b0000000-0000-0000-0000-000000000013',
  'a3333333-3333-3333-3333-333333333333',
  'Vịnh Vợ Cả Sư Tử Hà Đông',
  'Kính vợ muôn đời được sống lâu
Đội vợ lên đầu khỏi nhức đầu
Vợ bảo đi đông đừng đi bắc
Vợ sai quét bếp chớ càu nhàu

Ra đường ta quát mười con cọp
Về nhà vợ quắc dạ run run
Tiền lương nộp đủ không thiếu cắc
Ăn bát cơm chan thấy ngọt ngào!',
  'Hà Đông Khách Thơ',
  'original',
  'Tĩnh lặng',
  true,
  58,
  now() - interval '5 days'
),
(
  'b0000000-0000-0000-0000-000000000014',
  'a3333333-3333-3333-3333-333333333333',
  'Rửa Bát Đêm Đông',
  'Gió mùa đông bắc thổi qua sân
Một đống mâm bát đứng tần ngần
Găng tay cao su cầm trơn tuột
Nước rửa bát tràn bọt trắng ngần

Vợ ngồi xem phim cười khúc khích
Chồng đứng cọ xoong dạ bùi ngùi
Nồi canh cá kho dính chặt đáy
Cọ mòn đôi móng... lệ ngậm ngùi!',
  'Hà Đông Khách Thơ',
  'original',
  'Mùa thu',
  true,
  27,
  now() - interval '4 days'
),
(
  'b0000000-0000-0000-0000-000000000015',
  'a3333333-3333-3333-3333-333333333333',
  'Cà Phê Sáng Vỉa Hè',
  'Góc phố rêu phong bóng nắng tràn
Bàn con ghế nhựa gió mơn man
Giọt nâu tí tách rơi đều đặn
Khói thuốc mơ màng dạ thênh thang

Đời người bon chen chi cho mệt
Một ly đen đá cũng thanh nhàn
Ngắm người qua lại lòng thanh thản
Mặc kệ ngoài kia sóng dập dồn.',
  'Hà Đông Khách Thơ',
  'original',
  'Bình yên',
  true,
  33,
  now() - interval '3 days'
),
(
  'b0000000-0000-0000-0000-000000000016',
  'a3333333-3333-3333-3333-333333333333',
  'Hẹn Bạn Nhậu Chiều Mưa',
  'Chiều mưa điện thoại réo liên hồi
"Mồi ngon rượu ấm đã lên rồi
Thiếu mỗi mình ông bên bàn nhậu
Mau mau phi tới kẻo tàn thôi!"

Ta nhắn: "Chờ tôi dăm ba phút
Đang xin quota vợ ở nhà!"
Nhưng vợ bảo: "Ngoan ngồi quét nhà
Bước chân ra ngõ... mất nóc nha!"',
  'Hà Đông Khách Thơ',
  'original',
  'Mưa rơi',
  true,
  45,
  now() - interval '2 days'
),
(
  'b0000000-0000-0000-0000-000000000017',
  'a3333333-3333-3333-3333-333333333333',
  'Nhớ Tuổi Thơ Bắt Dế',
  'Những chiều xưa cũ nắng vàng hoe
Rủ nhau ra bãi trốn trưa hè
Đào hang bắt dế chọi bờ cỏ
Bùn đất lem nhem vẫn mỉm cười

Dế gáy trong bao đêm tí tách
Ngủ say mơ giấc mộng thần tiên
Bao năm bươn chải nơi đô hội
Thèm một chiều xưa... đổi trăm vàng!',
  'Hà Đông Khách Thơ',
  'original',
  'Hoài niệm',
  true,
  29,
  now() - interval '1 day'
),
(
  'b0000000-0000-0000-0000-000000000018',
  'a3333333-3333-3333-3333-333333333333',
  'Bình Thơ Đêm Vắng',
  'Đèn dầu le lói trang thơ mộc
Chữ thả vào đêm tiếng ngậm ngùi
Chẳng màng like ảo nơi trần thế
Chỉ cần bạn đọc hé môi cười

Vần gieo mộc mạc như hạt lúa
Ý đọng ngàn năm với đất trời
Đêm nay tri kỷ nâng chung rượu
Họa một câu thơ... ấm nẻo đời!',
  'Hà Đông Khách Thơ',
  'original',
  'Tĩnh lặng',
  true,
  52,
  now() - interval '6 hours'
);

-- 5. LIKE TRI ÂM CHÉO (POEM_LIKES)
-- Xóa like cũ của 3 user để tránh conflict
delete from public.poem_likes where user_id in (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333'
);

insert into public.poem_likes (user_id, poem_id, reaction_type)
values
  -- Tú Xương like bài của Bút Chế và Hà Đông
  ('a1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000007', 'heart'),
  ('a1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000008', 'touch'),
  ('a1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000013', 'heart'),
  ('a1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000014', 'sympathy'),
  ('a1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000018', 'touch'),

  -- Bút Chế like bài của Tú Xương và Hà Đông
  ('a2222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000001', 'touch'),
  ('a2222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000002', 'heart'),
  ('a2222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000005', 'sympathy'),
  ('a2222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000013', 'touch'),
  ('a2222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000016', 'heart'),

  -- Hà Đông like bài của Tú Xương và Bút Chế
  ('a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000002', 'touch'),
  ('a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000003', 'sympathy'),
  ('a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000007', 'heart'),
  ('a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000010', 'sympathy'),
  ('a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000012', 'heart')
on conflict (user_id, poem_id) do update set reaction_type = excluded.reaction_type;

-- 6. BÌNH LUẬN ĐỐI ĐÁP CHÉO (COMMENTS)
delete from public.comments where user_id in (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333'
);

insert into public.comments (poem_id, user_id, content, created_at)
values
  -- Tú Xương bình luận bài "Chạy Deadline Đêm Mưa" của Bút Chế
  (
    'b0000000-0000-0000-0000-000000000007',
    'a1111111-1111-1111-1111-111111111111',
    'Bác viết chuẩn quá, sửa 1 dòng bug mọc 2 dòng lỗi! Đọc mà em rơi cả giọt nước mắt đồng cảm.',
    now() - interval '4 days'
  ),
  -- Hà Đông bình luận bài "Chạy Deadline Đêm Mưa"
  (
    'b0000000-0000-0000-0000-000000000007',
    'a3333333-3333-3333-3333-333333333333',
    'Khuyên bác nên tắt máy đi ngủ, ngày mai tính tiếp, kẻo bạc hết tóc mây!',
    now() - interval '3 days'
  ),

  -- Bút Chế bình luận bài "Vịnh Vợ Cả Sư Tử Hà Đông" của Hà Đông Khách Thơ
  (
    'b0000000-0000-0000-0000-000000000013',
    'a2222222-2222-2222-2222-222222222222',
    'Kính vợ đắc thọ, đội vợ trường sinh! Câu này xứng đáng tạc vào bia đá nghìn năm huynh đài ơi!',
    now() - interval '4 days'
  ),
  -- Tú Xương bình luận bài "Vịnh Vợ Cả Sư Tử Hà Đông"
  (
    'b0000000-0000-0000-0000-000000000013',
    'a1111111-1111-1111-1111-111111111111',
    'Em thấy bóng dáng mình trong từng câu chữ của bác. Ra đường hò hét, về nhà dạ vâng!',
    now() - interval '3 days'
  ),

  -- Bút Chế bình luận bài "Vịnh Tiền Lương Cuối Tháng" của Tú Xương
  (
    'b0000000-0000-0000-0000-000000000002',
    'a2222222-2222-2222-2222-222222222222',
    'Đọc bài của bác mà em phải mở app ngân hàng ra kiểm tra lại tài khoản, đúng y chang còn trăm ngàn!',
    now() - interval '4 days'
  ),
  -- Hà Đông bình luận bài "Vịnh Tiền Lương Cuối Tháng"
  (
    'b0000000-0000-0000-0000-000000000002',
    'a3333333-3333-3333-3333-333333333333',
    'Tiền bạc là phù du, vần thơ mới là bất tử bác ơi. Nay qua em mời ly cà phê vỉa hè!',
    now() - interval '3 days'
  ),

  -- Tú Xương bình luận bài "Thảm Họa Cắt Tóc" của Bút Chế
  (
    'b0000000-0000-0000-0000-000000000012',
    'a1111111-1111-1111-1111-111111111111',
    'Haha, mang ảnh Hyun Bin sang tiệm cắt tóc gội đầu vỉa hè thì ra sư thầy là đúng rồi bác!',
    now() - interval '10 hours'
  ),

  -- Hà Đông bình luận bài "Bát Phở Không Hành" của Tú Xương
  (
    'b0000000-0000-0000-0000-000000000005',
    'a3333333-3333-3333-3333-333333333333',
    'Ăn phở không hành thì mất đi nửa linh hồn ẩm thực Thăng Long rồi. Đồng cảm sâu sắc với nỗi niềm thi sĩ!',
    now() - interval '1 day'
  );

-- 7. SỔ TAY LƯU BÀI THƠ CHÉO (POEM_BOOKMARKS)
delete from public.poem_bookmarks where user_id in (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333'
);

insert into public.poem_bookmarks (user_id, poem_id)
values
  ('a1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000007'),
  ('a1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000013'),
  ('a2222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000002'),
  ('a2222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000018'),
  ('a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000005'),
  ('a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000011')
on conflict (user_id, poem_id) do nothing;

-- 8. THI ĐÀN XƯỚNG HỌA ĐỐI ẨM (POEM_RESPONSES)
delete from public.poem_responses where author_id in (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333'
);

insert into public.poem_responses (
  poem_id,
  author_id,
  author_name,
  title,
  content,
  rhyme_note,
  is_author_endorsed,
  likes_count
) values
(
  'b0000000-0000-0000-0000-000000000007',
  'a1111111-1111-1111-1111-111111111111',
  'Tú Xương Hài Hước',
  'Họa Lại Cảnh Chạy Deadline',
  'Thương bác thức khuya mắt mỏi mòn
Ngồi nhìn màn ảnh khói dần tan
Code kia chưa chạy lòng chưa dứt
Sáng sớm mai vào sếp hỏi han!',
  'Họa nguyên vận mưa - thức đêm cùng bác Bút Chế',
  true,
  9
),
(
  'b0000000-0000-0000-0000-000000000013',
  'a2222222-2222-2222-2222-222222222222',
  'Thi Sĩ Bút Chế',
  'Cảm Tác Đạo Làm Chồng',
  'Nghe lời bác dạy dạ xin ghi
Đội vợ lên đầu bước sợ chi
Tháng tháng lương đưa không giấu giếm
Gia đình hòa thuận vạn điều vui!',
  'Cảm tác bài Vịnh Vợ Cả của huynh đài Hà Đông',
  true,
  14
);

-- 9. GẮN THẺ THƠ CHO CÁC BÀI THƠ (POEM_TAGS)
-- Đảm bảo các thẻ có sẵn trong bảng tags
insert into public.tags (name, slug) values
  ('Hài hước', 'hai-huoc'),
  ('Thơ chế', 'tho-che'),
  ('Lục bát', 'luc-bat'),
  ('Deadline', 'deadline'),
  ('Sợ vợ', 'so-vo'),
  ('Ẩm thực', 'am-thuc'),
  ('Cà phê', 'ca-phe')
on conflict (slug) do nothing;

insert into public.poem_tags (poem_id, tag_id)
select p.id, t.id
from public.poems p
cross join public.tags t
where (p.title like '%Deadline%' and t.slug = 'deadline')
   or (p.title like '%Vợ%' and t.slug = 'so-vo')
   or (p.title like '%Phở%' and t.slug = 'am-thuc')
   or (p.title like '%Cà Phê%' and t.slug = 'ca-phe')
   or (t.slug = 'hai-huoc')
on conflict do nothing;

-- Hoàn tất thông báo
select 'Đã nạp thành công 3 User, 18 Bài Thơ Hài Hước, Like chéo, Bình Luận chéo và Bài Họa!' as ket_qua;
