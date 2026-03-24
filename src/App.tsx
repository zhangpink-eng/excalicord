import { useCallback, useEffect, useRef, useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { SlideRail } from "@/components/slides/SlideRail"
import { RecordingControls } from "@/components/recording/RecordingControls"
import { PreviewPlayer } from "@/components/recording/PreviewPlayer"
import { ExcalidrawCanvas, CameraBubble, CanvasOverlay, type Tool } from "@/components/canvas"
import { RightPanel } from "@/components/layout/RightPanel"
import { LanguageSelector, ThemeToggle } from "@/components/ui"
import { useMediaDevices, useTranslation, useCanvasRecorder } from "@/hooks"
import { useAuth } from "@/contexts"
import { useProject } from "@/contexts"
import { LoginPage, SignUpPage, DashboardPage, PricingPage } from "@/pages"
import { analytics } from "@/services/api/analytics"
import { defaultBeautySettings, type BeautySettings } from "@/services/beauty/BeautyFilter"
import type { BubbleShape } from "@/components/canvas/CameraBubbleSettings"

type Page = "login" | "signup" | "dashboard" | "editor"

function App() {
  const { t } = useTranslation()
  const { user, isLoading: authLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>(user ? "editor" : "login")
  const [showPricing, setShowPricing] = useState(false)
  const [projectName, setProjectName] = useState("Untitled Project")

  // Use slides from ProjectContext (synced with database)
  const { project, slides, addSlide: addSlideToProject, deleteSlide, updateSlide, reorderSlides, createProject, loadProject, updateProject } = useProject()

  // Handle project name change - save to database if project exists
  const handleProjectNameChange = useCallback((name: string) => {
    setProjectName(name)
    // Save to database if we have a loaded project
    if (project) {
      updateProject({ title: name })
    }
  }, [project, updateProject])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Sync currentSlideIndex when project changes
  useEffect(() => {
    setCurrentSlideIndex(0)
  }, [project?.id])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index)
    // Scroll the selected slide into center of view
    setTimeout(() => {
      if (!slidesContainerRef.current) return
      const container = slidesContainerRef.current
      const slideElements = container.querySelectorAll('[data-slide-index]')
      const slide = slideElements[index] as HTMLElement
      if (slide) {
        const containerRect = container.getBoundingClientRect()
        const slideRect = slide.getBoundingClientRect()
        const scrollLeft = slide.offsetLeft - (containerRect.width / 2) + (slideRect.width / 2)
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }, 50)
  }, [])

  const handleAddSlide = useCallback(() => {
    addSlideToProject()
  }, [addSlideToProject])

  const handleDeleteSlide = useCallback((id: string) => {
    deleteSlide(id)
  }, [deleteSlide])

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
    duration, // Get duration from recorder hook
  } = useCanvasRecorder()

  const [isRecording, setIsRecording] = useState(false)
  const [beautyEnabled, setBeautyEnabled] = useState(false)
  const [beautySettings, setBeautySettingsState] = useState<BeautySettings>(defaultBeautySettings)
  const [recordingError, setRecordingError] = useState<string | null>(null)

  // Camera and mic toggle state (for control bar icons)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)

  // MP4 conversion state
  const [mp4Progress, setMp4Progress] = useState("")

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Right panel visibility (default: hidden)
  const [rightPanelVisible, setRightPanelVisible] = useState(false)

  // Canvas tool state
  const [activeTool, setActiveTool] = useState<string>("select")

  // Toggle right panel
  const toggleRightPanel = useCallback(() => {
    setRightPanelVisible((v) => !v)
  }, [])

  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const slidesContainerRef = useRef<HTMLDivElement>(null)
  const cameraBubblePosition = useRef({ x: 50, y: 50 })
  const cameraBubbleSize = useRef({ width: 200, height: 150 })

  // Camera bubble settings state
  const [cameraBubbleShape, setCameraBubbleShape] = useState<BubbleShape>("rounded-rect")
  const [cameraBubbleBorderColor, setCameraBubbleBorderColor] = useState("#ffffff")
  const [cameraBubbleBorderWidth, setCameraBubbleBorderWidth] = useState(3)
  const [cameraBubbleBorderRadius, setCameraBubbleBorderRadius] = useState(16)

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
        shape: cameraBubbleShape,
        borderRadius: cameraBubbleBorderRadius,
        borderColor: cameraBubbleBorderColor,
        borderWidth: cameraBubbleBorderWidth,
      })
    }

    // Apply beauty settings to recorder
    setBeautySettings(beautyEnabled, beautySettings)

    // Start canvas recording
    startCanvasRecording()

    analytics.trackRecordingStarted(project?.id || "unknown")
  }, [cameraEnabled, cameraStream, setExcalidrawCanvas, setCameraBubbleState, setBeautySettings, beautyEnabled, beautySettings, startCanvasRecording, project, cameraBubbleShape, cameraBubbleBorderColor, cameraBubbleBorderWidth, cameraBubbleBorderRadius])

  const handleStop = useCallback(async () => {
    setIsRecording(false)
    setMp4Progress("") // Clear previous progress

    // Stop canvas recording and get the blob
    const blob = await stopCanvasRecording()

    if (blob) {
      console.log("[handleStop] Recording stopped, blob:", blob.size, "bytes, type:", blob.type)

      // Create preview URL and show preview player
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } else {
      console.warn("[handleStop] No blob received from recording")
    }

    analytics.trackRecordingStopped(project?.id || "unknown", duration)
  }, [stopCanvasRecording, project, duration])

  const handlePreviewDownload = useCallback(() => {
    if (!previewUrl) return
    // Trigger download via link click
    const a = document.createElement("a")
    a.href = previewUrl
    a.download = `recording-${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [previewUrl])

  const handlePreviewExport = useCallback(async () => {
    if (!previewUrl) return
    setMp4Progress("正在转码为 MP4...")

    try {
      const { videoConverter } = await import("@/services/video/VideoConverter")
      await videoConverter.load()

      // Fetch the blob from previewUrl
      const response = await fetch(previewUrl)
      const blob = await response.blob()

      const mp4Blob = await videoConverter.exportTo480P(blob, (progress) => {
        setMp4Progress(`正在转码... ${progress.percent}%`)
      })

      console.log("[handlePreviewExport] MP4 generated, size:", mp4Blob.size)

      const mp4Url = URL.createObjectURL(mp4Blob)
      const mp4A = document.createElement("a")
      mp4A.href = mp4Url
      mp4A.download = `recording-${Date.now()}.mp4`
      document.body.appendChild(mp4A)
      mp4A.click()
      document.body.removeChild(mp4A)
      URL.revokeObjectURL(mp4Url)

      setMp4Progress("MP4 生成完成！")
      setPreviewUrl(null) // Close preview

      setTimeout(() => {
        setMp4Progress("")
      }, 3000)
    } catch (err) {
      console.error("[handlePreviewExport] MP4 conversion failed:", err)
      setMp4Progress("MP4 生成失败")
      setTimeout(() => setMp4Progress(""), 5000)
    }
  }, [previewUrl])

  const handlePreviewClose = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }, [previewUrl])

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
        shape: cameraBubbleShape,
        borderRadius: cameraBubbleBorderRadius,
        borderColor: cameraBubbleBorderColor,
        borderWidth: cameraBubbleBorderWidth,
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
          shape: cameraBubbleShape,
          borderRadius: cameraBubbleBorderRadius,
          borderColor: cameraBubbleBorderColor,
          borderWidth: cameraBubbleBorderWidth,
        })
      } catch (err) {
        console.error("Failed to start camera:", err)
        setRecordingError(err instanceof Error ? err.message : "无法访问摄像头")
      }
    }
  }, [cameraEnabled, startCamera, stopCamera, setCameraBubbleState, cameraBubbleShape, cameraBubbleBorderColor, cameraBubbleBorderWidth, cameraBubbleBorderRadius])

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

  const handleShare = useCallback(() => {
    console.log("Share clicked")
  }, [])

  // Back to projects handler
  const handleBackToProjects = useCallback(() => {
    setCurrentPage("dashboard")
  }, [])

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
            projectName={projectName}
            onProjectNameChange={handleProjectNameChange}
            onTogglePanel={toggleRightPanel}
            onShare={handleShare}
            onPricing={handlePricing}
            onBackToProjects={handleBackToProjects}
            panelVisible={rightPanelVisible}
            languageSelector={<LanguageSelector />}
            themeToggle={<ThemeToggle />}
          />
        }
        slideRail={
          <SlideRail
            slides={slides.map((s) => ({ id: s.id, name: s.name || `Slide ${s.position + 1}` }))}
            currentIndex={currentSlideIndex}
            onSelect={goToSlide}
            onAdd={handleAddSlide}
            onDelete={handleDeleteSlide}
            onRename={(id, name) => {
              updateSlide(id, { name })
            }}
            onReorder={(fromIndex, toIndex) => {
              const reorderedSlides = [...slides]
              const [moved] = reorderedSlides.splice(fromIndex, 1)
              reorderedSlides.splice(toIndex, 0, moved)
              reorderSlides(reorderedSlides.map((s, i) => ({ id: s.id, position: i })))
            }}
          />
        }
        canvas={
          <div className="relative w-full h-full bg-canvas-light">
            {/* Single shared Excalidraw canvas - shows only current slide's elements */}
            <ExcalidrawCanvas
              key={slides[currentSlideIndex]?.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              elements={slides[currentSlideIndex]?.content?.elements as any[] || []}
              onElementsChange={(elements) => {
                const currentSlide = slides[currentSlideIndex]
                if (!currentSlide) return
                // Filter elements to only include those belonging to current slide
                // This ensures elements don't leak between slides
                const boundElements = elements
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .filter((el: any) => !el.slideId || el.slideId === currentSlide.id)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((el: any) => ({
                    ...el,
                    slideId: currentSlide.id,
                  }))
                updateSlide(currentSlide.id, { content: { elements: boundElements } })
              }}
            />

            {/* Canvas overlay toolbar */}
            <CanvasOverlay
              activeTool={activeTool as Tool}
              onToolChange={(tool) => setActiveTool(tool)}
            />

            {/* Slide frames as purely visual overlays - scrollable container */}
            <div
              ref={slidesContainerRef}
              className="absolute inset-0 flex items-center overflow-x-auto pointer-events-none"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="flex items-center gap-4 px-4 min-w-max">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    data-slide-index={index}
                    className={`relative transition-all duration-200 ${
                      currentSlideIndex === index
                        ? "z-20"
                        : "z-10"
                    }`}
                    style={{
                      width: "480px",
                      height: "360px",
                      transform: currentSlideIndex === index ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    {/* Pure visual border - no pointer events */}
                    <div
                      className={`absolute inset-0 rounded-lg transition-all duration-200 pointer-events-none ${
                        currentSlideIndex === index
                          ? "border-4 border-primary shadow-2xl"
                          : "border-2 border-border/70"
                      }`}
                    />
                    {/* Slide number label */}
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium px-3 py-1 rounded-full transition-colors pointer-events-none ${
                        currentSlideIndex === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <CameraBubble
              stream={cameraEnabled ? cameraStream : null}
              position={cameraBubblePosition.current}
              size={cameraBubbleSize.current}
              shape={cameraBubbleShape}
              borderColor={cameraBubbleBorderColor}
              borderWidth={cameraBubbleBorderWidth}
              borderRadius={cameraBubbleBorderRadius}
              videoRef={cameraVideoRef}
            />
          </div>
        }
        rightPanel={
          rightPanelVisible ? (
            <RightPanel
              beautyEnabled={beautyEnabled}
              beautySettings={beautySettings}
              onBeautySettingChange={(key, value) => setBeautySettingsState((prev) => ({ ...prev, [key]: value }))}
              onBeautyToggle={() => setBeautyEnabled((v) => !v)}
              onBeautyReset={() => setBeautySettingsState(defaultBeautySettings)}
              cameraBubbleShape={cameraBubbleShape}
              cameraBubbleBorderColor={cameraBubbleBorderColor}
              cameraBubbleBorderWidth={cameraBubbleBorderWidth}
              cameraBubbleBorderRadius={cameraBubbleBorderRadius}
              cameraBubbleSize={cameraBubbleSize.current}
              onCameraBubbleShapeChange={setCameraBubbleShape}
              onCameraBubbleBorderColorChange={setCameraBubbleBorderColor}
              onCameraBubbleBorderWidthChange={setCameraBubbleBorderWidth}
              onCameraBubbleBorderRadiusChange={setCameraBubbleBorderRadius}
              onCameraBubbleSizeChange={(size) => { cameraBubbleSize.current = size }}
              onCameraBubblePositionPreset={(pos) => { cameraBubblePosition.current = pos }}
            />
          ) : null
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
      {previewUrl && (
        <PreviewPlayer
          src={previewUrl}
          onClose={handlePreviewClose}
          onExport={handlePreviewExport}
          onDownload={handlePreviewDownload}
        />
      )}
    </>
  )
}

export default App
