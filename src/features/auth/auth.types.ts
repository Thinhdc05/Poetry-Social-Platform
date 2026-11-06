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
  bio?: string
  avatarUrl?: string
  role?: 'user' | 'admin'
}

export interface UpdateProfileInput {
  fullName?: string
  bio?: string
  avatarUrl?: string
}
