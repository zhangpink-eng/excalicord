import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      // Disable auto-refresh to prevent lock conflicts with onAuthStateChange
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })

  return supabaseClient
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient
}

// Auth functions
export const auth = {
  signInWithGoogle: async () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },

  signInWithPassword: async (email: string, password: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.signInWithPassword({ email, password })
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
  },

  signOut: async () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.signOut()
  },

  getSession: () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.getSession()
  },

  getUser: () => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.getUser()
  },

  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.auth.onAuthStateChange(callback)
  },
}

// Database functions
export const db = {
  projects: {
    create: async (data: { title?: string; description?: string }) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }
      return supabaseClient.from("projects").insert({
        owner_id: user.user.id,
        title: data.title || "Untitled Project",
        description: data.description,
      }).select().single()
    },
    list: async () => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: [], error: new Error("Not authenticated") }
      return supabaseClient.from("projects").select("*").eq("owner_id", user.user.id).order("updated_at", { ascending: false })
    },
    get: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      return supabaseClient.from("projects").select("*").eq("id", id).single()
    },
    update: async (id: string, updates: Record<string, unknown>) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      return supabaseClient.from("projects").update(updates).eq("id", id).select().single()
    },
    delete: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      return supabaseClient.from("projects").delete().eq("id", id)
    },
  },
  slides: {
    create: async (data: { project_id: string; position?: number; content?: Record<string, unknown> }) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      return supabaseClient.from("slides").insert({
        project_id: data.project_id,
        position: data.position || 0,
        content: data.content || {},
      }).select().single()
    },
    list: async (projectId: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      return supabaseClient.from("slides").select("*").eq("project_id", projectId).order("position", { ascending: true })
    },
    update: async (id: string, updates: Record<string, unknown>) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      return supabaseClient.from("slides").update(updates).eq("id", id).select().single()
    },
    delete: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      return supabaseClient.from("slides").delete().eq("id", id)
    },
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
  exports: {
    create: async (data: { project_id: string; export_type: "mp4" | "webm" | "gif" }) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }
      return supabaseClient.from("exports").insert({
        user_id: user.user.id,
        project_id: data.project_id,
        export_type: data.export_type,
        status: "pending",
      }).select().single()
    },
    updateStatus: async (id: string, status: "processing" | "completed" | "failed", data?: Record<string, unknown>) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const updates: Record<string, unknown> = { status }
      if (status === "processing") updates.started_at = new Date().toISOString()
      else if (status === "completed" || status === "failed") updates.completed_at = new Date().toISOString()
      if (data) Object.assign(updates, data)
      return supabaseClient.from("exports").update(updates).eq("id", id).select().single()
    },
    list: async () => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: [], error: new Error("Not authenticated") }
      return supabaseClient.from("exports").select("*").eq("user_id", user.user.id).order("created_at", { ascending: false })
    },
  },
  profile: {
    get: async () => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }
      return supabaseClient.from("profiles").select("*").eq("id", user.user.id).single()
    },
    update: async (updates: Record<string, unknown>) => {
      if (!supabaseClient) throw new Error("Supabase not initialized")
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) return { data: null, error: new Error("Not authenticated") }
      return supabaseClient.from("profiles").update(updates).eq("id", user.user.id).select().single()
    },
  },
}

// Storage functions
export const storage = {
  upload: async (bucket: string, path: string, file: File | Blob) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.storage.from(bucket).upload(path, file)
  },
  getPublicUrl: (bucket: string, path: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.storage.from(bucket).getPublicUrl(path)
  },
  download: async (bucket: string, path: string) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.storage.from(bucket).download(path)
  },
  delete: async (bucket: string, paths: string[]) => {
    if (!supabaseClient) throw new Error("Supabase not initialized")
    return supabaseClient.storage.from(bucket).remove(paths)
  },
}
