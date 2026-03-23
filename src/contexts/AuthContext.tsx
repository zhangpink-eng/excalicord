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

// Prevent simultaneous refreshUser calls
let refreshInProgress = false

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    // Skip if already refreshing to prevent lock conflicts
    if (refreshInProgress) {
      console.log("refreshUser already in progress, skipping")
      return
    }

    refreshInProgress = true

    try {
      const supabase = getSupabase()
      if (!supabase) {
        console.warn("Supabase not initialized, skipping refreshUser")
        return
      }

      // Use getUser() instead of getSession() to avoid token lock issues
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error("getUser error:", userError.message)
        // If getUser fails, try getSession as fallback
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session?.user) {
          const authUser = sessionData.session.user
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            fullName: authUser.user_metadata?.full_name,
            avatarUrl: authUser.user_metadata?.avatar_url,
            subscriptionTier: "free",
            subscriptionStatus: "active",
          })
        }
        return
      }

      if (userData.user) {
        const authUser = userData.user
        // Try to get profile, but if it fails, use auth user data
        const { data: profileData, error: profileError } = await db.profile.get()
        if (profileError) {
          // Profile doesn't exist, create a basic user from auth data
          console.warn("Profile not found, using auth user data:", profileError.message)
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            fullName: authUser.user_metadata?.full_name,
            avatarUrl: authUser.user_metadata?.avatar_url,
            subscriptionTier: "free",
            subscriptionStatus: "active",
          })
        } else {
          setUser(profileData)
        }
      }
    } catch (err) {
      console.error("Failed to refresh user:", err)
      // Don't set user to null on error - try to use auth session
      try {
        const supabase = getSupabase()
        if (!supabase) return
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session?.user) {
          const authUser = sessionData.session.user
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            fullName: authUser.user_metadata?.full_name,
            avatarUrl: authUser.user_metadata?.avatar_url,
            subscriptionTier: "free",
            subscriptionStatus: "active",
          })
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr)
      }
    } finally {
      refreshInProgress = false
    }
  }

  useEffect(() => {
    // Check if Supabase is initialized
    const supabase = getSupabase()
    if (!supabase) {
      console.warn("Supabase not initialized, skipping auth init")
      setIsLoading(false)
      return
    }

    // Check for existing session
    const initAuth = async () => {
      try {
        const { data } = await auth.getSession()
        if (data.session) {
          await refreshUser()
        }
      } catch (err) {
        console.error("Auth init error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await refreshUser()
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
