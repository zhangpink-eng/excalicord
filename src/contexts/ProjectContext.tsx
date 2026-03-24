import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Project, Slide } from "@/types"
import { db } from "@/services/api/supabase"

interface ProjectContextType {
  project: Project | null
  slides: Slide[]
  isLoading: boolean
  error: string | null
  createProject: (title?: string) => Promise<void>
  loadProject: (id: string) => Promise<void>
  updateProject: (updates: Partial<Project>) => Promise<void>
  deleteProject: () => Promise<void>
  addSlide: () => Promise<void>
  updateSlide: (id: string, updates: Partial<Slide>) => Promise<void>
  deleteSlide: (id: string) => Promise<void>
  reorderSlides: (slides: { id: string; position: number }[]) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProject = useCallback(async (title?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await db.projects.create({ title })
      if (error) throw error
      setProject(data)
      setSlides([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: projectData, error: projectError } = await db.projects.get(id)
      if (projectError) throw projectError
      setProject(projectData)

      const { data: slidesData, error: slidesError } = await db.slides.list(id)
      if (slidesError) throw slidesError
      setSlides(slidesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProject = useCallback(async (updates: Partial<Project>) => {
    if (!project) return
    setError(null)
    try {
      const { data, error } = await db.projects.update(project.id, updates)
      if (error) throw error
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project")
    }
  }, [project])

  const deleteProject = useCallback(async () => {
    if (!project) return
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await db.projects.delete(project.id)
      if (error) throw error
      setProject(null)
      setSlides([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project")
    } finally {
      setIsLoading(false)
    }
  }, [project])

  const addSlide = useCallback(async () => {
    if (!project) return
    setError(null)
    try {
      const position = slides.length
      const { data, error } = await db.slides.create({
        project_id: project.id,
        position,
      })
      if (error) throw error
      setSlides((prev) => [...prev, data])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add slide")
    }
  }, [project, slides.length])

  const updateSlide = useCallback(async (id: string, updates: Partial<Slide>) => {
    setError(null)
    try {
      const { error } = await db.slides.update(id, updates)
      if (error) throw error
      // Update local state optimistically
      setSlides((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update slide")
    }
  }, [])

  const deleteSlide = useCallback(async (id: string) => {
    if (slides.length <= 1) return
    setError(null)
    try {
      const { error } = await db.slides.delete(id)
      if (error) throw error
      setSlides((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete slide")
    }
  }, [slides.length])

  const reorderSlides = useCallback(async (reorderedSlides: { id: string; position: number }[]) => {
    setError(null)
    try {
      const { error } = await db.slides.reorder(reorderedSlides)
      if (error) throw error
      setSlides((prev) => {
        const slideMap = new Map(prev.map((s) => [s.id, s]))
        return reorderedSlides.map(({ id, position }) => ({
          ...slideMap.get(id)!,
          position,
        }))
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder slides")
    }
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        project,
        slides,
        isLoading,
        error,
        createProject,
        loadProject,
        updateProject,
        deleteProject,
        addSlide,
        updateSlide,
        deleteSlide,
        reorderSlides,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
