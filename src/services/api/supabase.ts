import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  supabaseClient = createClient(url, anonKey)
  console.log("Supabase initialized:", url)
  return supabaseClient
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient
}

// Auth functions
export const auth = {
  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  },

  /**
   * Sign in with email and password
   */
  signInWithPassword: async (email: string, password: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, fullName?: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    const { error } = await supabaseClient.auth.signOut()
    return { error }
  },

  /**
   * Get current session
   */
  getSession: () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.getSession()
  },

  /**
   * Get current user
   */
  getUser: () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.getUser()
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.onAuthStateChange(callback)
  },
}

// Database functions
export const db = {
  /**
   * Projects
   */
  projects: {
    /**
     * Create a new project
     */
    create: async (data: { title?: string; description?: string }) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }

      const { data: project, error } = await supabaseClient
        .from("projects")
        .insert({
          owner_id: user.user.id,
          title: data.title || "Untitled Project",
          description: data.description,
        })
        .select()
        .single()

      return { data: project, error }
    },

    /**
     * Get all projects for current user
     */
    list: async () => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: [], error: new Error("Not authenticated") }

      const { data: projects, error } = await supabaseClient
        .from("projects")
        .select("*")
        .eq("owner_id", user.user.id)
        .order("updated_at", { ascending: false })

      return { data: projects || [], error }
    },

    /**
     * Get a single project by ID
     */
    get: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: project, error } = await supabaseClient
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

      return { data: project, error }
    },

    /**
     * Update a project
     */
    update: async (id: string, updates: Record<string, unknown>) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: project, error } = await supabaseClient
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      return { data: project, error }
    },

    /**
     * Delete a project
     */
    delete: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { error } = await supabaseClient.from("projects").delete().eq("id", id)
      return { error }
    },
  },

  /**
   * Slides
   */
  slides: {
    /**
     * Create a new slide
     */
    create: async (data: { project_id: string; position?: number; content?: Record<string, unknown> }) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")

      const { data: slide, error } = await supabaseClient
        .from("slides")
        .insert({
          project_id: data.project_id,
          position: data.position || 0,
          content: data.content || {},
        })
        .select()
        .single()

      return { data: slide, error }
    },

    /**
     * Get all slides for a project
     */
    list: async (projectId: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: slides, error } = await supabaseClient
        .from("slides")
        .select("*")
        .eq("project_id", projectId)
        .order("position", { ascending: true })

      return { data: slides || [], error }
    },

    /**
     * Update a slide
     */
    update: async (id: string, updates: Record<string, unknown>) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: slide, error } = await supabaseClient
        .from("slides")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      return { data: slide, error }
    },

    /**
     * Delete a slide
     */
    delete: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { error } = await supabaseClient.from("slides").delete().eq("id", id)
      return { error }
    },

    /**
     * Reorder slides
     */
    reorder: async (slides: { id: string; position: number }[]) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")

      const updates = slides.map((slide) =>
        supabaseClient!.from("slides").update({ position: slide.position }).eq("id", slide.id)
      )

      const results = await Promise.all(updates)
      const error = results.find((r) => r.error)?.error

      return { error }
    },
  },

  /**
   * Exports
   */
  exports: {
    /**
     * Create an export record
     */
    create: async (data: { project_id: string; export_type: "mp4" | "webm" | "gif" }) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }

      const { data: exportRecord, error } = await supabaseClient
        .from("exports")
        .insert({
          user_id: user.user.id,
          project_id: data.project_id,
          export_type: data.export_type,
          status: "pending",
        })
        .select()
        .single()

      return { data: exportRecord, error }
    },

    /**
     * Update export status
     */
    updateStatus: async (
      id: string,
      status: "processing" | "completed" | "failed",
      data?: { download_url?: string; storage_path?: string; file_size_bytes?: number; error_message?: string }
    ) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const updates: Record<string, unknown> = { status }

      if (status === "processing") {
        updates.started_at = new Date().toISOString()
      } else if (status === "completed" || status === "failed") {
        updates.completed_at = new Date().toISOString()
      }

      if (data) {
        Object.assign(updates, data)
      }

      const { data: exportRecord, error } = await supabaseClient
        .from("exports")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      return { data: exportRecord, error }
    },

    /**
     * Get user's exports
     */
    list: async () => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: [], error: new Error("Not authenticated") }

      const { data: exports, error } = await supabaseClient
        .from("exports")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })

      return { data: exports || [], error }
    },
  },

  /**
   * User Profile
   */
  profile: {
    /**
     * Get current user's profile
     */
    get: async () => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }

      const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single()

      return { data: profile, error }
    },

    /**
     * Update current user's profile
     */
    update: async (updates: Record<string, unknown>) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }

      const { data: profile, error } = await supabaseClient
        .from("profiles")
        .update(updates)
        .eq("id", user.user.id)
        .select()
        .single()

      return { data: profile, error }
    },
  },
}

// Storage functions
export const storage = {
  /**
   * Upload a file to storage
   */
  upload: async (bucket: string, path: string, file: File | Blob) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    const { data, error } = await supabaseClient.storage.from(bucket).upload(path, file)
    return { data, error }
  },

  /**
   * Get a public URL for a file
   */
  getPublicUrl: (bucket: string, path: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.storage.from(bucket).getPublicUrl(path)
  },

  /**
   * Download a file from storage
   */
  download: async (bucket: string, path: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.storage.from(bucket).download(path)
  },

  /**
   * Delete a file from storage
   */
  delete: async (bucket: string, paths: string[]) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.storage.from(bucket).remove(paths)
  },
}
