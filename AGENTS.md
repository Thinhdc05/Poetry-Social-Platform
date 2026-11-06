# Quy tắc hỗ trợ người dùng (Coding Mentorship Mode)

1. **Người dùng tự tay gõ code**:
   - Trừ khi người dùng nói rõ "viết vào file giúp tôi" hoặc yêu cầu tạo file tự động, tuyệt đối KHÔNG tự ý ghi code vào các file triển khai của dự án (`src/...`).
   - Luôn trả file mã nguồn về trạng thái để người dùng tự gõ.

2. **Quy trình dẫn dắt tư duy trong mỗi bước**:
   - **Mục tiêu**: Chúng ta đang chuẩn bị làm gì và vì sao cần nó?
   - **Dẫn dắt tư duy**: "À, như vậy chúng ta cần... Vì sao cần cấu trúc như vậy?"
   - **Hành động cụ thể**: Mở file nào, cần tạo interface/function nào, các trường dữ liệu gồm những gì và ý nghĩa của từng trường.
   - **Gợi ý & Code tham khảo**: Để người dùng tự viết trước, kèm theo block code tham khảo nếu người dùng chưa nghĩ ra hoặc muốn đối chiếu.

---

# QUY CHUẨN CODE (Bắt buộc áp dụng cho mọi thay đổi)

## 1. Nguyên tắc tách lớp
Mỗi file chỉ làm MỘT trách nhiệm duy nhất:
- **Component (`.tsx`)**: CHỈ render JSX và nhận props. Không gọi API, không xử lý nghiệp vụ, không biến đổi dữ liệu phức tạp, không viết logic dài dòng trong JSX.
- **Hook (`use*.ts`)**: Chứa toàn bộ state, side-effects, điều phối dữ liệu.
- **API layer (`*.api.ts`)**: Nơi DUY NHẤT gọi Supabase/HTTP. Component và hook không import Supabase client trực tiếp.
- **Utils/helpers (`*.utils.ts`)**: Hàm thuần (pure function), độc lập, dễ test.
- **Types (`*.types.ts`)**: Type/interface dùng chung. CẤM dùng `any`.
- **Constants (`*.constants.ts`)**: Không hard-code chuỗi/số "ma thuật" (magic numbers/strings) rải rác trong code.

## 2. Cấu trúc thư mục (Feature-based)
```text
src/
  app/            # router, providers, cấu hình khởi tạo app
  features/<tên-feature>/
    components/   # UI riêng của feature
    hooks/        # logic / custom hooks riêng của feature
    <tên>.api.ts
    <tên>.types.ts
    <tên>.utils.ts
    index.ts      # public API: chỉ export những gì bên ngoài được phép dùng
  components/ui/  # UI dùng chung (atoms/primitives), KHÔNG chứa nghiệp vụ
  components/layout/ # Header, Footer, Sidebar, Navigation...
  pages/          # Mỏng: chỉ ghép các feature lại theo route, không chứa logic nặng
  hooks/ lib/ utils/ types/ # phần dùng chung toàn ứng dụng
```
**Quy tắc phụ thuộc**: `pages` -> `features` -> `components/ui`, `lib`. Feature không import chéo trực tiếp vào nội bộ file của feature khác, chỉ được phép qua `index.ts`.

## 3. Tái sử dụng (Có kiểm soát)
- Lặp lại lần 1: viết bình thường. Lần 2: chấp nhận lặp. Lần 3: mới tách ra dùng chung. Không trừu tượng hóa sớm (No premature abstraction).
- Component UI dùng chung phải nhận dữ liệu qua props, hỗ trợ `className`, ưu tiên kỹ thuật composition (children / slots / compound components từ `vercel-composition-patterns`) thay vì nhồi nhét boolean props.
- Style dùng design tokens (biến màu sắc, khoảng cách spacing, font), không hard-code giá trị tùy tiện.

## 4. Tiêu chuẩn chất lượng
- **TypeScript strict**: Khai báo type rõ ràng cho props, giá trị trả về của hook, kiểu dữ liệu API. Không dùng `any`.
- **Đủ 3 trạng thái**: Mọi luồng dữ liệu bất đồng bộ phải xử lý đủ 3 trạng thái: `loading` / `error` / `empty`.
- **Đặt tên rõ nghĩa**: Tên hàm là động từ, boolean bắt đầu bằng `is`, `has`, `can`.
- **Giới hạn kích thước file**: Mỗi file nên < ~150 dòng; mỗi hàm chỉ làm một việc rõ ràng. Nếu file quá dài phải chia nhỏ.
- **Accessibility cơ bản**: Dùng thẻ HTML ngữ nghĩa (semantic tags), nhãn label, focus states, alt text cho ảnh.
- **Comment chuẩn mực**: Không comment giải thích điều mà code đã nói rõ; chỉ comment lý do "tại sao" (why, not what).

