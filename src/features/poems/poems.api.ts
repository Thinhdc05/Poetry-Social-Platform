import type { Poem } from "./poems.types";

export const MOCK_POEMS: Poem[] = [
  {
    id: "1",
    title: "Sóng",
    author: "Xuân Quỳnh",
    createdAt: "2026-03-01",
    excerpt: "Dữ dội và dịu êm\nỒn ào và lặng lẽ...",
    content: `Dữ dội và dịu êm
Ồn ào và lặng lẽ
Sông không hiểu nổi mình
Sóng tìm ra tận bể

Ôi con sóng ngày xưa
Và ngày sau vẫn thế
Nỗi khát vọng tình yêu
Bồi hồi trong ngực trẻ`,
  },
  {
    id: "2",
    title: "Mùa xuân nho nhỏ",
    author: "Thanh Hải",
    createdAt: "2026-03-02",
    excerpt: "Mọc giữa dòng sông xanh\nMột bông hoa tím biếc...",
    content: `Mọc giữa dòng sông xanh
Một bông hoa tím biếc
Ơi con chim chiền chiện
Hót chi mà vang trời
Từng giọt long lanh rơi
Tôi đưa tay tôi hứng.`,
  },
  {
    id: "3",
    title: "Tràng giang",
    author: "Huy Cận",
    createdAt: "2026-03-03",
    excerpt:
      "Sóng gợn tràng giang buồn điệp điệp\nCon thuyền xuôi mái nước song song...",
    content: `Sóng gợn tràng giang buồn điệp điệp
Con thuyền xuôi mái nước song song
Thuyền về nước lại, sầu trăm ngả
Củi một cành khô lạc mấy dòng.`,
  },
];

export function getMockPoems(): Poem[] {
  return MOCK_POEMS;
}

export function getMockPoemById(id: string): Poem | undefined {
  return MOCK_POEMS.find((poem) => poem.id === id);
}
