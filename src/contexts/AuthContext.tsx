import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { getSupabase } from "@/services/api/supabase"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      console.warn("Supabase not initialized")
      setIsLoading(false)
      return
    }

    // Get initial session - use session directly without calling getUser()
    const initAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        setUser(buildUserFromAuthUser(sessionData.session.user))
      }
      setIsLoading(false)
    }

    initAuth()

    // Listen for auth changes - only handle SIGNED_IN and SIGNED_OUT
    // Don't call any auth API methods here, just use the session data
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(buildUserFromAuthUser(session.user))
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
      // Ignore TOKEN_REFRESHED, USER_UPDATED - these cause lock issues
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const supabase = getSupabase()
    if (!supabase) throw new Error("Supabase not initialized")
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
      setIsLoading(false)
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    const supabase = getSupabase()
    if (!supabase) throw new Error("Supabase not initialized")
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // onAuthStateChange will handle setting user
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const supabase = getSupabase()
    if (!supabase) throw new Error("Supabase not initialized")
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    const supabase = getSupabase()
    if (!supabase) throw new Error("Supabase not initialized")
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