## 5. Quy trình làm việc
1. Đọc cấu trúc và các file liên quan TRƯỚC khi đưa ra đề xuất.
2. Nêu ngắn gọn kế hoạch: file nào tạo/sửa, vì sao.
3. Làm theo phạm vi nhỏ, không sửa hay làm lan sang việc ngoài yêu cầu.
4. Chạy `npm run build` (và lint/test nếu có), kiểm tra đến khi sạch lỗi.
5. Báo cáo: file đã thay đổi, việc đã xong, lệnh đã chạy, việc còn lại.
*Lưu ý*: Tuyệt đối không tự ý cài thư viện mới, không đổi công nghệ, không đổi schema nếu chưa hỏi và giải thích rõ. Nếu có nhiều hướng xử lý hợp lý, hỏi trước.

## 6. Tự kiểm tra (Checklist trước khi báo xong)
- Có logic nghiệp vụ hoặc lệnh gọi API nào còn nằm lẫn trong JSX không?
- Có đoạn code nào lặp lại lần thứ 3 chưa được tách không?
- Có biến `any`, magic value, hay import chéo trực tiếp ruột feature không?
- File và thư mục có tuân thủ đúng cấu trúc Feature-based ở Mục 2 không?

---

# THƠ MỘC — PROJECT GUIDELINES & THẨM MỸ (DESIGN SYSTEM)

## 1. Bản sắc dự án (Brand Identity & Context)
- Thơ Mộc là website chia sẻ thơ ca tiếng Việt được xây dựng với React, TypeScript, Vite và Supabase.
- Không gian giao diện phải mang lại cảm giác: **mộc mạc, văn chương, bình yên, lắng đọng và giàu chất thơ**.
- **KHÔNG PHẢI** là một SaaS dashboard, landing page khởi nghiệp công nghệ hay giao diện admin khô khan.

## 2. Kích hoạt & Ứng dụng các Skills đã cài đặt
Tận dụng các skill trong `.agents/skills/` vào từng bối cảnh cụ thể:
- **`design-taste-frontend` & `impeccable`**:
  - Tránh triệt để các vết tích "AI template slop": cấm dùng gradient tím/xanh generic, cấm lạm dụng bo góc tròn trịa bóng bẩy quá đà, cấm các hiệu ứng hoạt họa màu mè vô nghĩa.
  - Mỗi trang phải có phong cách và nhịp điệu riêng, không áp dụng một khuôn layout cứng nhắc cho mọi trang.
  - Ngôn ngữ chính là **Tiếng Việt**.
  - Nội dung thơ phải luôn là trung tâm: giữ nguyên vẹn ngắt dòng (`whitespace-pre-line`), khoảng cách khổ thơ trang nhã, typography kiểu serif hoặc font chữ dễ đọc, êm ái trên mắt người đọc.
- **`ui-ux-pro-max` & `ui-styling`**:
  - Lựa chọn bảng màu tông ấm, mộc (màu giấy dó, be trầm, nâu gỗ, mực đen ấm, xám khói, xanh rêu dịu).
  - Tận dụng Tailwind CSS utility và Radix/shadcn primitives cho tương tác mượt mà, đúng chuẩn a11y.
- **`vercel-composition-patterns` & `vercel-react-best-practices`**:
  - Viết component React theo lối ghép nối linh hoạt (composition), quản lý state tinh gọn, tránh re-render thừa.
- **`gsap-framer-scroll-animation`**:
  - Nếu có animation, chỉ dùng những chuyển động tinh tế, êm nhẹ (fade mờ uyển chuyển, cuộn trang trầm mặc như lật từng trang sách). Không dùng hiệu ứng giật gân, rung lắc hay lòe loẹt.

## 3. Supabase & Bảo mật
- Chỉ kết nối Supabase khi nhiệm vụ hiện tại yêu cầu.
- Tuyệt đối không in, không đọc to và không commit các khóa bí mật trong `.env.local`.
- Không tự ý thay đổi database schema hoặc Row Level Security (RLS) policies nếu chưa giải thích và được đồng ý.
