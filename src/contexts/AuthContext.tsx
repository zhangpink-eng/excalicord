import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { auth, db, getSupabase } from "@/services/api/supabase"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Build user object from auth user data (no lock needed)
function buildUserFromAuthUser(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  return {
    id: authUser.id,
    email: authUser.email || "",
    fullName: authUser.user_metadata?.full_name as string | undefined,
    avatarUrl: authUser.user_metadata?.avatar_url as string | undefined,
    subscriptionTier: "free",
    subscriptionStatus: "active",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch profile from database (this is where lock issues can occur)
  // Only call this after we've confirmed we have a valid session
  const fetchProfile = async (_userId: string): Promise<User | null> => {
    try {
      const { data: profileData, error: profileError } = await db.profile.get()
      if (profileError) {
        console.warn("Profile fetch failed, using auth data:", profileError.message)
        return null
      }
      return profileData
    } catch (err) {
      console.warn("Profile fetch error:", err)
      return null
    }
  }

  const refreshUser = async () => {
    // Get session without calling getUser() to avoid lock
    const supabase = getSupabase()
    if (!supabase) {
      console.warn("Supabase not initialized, skipping refreshUser")
      return
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        const authUser = sessionData.session.user
        // Try to get profile (may fail if profiles table doesn't exist)
        const profile = await fetchProfile(authUser.id)
        if (profile) {
          setUser(profile)
        } else {
          setUser(buildUserFromAuthUser(authUser))
        }
      }
    } catch (err) {
      console.error("Failed to refresh user:", err)
    }
  }

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      console.warn("Supabase not initialized, skipping auth init")
      setIsLoading(false)
      return
    }

    // Initial session check - use getSession which doesn't require lock
    const initAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session?.user) {
          const authUser = sessionData.session.user
          const profile = await fetchProfile(authUser.id)
          if (profile) {
            setUser(profile)
          } else {
            setUser(buildUserFromAuthUser(authUser))
          }
        }
      } catch (err) {
        console.error("Auth init error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes - update user directly from session to avoid lock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)
      if (event === "SIGNED_IN" && session?.user) {
        // Don't call refreshUser() - just use session data directly
        const authUser = session.user
        const profile = await fetchProfile(authUser.id)
        if (profile) {
          setUser(profile)
        } else {
          setUser(buildUserFromAuthUser(authUser))
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await auth.signInWithGoogle()
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await auth.signInWithPassword(email, password)
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await auth.signUp(email, password, fullName)
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signInWithGoogle,
        signInWithPassword,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
