export type OracleDomain = 'love' | 'career' | 'peace' | 'nostalgia'

export interface OracleDomainOption {
  key: OracleDomain
  name: string
  icon: string
  description: string
  mood: string
}

export interface PoeticOracleResult {
  id: string
  domain: OracleDomain
  domainLabel: string
  fortuneName: string
  omenType: string
  verses: string
  interpretation: string
  poemId: string
  poemTitle: string
  poemAuthor: string
  drawnAt: string
}

