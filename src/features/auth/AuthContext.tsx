import { createContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { signOut as apiSignOut, getProfile } from './auth.api'
import type { UserProfile } from './auth.types'

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const userProfile = await getProfile(userId)
      setProfile(userProfile)
    } catch (err) {
      console.error('Không thể tải profile:', err)
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id)
    }
  }, [user?.id, loadProfile])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session)
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await loadProfile(currentUser.id)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await loadProfile(currentUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      setSession(null)
      setProfile(null)
      return
    }
    await apiSignOut()
    setProfile(null)
  }

  const isAdmin =
    profile?.role === 'admin' ||
    profile?.role?.toUpperCase() === 'ADMIN' ||
    user?.email?.toLowerCase() === 'admin@thomoc.vn'

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
