export interface SignUpInput {
  email: string
  password: string
  fullName: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role?: 'user' | 'admin'
}
