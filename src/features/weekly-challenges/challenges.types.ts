export interface WeeklyChallenge {
  id: string
  weekNumber: number
  title: string
  subTitle: string
  season: 'Xuân' | 'Hạ' | 'Thu' | 'Đông'
  suggestedMood: string
  prompt: string
  tag: string
}

