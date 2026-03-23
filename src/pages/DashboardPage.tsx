import { useEffect, useState } from "react"
import { Button } from "@/components/ui"
import { db, auth } from "@/services/api/supabase"
import type { Project } from "@/types"

interface DashboardPageProps {
  onOpenProject: (projectId: string) => void
  onCreateProject: () => void
  onSignOut: () => void
}

export function DashboardPage({ onOpenProject, onCreateProject, onSignOut }: DashboardPageProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data: user } = await auth.getUser()
        if (user.user) {
          setUserEmail(user.user.email || null)
        }

        const { data, error } = await db.projects.list()
        if (error) throw error
        setProjects(data || [])
      } catch (err) {
        console.error("Failed to load projects:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const { error } = await db.projects.delete(projectId)
      if (error) throw error
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      console.error("Failed to delete project:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold">Excalicord</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-muted-foreground mt-1">Create and manage your video projects</p>
          </div>
          <Button onClick={onCreateProject}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6">Create your first project to get started</p>
            <Button onClick={onCreateProject}>Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-xl border hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onOpenProject(project.id)}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/30"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <path d="M9 15h6" />
                  </svg>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold truncate">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-destructive"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
