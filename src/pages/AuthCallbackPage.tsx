import { useEffect, useState } from "react"

export function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        const { getSupabase } = await import("@/services/api/supabase")
        const supabase = getSupabase()

        if (!supabase) {
          setError("Supabase not initialized")
          return
        }

        // Check for error in URL (both search params and hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)

        const errorParam = searchParams.get("error") || hashParams.get("error")
        const errorDescription = searchParams.get("error_description") || hashParams.get("error_description")

        if (errorParam) {
          setError(errorDescription || errorParam)
          return
        }

        // Wait for Supabase to detect session from URL hash
        await new Promise(resolve => setTimeout(resolve, 1500))

        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          setError(sessionError.message)
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to app
          window.location.href = "/"
        } else {
          // Try to refresh and get the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError || !refreshData.session) {
            setError("No session found after authentication")
          } else {
            window.location.href = "/"
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed")
      }
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Failed</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <a
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait...</p>
      </div>
    </div>
  )
}
