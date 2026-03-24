import { useCallback, useEffect, useRef, useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { SlideRail } from "@/components/slides/SlideRail"
import { DraggableRecordingControls } from "@/components/recording/DraggableRecordingControls"
import { RecordingPreview } from "@/components/recording/RecordingPreview"
import { PreviewPlayer } from "@/components/recording/PreviewPlayer"
import { ExcalidrawCanvas, CameraBubble } from "@/components/canvas"
import { RightPanel } from "@/components/layout/RightPanel"
import { LanguageSelector, ThemeToggle } from "@/components/ui"
import { useMediaDevices, useTranslation, useCanvasRecorder } from "@/hooks"
import { useAuth } from "@/contexts"
import { useProject } from "@/contexts"
import { LoginPage, SignUpPage, DashboardPage, PricingPage, AuthCallbackPage } from "@/pages"
import { analytics } from "@/services/api/analytics"
import { db } from "@/services/api/supabase"
import { defaultBeautySettings, type BeautySettings } from "@/services/beauty/BeautyFilter"
import type { BubbleShape } from "@/components/canvas/CameraBubbleSettings"

type Page = "login" | "signup" | "dashboard" | "editor"

function App() {
  const { t } = useTranslation()
  const { user, isLoading: authLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>(user ? "editor" : "login")
  const [showPricing, setShowPricing] = useState(false)
  const [projectName, setProjectName] = useState("Untitled Project")

  // Sync currentPage with user state when auth changes
  useEffect(() => {
    console.log("Auth state changed - user:", user, "authLoading:", authLoading)
    if (!authLoading) {
      if (user) {
        setCurrentPage("editor")
      } else {
        setCurrentPage("login")
      }
    }
  }, [user, authLoading])

  // Use slides from ProjectContext (synced with database)
  const { project, slides, addSlide: addSlideToProject, deleteSlide, updateSlide, reorderSlides, createProject, loadProject, updateProject } = useProject()

  // Auto-save debounce refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedElementsRef = useRef<string>("")

  // Debounced save function for slide elements
  const debouncedSave = useCallback((slideId: string, elements: unknown[]) => {
    const elementsString = JSON.stringify(elements)
    if (elementsString === lastSavedElementsRef.current) return
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    autoSaveTimeoutRef.current = setTimeout(() => {
      lastSavedElementsRef.current = elementsString
      updateSlide(slideId, { content: { elements } })
    }, 1000)
  }, [updateSlide])

  // Debounced save function for project name
  const debouncedProjectNameSave = useCallback((name: string) => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    autoSaveTimeoutRef.current = setTimeout(() => {
      updateProject({ title: name })
    }, 1000)
  }, [updateProject])

  // Handle project name change
  const handleProjectNameChange = useCallback((name: string) => {
    setProjectName(name)
    if (project) {
      debouncedProjectNameSave(name)
    }
  }, [project, debouncedProjectNameSave])

  // Projects list for the projects panel
  const [projects, setProjects] = useState<Array<{ id: string; title: string; updatedAt: string }>>([])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, error } = await db.projects.list()
        if (error) throw error
        setProjects(data || [])
      } catch (err) {
        console.error("Failed to load projects:", err)
      }
    }
    loadProjects()
  }, [])

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
    micStream,
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
    setCameraVideo,
    setAudioStream,
    setBeautySettings,
    setPreviewArea,
    duration, // Get duration from recorder hook
  } = useCanvasRecorder()

  const [isRecording, setIsRecording] = useState(false)
  const [showRecordingPreview, setShowRecordingPreview] = useState(false)
  const [recordingPreviewSize] = useState({ width: 640, height: 360 })
  const [beautyEnabled, setBeautyEnabled] = useState(false)
  const [beautySettings, setBeautySettingsState] = useState<BeautySettings>(defaultBeautySettings)

  // Camera and mic toggle state (for control bar icons)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Right panel visibility (default: hidden)
  const [rightPanelVisible, setRightPanelVisible] = useState(false)

  // Projects panel visibility (default: hidden)
  const [projectsPanelVisible, setProjectsPanelVisible] = useState(false)

  // Toggle right panel
  const toggleRightPanel = useCallback(() => {
    setRightPanelVisible((v) => !v)
  }, [])

  // Toggle projects panel
  const toggleProjectsPanel = useCallback(() => {
    setProjectsPanelVisible((v) => !v)
  }, [])

  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const slidesContainerRef = useRef<HTMLDivElement>(null)
  const cameraBubblePosition = useRef({ x: 50, y: 50 })
  const cameraBubbleSize = useRef({ width: 120, height: 90 })

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
          setCurrentPage("dashboard")
        } else {
          setCurrentPage("login")
        }
      }
    }
  }, [authLoading, user])

  const handleRecord = useCallback(async () => {
    // Show the recording preview
    setShowRecordingPreview(true)

    // Auto-enable camera if not already enabled
    let stream = cameraStream
    if (!cameraEnabled || !stream) {
      try {
        stream = await startCamera()
        setCameraEnabled(true)
      } catch (err) {
        console.error("Failed to start camera:", err)
      }
    }

    // Auto-enable mic if not already enabled
    if (!micEnabled) {
      try {
        await startMic()
        setMicEnabled(true)
      } catch (err) {
        console.error("Failed to start mic:", err)
      }
    }

    // Set up preview area for the recorder
    const previewAreaConfig = {
      x: 0,
      y: 0,
      width: recordingPreviewSize.width,
      height: recordingPreviewSize.height,
    }
    setPreviewArea(previewAreaConfig)

    // Set up Excalidraw canvas reference
    const excalidrawCanvas = document.querySelector(".excalidraw-canvas canvas") as HTMLCanvasElement
    if (excalidrawCanvas) {
      setExcalidrawCanvas(excalidrawCanvas)
    }

    // Set up camera bubble state - default to bottom-right of preview area
    if (stream) {
      const defaultPos = {
        x: recordingPreviewSize.width - cameraBubbleSize.current.width - 20,
        y: recordingPreviewSize.height - cameraBubbleSize.current.height - 20,
      }
      setCameraBubbleState({
        stream: stream,
        position: defaultPos,
        size: cameraBubbleSize.current,
        shape: cameraBubbleShape,
        borderRadius: cameraBubbleBorderRadius,
        borderColor: cameraBubbleBorderColor,
        borderWidth: cameraBubbleBorderWidth,
      })

      // Attach stream to video element and tell recorder about it
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream
        setCameraVideo(cameraVideoRef.current)
      }
    }

    // Pass mic stream to recorder for audio recording
    if (micStream) {
      setAudioStream(micStream)
    }

    // Apply beauty settings to recorder
    setBeautySettings(beautyEnabled, beautySettings)

    // Start recording
    setIsRecording(true)
    startCanvasRecording()

    analytics.trackRecordingStarted(project?.id || "unknown")
  }, [cameraEnabled, cameraStream, micEnabled, micStream, startCamera, startMic, setExcalidrawCanvas, setCameraBubbleState, setCameraVideo, setAudioStream, setBeautySettings, setPreviewArea, beautyEnabled, beautySettings, startCanvasRecording, project, recordingPreviewSize, cameraBubbleShape, cameraBubbleBorderColor, cameraBubbleBorderWidth, cameraBubbleBorderRadius])

  const handleStop = useCallback(async () => {
    setIsRecording(false)
    setShowRecordingPreview(false)

    // Stop canvas recording and get the blob
    const blob = await stopCanvasRecording()

    if (blob) {
      console.log("[handleStop] Recording stopped, blob:", blob.size, "bytes, type:", blob.type)

      // Auto-download the recording
      const extension = blob.type === "video/mp4" ? "mp4" : "webm"
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `recording-${Date.now()}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
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

    try {
      const { videoConverter } = await import("@/services/video/VideoConverter")
      await videoConverter.load()

      // Fetch the blob from previewUrl
      const response = await fetch(previewUrl)
      const blob = await response.blob()

      const mp4Blob = await videoConverter.exportTo480P(blob, (progress) => {
        console.log(`[handlePreviewExport] Conversion progress: ${progress.percent}%`)
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

      setPreviewUrl(null) // Close preview
    } catch (err) {
      console.error("[handlePreviewExport] MP4 conversion failed:", err)
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
      }
    }
  }, [micEnabled, startMic, stopMic])

  const handleShare = useCallback(() => {
    console.log("Share clicked")
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

  // Auth callback route - check both pathname and hash for OAuth callback
  const hasAuthHash = window.location.hash.includes("access_token") || window.location.hash.includes("error=")
  if (window.location.pathname === "/auth/callback" || hasAuthHash) {
    return <AuthCallbackPage />
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
            onOpenProjectsPanel={toggleProjectsPanel}
            panelVisible={rightPanelVisible}
            languageSelector={<LanguageSelector />}
            themeToggle={<ThemeToggle />}
            onSignOut={handleSignOut}
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
                debouncedSave(currentSlide.id, boundElements)
              }}
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
              stream={cameraEnabled && !isRecording ? cameraStream : null}
              position={cameraBubblePosition.current}
              size={cameraBubbleSize.current}
              shape={cameraBubbleShape}
              borderColor={cameraBubbleBorderColor}
              borderWidth={cameraBubbleBorderWidth}
              borderRadius={cameraBubbleBorderRadius}
              videoRef={cameraVideoRef}
            />

            {/* Recording Preview Area - shown during recording */}
            <RecordingPreview
              visible={showRecordingPreview}
              width={recordingPreviewSize.width}
              height={recordingPreviewSize.height}
              cameraStream={cameraEnabled ? cameraStream : null}
              cameraPosition={cameraBubblePosition.current}
              cameraSize={cameraBubbleSize.current}
              cameraShape={cameraBubbleShape}
              cameraBorderColor={cameraBubbleBorderColor}
              cameraBorderWidth={cameraBubbleBorderWidth}
              cameraBorderRadius={cameraBubbleBorderRadius}
              onCameraPositionChange={(pos) => { cameraBubblePosition.current = pos }}
              onCameraSizeChange={(size) => { cameraBubbleSize.current = size }}
              onCameraBubbleStateChange={setCameraBubbleState}
              videoRef={cameraVideoRef}
            />

            {/* Draggable Recording Controls */}
            <DraggableRecordingControls
              state={isRecording ? "recording" : "idle"}
              duration={duration}
              onRecord={handleRecord}
              onStop={handleStop}
              cameraEnabled={cameraEnabled}
              micEnabled={micEnabled}
              onCameraToggle={handleToggleCamera}
              onMicToggle={handleToggleMic}
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

      {/* Projects Panel Overlay */}
      {projectsPanelVisible && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setProjectsPanelVisible(false)}
          />
          <div className="fixed top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">All Projects</h2>
              <button
                onClick={() => setProjectsPanelVisible(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <button
                onClick={() => {
                  handleCreateProject()
                  setProjectsPanelVisible(false)
                }}
                className="w-full mb-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Project
              </button>
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        handleOpenProject(project.id)
                        setProjectsPanelVisible(false)
                      }}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9333EA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default App
