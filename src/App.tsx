import { useCallback, useEffect, useRef, useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { SlideRail } from "@/components/slides/SlideRail"
import { RecordingControls } from "@/components/recording/RecordingControls"
import { ExcalidrawCanvas, CameraBubble } from "@/components/canvas"
import { RightPanel } from "@/components/layout/RightPanel"
import { useMediaDevices, useSlides } from "@/hooks"
import { useAuth } from "@/contexts"
import { useProject } from "@/contexts"
import { LoginPage, SignUpPage, DashboardPage } from "@/pages"
import type { ExportFormat } from "@/types"

type Page = "login" | "signup" | "dashboard" | "editor"

function App() {
  const { user, isLoading: authLoading } = useAuth()
  const { project, createProject, loadProject } = useProject()
  const [currentPage, setCurrentPage] = useState<Page>(user ? "editor" : "login")
  const [projectName] = useState("Untitled Project")

  const { slides, currentSlideIndex, addSlide, goToSlide } = useSlides()

  const {
    cameraStream,
    startCamera,
    stopCamera,
    startMic,
    stopMic,
  } = useMediaDevices()

  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const recordingTimerRef = useRef<number | null>(null)

  // Redirect based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setCurrentPage("editor")
      } else {
        setCurrentPage("login")
      }
    }
  }, [authLoading, user])

  const handleRecord = useCallback(() => {
    if (isRecording) {
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    } else {
      setIsRecording(true)
      setDuration(0)
      startCamera()
      startMic()

      recordingTimerRef.current = window.setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    }
  }, [isRecording, startCamera, startMic])

  const handleStop = useCallback(() => {
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    stopCamera()
    stopMic()

    const demoBlob = new Blob(["demo recording"], { type: "video/webm" })
    setRecordedBlob(demoBlob)
  }, [stopCamera, stopMic])

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (recordedBlob) {
        const url = URL.createObjectURL(recordedBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = `recording-${Date.now()}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    },
    [recordedBlob]
  )

  const handleShare = useCallback(() => {
    console.log("Share clicked")
  }, [])

  const handleAddSlide = useCallback(() => {
    addSlide()
  }, [addSlide])

  // Auth handlers
  const handleAuthSuccess = useCallback(() => {
    setCurrentPage("dashboard")
  }, [])

  const handleSignOut = useCallback(async () => {
    const { signOut } = await import("@/services/api/supabase").then(m => m.auth)
    await signOut()
    setCurrentPage("login")
  }, [])

  // Project handlers
  const handleCreateProject = useCallback(async () => {
    await createProject("Untitled Project")
    setCurrentPage("editor")
  }, [createProject])

  const handleOpenProject = useCallback(async (projectId: string) => {
    await loadProject(projectId)
    setCurrentPage("editor")
  }, [loadProject])

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Render pages
  if (!user || currentPage === "login") {
    return <LoginPage onSignUp={() => setCurrentPage("signup")} onSuccess={handleAuthSuccess} />
  }

  if (currentPage === "signup") {
    return <SignUpPage onSignIn={() => setCurrentPage("login")} onSuccess={handleAuthSuccess} />
  }

  if (currentPage === "dashboard") {
    return (
      <DashboardPage
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
        onSignOut={handleSignOut}
      />
    )
  }

  // Editor page
  return (
    <MainLayout
      header={
        <Header
          projectName={project?.title || projectName}
          onExport={() => handleExport("mp4")}
          onShare={handleShare}
        />
      }
      slideRail={
        <SlideRail
          slides={slides.map((s) => ({ id: s.id, name: `Slide ${s.position + 1}`, thumbnail: "" }))}
          currentIndex={currentSlideIndex}
          onSelect={goToSlide}
          onAdd={handleAddSlide}
        />
      }
      canvas={
        <div className="relative w-full h-full bg-canvas-light">
          <ExcalidrawCanvas />
          <CameraBubble stream={cameraStream} position={{ x: 50, y: 50 }} />
        </div>
      }
      rightPanel={<RightPanel />}
      controlBar={
        <RecordingControls
          state={isRecording ? "recording" : "idle"}
          duration={duration}
          onRecord={handleRecord}
          onStop={handleStop}
        />
      }
    />
  )
}

export default App
