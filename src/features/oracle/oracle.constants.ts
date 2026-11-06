export interface PoeticOracleCard {
  id: string
  fortuneName: string
  omenType: string
  verses: string
  interpretation: string
  poemId: string
  poemTitle: string
  poemAuthor: string
}

export const POETIC_ORACLE_CARDS: PoeticOracleCard[] = [
  {
    id: 'oracle-1',
    fortuneName: 'Quẻ Hải Triều Vọng Nguyệt',
    omenType: 'Đại Cát • Tình Duyên & Khát Vọng',
    verses: 'Ôi con sóng ngày xưa\nVà ngày sau vẫn thế...',
    interpretation:
      'Những trăn trở trong lòng bạn đều bắt nguồn từ khát vọng chân thành. Cứ kiên định tiến về phía biển lớn, người đồng điệu ắt sẽ gặp nơi cuối chân trời.',
    poemId: '1',
    poemTitle: 'Sóng',
    poemAuthor: 'Xuân Quỳnh',
  },
  {
    id: 'oracle-2',
    fortuneName: 'Quẻ Hoàng Hoa Thu Phong',
    omenType: 'Bình Hòa • Chuyển Mình Đón Mới',
    verses: 'Đây mùa thu tới - mùa thu tới\nVới áo mơ phai dệt lá vàng',
    interpretation:
      'Một chu kỳ cũ đang khép lại nhẹ nhàng như chiếc lá thu rơi. Đừng tiếc nuối những gì đã qua, hãy chuẩn bị tâm thế đón nhận bước ngoặt mới dịu dàng.',
    poemId: '2',
    poemTitle: 'Đây mùa thu tới',
    poemAuthor: 'Xuân Diệu',
  },
  {
    id: 'oracle-3',
    fortuneName: 'Quẻ Tràng Giang Độc Hành',
    omenType: 'Tĩnh Tâm • Quay Về Nội Tại',
    verses: 'Lòng quê dợn dợn vời con nước\nKhông khói hoàng hôn cũng nhớ nhà.',
    interpretation:
      'Giữa dòng đời vạn biến, tâm hồn bạn đang cần một chốn neo đậu bình yên. Hôm nay hãy dành chút thời gian hỏi thăm người thân hoặc lắng nghe chính mình.',
    poemId: '3',
    poemTitle: 'Tràng giang',
    poemAuthor: 'Huy Cận',
  },
  {
    id: 'oracle-4',
    fortuneName: 'Quẻ Dạ Vũ Tri Âm',
    omenType: 'Cát Tường • Tri Kỷ Tương Ngộ',
    verses: 'Phương trời viễn xứ lòng cô quạnh\nNghe tiếng mưa ngân gợi nhớ ai.',
    interpretation:
      'Nỗi cô đơn hôm nay chỉ là khoảng lặng trước khi bạn tìm thấy tri âm. Một cuộc trò chuyện sâu sắc hoặc tin vui từ phương xa đang đến gần.',
    poemId: '4',
    poemTitle: 'Mưa đêm viễn xứ',
    poemAuthor: 'Nguyễn Bính',
  },
  {
    id: 'oracle-5',
    fortuneName: 'Quẻ Thanh Trà Nghinh Dương',
    omenType: 'Thượng Cát • An Nhiên Tự Tại',
    verses: 'Tách trà thơm ngát hương sương đọng\nGác lại âu lo giữa phố xa.',
    interpretation:
      'Mọi muộn phiền rồi sẽ tan như sương sớm dưới ánh nắng hiền hòa. Hôm nay là ngày thuận lợi để bắt đầu ý tưởng mới với tâm thế thong dong.',
    poemId: '5',
    poemTitle: 'Bình yên bên hiên vắng',
    poemAuthor: 'Anh Thơ',
  },
]

