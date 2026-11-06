export type ReactionType = 'heart' | 'touch' | 'sympathy'

export interface ReactionCounts {
  heart: number
  touch: number
  sympathy: number
  total: number
}

export interface PoemReactionsState {
  counts: ReactionCounts
  userReaction: ReactionType | null
  loading: boolean
  error: string | null
}

