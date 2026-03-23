import { useCallback, useEffect, useRef, useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { SlideRail } from "@/components/slides/SlideRail"
import { RecordingControls } from "@/components/recording/RecordingControls"
import { ExcalidrawCanvas, CameraBubble } from "@/components/canvas"
import { RightPanel } from "@/components/layout/RightPanel"
import { useMediaDevices, useSlides, useTranslation, useCanvasRecorder } from "@/hooks"
import { useAuth } from "@/contexts"
import { useProject } from "@/contexts"
import { LoginPage, SignUpPage, DashboardPage, PricingPage } from "@/pages"
import { analytics } from "@/services/api/analytics"
import { defaultBeautySettings, type BeautySettings } from "@/services/beauty/BeautyFilter"
import type { ExportFormat } from "@/types"

type Page = "login" | "signup" | "dashboard" | "editor"

function App() {
  const { t } = useTranslation()
  const { user, isLoading: authLoading } = useAuth()
  const { project, createProject, loadProject } = useProject()
  const [currentPage, setCurrentPage] = useState<Page>(user ? "editor" : "login")
  const [showPricing, setShowPricing] = useState(false)
  const [projectName] = useState("Untitled Project")

  const { slides, currentSlideIndex, addSlide, goToSlide } = useSlides()

  const {
    cameraStream,
    startCamera,
    stopCamera,
    startMic,
    stopMic,
  } = useMediaDevices()

  // Canvas recorder for recording Excalidraw + camera bubble
  const {
    startRecording: startCanvasRecording,
    stopRecording: stopCanvasRecording,
    setExcalidrawCanvas,
    setCameraBubbleState,
    setBeautySettings,
  } = useCanvasRecorder()

  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [beautyEnabled, setBeautyEnabled] = useState(false)
  const [beautySettings, setBeautySettingsState] = useState<BeautySettings>(defaultBeautySettings)
  const [recordingError, setRecordingError] = useState<string | null>(null)

  // Camera and mic toggle state (for control bar icons)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)

  // MP4 conversion state
  const [mp4Progress, setMp4Progress] = useState("")

  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const cameraBubblePosition = useRef({ x: 50, y: 50 })
  const cameraBubbleSize = useRef({ width: 200, height: 150 })

  // Initialize analytics
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_API_KEY
    if (posthogKey) {
      analytics.init(posthogKey)
    }
  }, [])

  // Track analytics when user changes
  useEffect(() => {
    if (!authLoading && user) {
      analytics.identify(user.id, { email: user.email })
    }
  }, [authLoading, user])

  // Track if this is the initial mount
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      // On initial mount, set page based on auth state
      if (!authLoading) {
        if (user) {
          setCurrentPage("editor")
        } else {
          setCurrentPage("login")
        }
      }
    }
  }, [authLoading, user])

  const handleRecord = useCallback(async () => {
    // Start recording - camera/mic should already be running if enabled
    setIsRecording(true)
    setDuration(0)
    setRecordingError(null)

    // Set up Excalidraw canvas reference
    const excalidrawCanvas = document.querySelector(".excalidraw-canvas canvas") as HTMLCanvasElement
    if (excalidrawCanvas) {
      setExcalidrawCanvas(excalidrawCanvas)
    }

    // Set up camera bubble state if camera is enabled
    if (cameraEnabled && cameraStream) {
      setCameraBubbleState({
        stream: cameraStream,
        position: cameraBubblePosition.current,
        size: cameraBubbleSize.current,
        shape: "rounded-rect",
        borderRadius: 16,
        borderColor: "#ffffff",
        borderWidth: 3,
      })
    }

    // Apply beauty settings to recorder
    setBeautySettings(beautyEnabled, beautySettings)

    // Start canvas recording
    startCanvasRecording()

    analytics.trackRecordingStarted(project?.id || "unknown")
  }, [cameraEnabled, cameraStream, setExcalidrawCanvas, setCameraBubbleState, setBeautySettings, beautyEnabled, beautySettings, startCanvasRecording, project])

  const handleStop = useCallback(async () => {
    setIsRecording(false)
    setMp4Progress("") // Clear previous progress

    // Stop canvas recording and get the blob
    const blob = await stopCanvasRecording()

    if (blob) {
      setRecordedBlob(blob)
      console.log("[handleStop] Recording stopped, blob:", blob.size, "bytes")

      // 1. Immediately download WebM (fast, no conversion)
      try {
        const webmUrl = URL.createObjectURL(blob)
        const webmA = document.createElement("a")
        webmA.href = webmUrl
        webmA.download = `recording-${Date.now()}.webm`
        document.body.appendChild(webmA)
        webmA.click()
        document.body.removeChild(webmA)
        URL.revokeObjectURL(webmUrl)
        console.log("[handleStop] WebM downloaded immediately")
      } catch (err) {
        console.error("[handleStop] WebM download failed:", err)
      }

      // 2. Start MP4 conversion in background (async)
      setMp4Progress("正在生成 MP4...")

      // Use setTimeout to not block UI
      setTimeout(async () => {
        try {
          const { videoConverter } = await import("@/services/video/VideoConverter")
          await videoConverter.load()

          setMp4Progress("正在转码为 MP4 (480P)...")

          const mp4Blob = await videoConverter.exportTo480P(blob, (progress) => {
            setMp4Progress(`正在转码... ${progress.percent}%`)
          })

          console.log("[handleStop] MP4 generated, size:", mp4Blob.size)

          const mp4Url = URL.createObjectURL(mp4Blob)
          const mp4A = document.createElement("a")
          mp4A.href = mp4Url
          mp4A.download = `recording-${Date.now()}.mp4`
          document.body.appendChild(mp4A)
          mp4A.click()
          document.body.removeChild(mp4A)
          URL.revokeObjectURL(mp4Url)

          setMp4Progress("MP4 生成完成！")
          console.log("[handleStop] MP4 download triggered")

          // Clear progress after 3 seconds
          setTimeout(() => {
            setMp4Progress("")
          }, 3000)
        } catch (err) {
          console.error("[handleStop] MP4 conversion failed:", err)
          setMp4Progress("MP4 生成失败，但 WebM 已下载")
          setTimeout(() => {
            setMp4Progress("")
          }, 5000)
        }
      }, 100) // Small delay to let UI update first
    } else {
      console.warn("[handleStop] No blob received from recording")
    }

    analytics.trackRecordingStopped(project?.id || "unknown", duration)
  }, [stopCanvasRecording, project, duration])

  // Toggle camera on/off (for control bar icon)
  const handleToggleCamera = useCallback(async () => {
    if (cameraEnabled) {
      // Turn off camera
      stopCamera()
      setCameraEnabled(false)
      setCameraBubbleState({
        stream: null,
        position: cameraBubblePosition.current,
        size: cameraBubbleSize.current,
        shape: "rounded-rect",
        borderRadius: 16,
        borderColor: "#ffffff",
        borderWidth: 3,
      })
    } else {
      // Turn on camera
      try {
        const stream = await startCamera()
        setCameraEnabled(true)
        // Set up camera bubble state
        setCameraBubbleState({
          stream: stream,
          position: cameraBubblePosition.current,
          size: cameraBubbleSize.current,
          shape: "rounded-rect",
          borderRadius: 16,
          borderColor: "#ffffff",
          borderWidth: 3,
        })
      } catch (err) {
        console.error("Failed to start camera:", err)
        setRecordingError(err instanceof Error ? err.message : "无法访问摄像头")
      }
    }
  }, [cameraEnabled, startCamera, stopCamera, setCameraBubbleState])

  // Toggle mic on/off (for control bar icon)
  const handleToggleMic = useCallback(async () => {
    if (micEnabled) {
      // Turn off mic
      stopMic()
      setMicEnabled(false)
    } else {
      // Turn on mic
      try {
        await startMic()
        setMicEnabled(true)
      } catch (err) {
        console.error("Failed to start mic:", err)
        setRecordingError(err instanceof Error ? err.message : "无法访问麦克风")
      }
    }
  }, [micEnabled, startMic, stopMic])

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      analytics.trackExportStarted(project?.id || "unknown", format)

      if (!recordedBlob) {
        console.error("No recording available. Please record first.")
        return
      }

      // Use FFmpeg.wasm to convert if available
      const { videoConverter } = await import("@/services/video/VideoConverter")

      try {
        await videoConverter.load()
        let blob: Blob

        if (format === "gif") {
          blob = await videoConverter.exportToGIF(recordedBlob)
        } else if (format === "webm") {
          blob = await videoConverter.exportToWebM(recordedBlob)
        } else {
          blob = await videoConverter.exportToMP4(recordedBlob)
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `recording-${Date.now()}.${format}`
        a.click()
        URL.revokeObjectURL(url)

        analytics.trackExportCompleted(project?.id || "unknown", format, duration)
      } catch (err) {
        console.error("Export failed:", err)
        // Fallback to direct download of original recording
        const url = URL.createObjectURL(recordedBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = `recording-${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)
      }
    },
    [recordedBlob, project, duration]
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
    // Note: project state is updated by createProject, but we use "unknown" here
    // because the project context may not have updated yet
    analytics.trackProjectCreated(user?.id || "unknown", "new-project")
  }, [createProject, user])

  const handleOpenProject = useCallback(async (projectId: string) => {
    await loadProject(projectId)
    setCurrentPage("editor")
  }, [loadProject])

  // Pricing handler
  const handlePricing = useCallback(() => {
    setShowPricing(true)
  }, [])

  const handleSelectPlan = useCallback(async (planId: string) => {
    console.log("Selected plan:", planId)
    // In production, this would initiate Stripe checkout
    setShowPricing(false)
  }, [])

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-primary animate-pulse" />
          <p className="text-muted-foreground">{t("common.loading") || "Loading..."}</p>
        </div>
      </div>
    )
  }

  // Render pages
  if (currentPage === "login" || (!user && currentPage !== "signup")) {
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
    <>
      <MainLayout
        header={
          <Header
            projectName={project?.title || projectName}
            onExport={() => handleExport("mp4")}
            onShare={handleShare}
            onPricing={handlePricing}
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
            <CameraBubble
              stream={cameraEnabled ? cameraStream : null}
              position={cameraBubblePosition.current}
              size={cameraBubbleSize.current}
              videoRef={cameraVideoRef}
            />
          </div>
        }
        rightPanel={
          <RightPanel
            beautyEnabled={beautyEnabled}
            beautySettings={beautySettings}
            onBeautySettingChange={(key, value) => setBeautySettingsState((prev) => ({ ...prev, [key]: value }))}
            onBeautyToggle={() => setBeautyEnabled((v) => !v)}
            onBeautyReset={() => setBeautySettingsState(defaultBeautySettings)}
          />
        }
        controlBar={
          <>
            {recordingError && (
              <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm text-center">
                {recordingError}
              </div>
            )}
            <RecordingControls
              state={isRecording ? "recording" : "idle"}
              duration={duration}
              onRecord={handleRecord}
              onStop={handleStop}
              cameraEnabled={cameraEnabled}
              micEnabled={micEnabled}
              onCameraToggle={handleToggleCamera}
              onMicToggle={handleToggleMic}
            />
            {/* MP4 conversion progress */}
            {mp4Progress && (
              <div className="absolute inset-x-0 bottom-full mb-2 px-4 py-2 bg-primary/90 text-primary-foreground text-sm text-center rounded-md mx-auto max-w-md">
                {mp4Progress}
              </div>
            )}
          </>
        }
      />
      {showPricing && (
        <PricingPage
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowPricing(false)}
        />
      )}
    </>
  )
}

export default App
