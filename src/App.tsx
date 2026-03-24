import { useCallback, useEffect, useRef, useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { DraggableRecordingControls } from "@/components/recording/DraggableRecordingControls"
import { RecordingPreview } from "@/components/recording/RecordingPreview"
import { PreviewPlayer } from "@/components/recording/PreviewPlayer"
import { ExcalidrawCanvas, CameraBubble } from "@/components/canvas"
import { RightPanel } from "@/components/layout/RightPanel"
import { LanguageSelector, ThemeToggle } from "@/components/ui"
import { useMediaDevices, useTranslation, useCanvasRecorder, useAvatar } from "@/hooks"
import { useAuth } from "@/contexts"
import { useProject } from "@/contexts"
import { LoginPage, SignUpPage, DashboardPage, PricingPage, AuthCallbackPage } from "@/pages"
import { analytics } from "@/services/api/analytics"
import { db } from "@/services/api/supabase"
import { defaultBeautySettings, type BeautySettings } from "@/services/beauty/BeautyFilter"
import type { BubbleShape } from "@/components/canvas/CameraBubbleSettings"

type Page = "login" | "signup" | "dashboard" | "editor"

// Default slide frame dimensions
const DEFAULT_FRAME_X = 100
const DEFAULT_FRAME_Y = 100
const DEFAULT_FRAME_WIDTH = 720
const DEFAULT_FRAME_HEIGHT = 540
const DEFAULT_FRAME_OFFSET_X = 800 // horizontal spacing between frames

// Generate slide frame element (as Excalidraw native frame)
function createSlideFrameElement(index: number, isActive: boolean, x: number, y: number, name?: string): any {
  return {
    id: `slide-frame-${index}`, // Use index for stable ID
    type: "frame",
    x,
    y,
    width: DEFAULT_FRAME_WIDTH,
    height: DEFAULT_FRAME_HEIGHT,
    strokeColor: isActive ? "#2563eb" : "#e5e7eb",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: isActive ? 4 : 2,
    borderRadius: 8,
    roughness: 0,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: index,
    version: 1,
    versionNonce: 0,
    isDeleted: false,
    boundElements: [],
    updated: 0,
    link: null,
    locked: false,
    name: name || `第${index + 1}页`,
  }
}

// Helper to generate slide frame elements for Excalidraw
// Uses stored positions from framePositionsRef for dragged frames
function createSlideFrameElements(
  slides: { id: string; name?: string }[],
  currentIndex: number,
  framePositions: Record<number, { x: number; y: number }>
): any[] {
  return slides.map((slide, index) => {
    const isActive = index === currentIndex
    const stored = framePositions[index]
    const x = stored ? stored.x : (DEFAULT_FRAME_X + index * DEFAULT_FRAME_OFFSET_X)
    const y = stored ? stored.y : DEFAULT_FRAME_Y
    return createSlideFrameElement(index, isActive, x, y, slide.name || `第${index + 1}页`)
  })
}

function App() {
  const { t } = useTranslation()
  const { user, isLoading: authLoading } = useAuth()

  // Use slides from ProjectContext (synced with database) - must be before useEffect that uses loadProject
  const { project, slides, addSlide: addSlideToProject, updateSlide, createProject, loadProject, updateProject } = useProject()

  const [currentPage, setCurrentPage] = useState<Page>(user ? "editor" : "login")
  const [showPricing, setShowPricing] = useState(false)
  const [projectName, setProjectName] = useState("Untitled Project")

  // Save state
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const pendingProjectNameRef = useRef<string | null>(null)

  // Sync currentPage with user state when auth changes
  // Auto-load last project if available
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // Try to load the last opened project from localStorage
        const lastProjectId = localStorage.getItem("lastProjectId")
        if (lastProjectId) {
          loadProject(lastProjectId).then(() => {
            setCurrentPage("editor")
          }).catch(() => {
            // If loading fails, just go to editor with empty state
            setCurrentPage("editor")
          })
        } else {
          setCurrentPage("editor")
        }
      } else {
        setCurrentPage("login")
      }
    }
  }, [user, authLoading, loadProject])

  // Track slide frame positions (keyed by index)
  const framePositionsRef = useRef<Record<number, { x: number; y: number }>>({})
  const [framePositionsState, setFramePositionsState] = useState<Record<number, { x: number; y: number }>>({})

  // Initialize frame positions when slides change
  useEffect(() => {
    // Only initialize if we have slides
    if (slides.length === 0) return

    slides.forEach((_, index) => {
      if (!framePositionsRef.current[index]) {
        framePositionsRef.current[index] = {
          x: DEFAULT_FRAME_X + index * DEFAULT_FRAME_OFFSET_X,
          y: DEFAULT_FRAME_Y,
        }
      }
    })
    // Sync to state for re-renders
    setFramePositionsState({ ...framePositionsRef.current })
  }, [slides])

  // Auto-save debounce refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Debounced save function for project name
  const debouncedProjectNameSave = useCallback((name: string) => {
    pendingProjectNameRef.current = name
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (project && pendingProjectNameRef.current) {
        setIsSaving(true)
        await updateProject({ title: pendingProjectNameRef.current })
        setLastSavedAt(new Date())
        setIsSaving(false)
        pendingProjectNameRef.current = null
      }
    }, 1000)
  }, [project, updateProject])

  // Manual save function
  const handleManualSave = useCallback(async () => {
    if (!project) return
    setIsSaving(true)
    // Save any pending project name
    if (pendingProjectNameRef.current) {
      await updateProject({ title: pendingProjectNameRef.current })
      pendingProjectNameRef.current = null
    } else {
      // If no pending name, just update with current name
      await updateProject({ title: projectName })
    }
    setLastSavedAt(new Date())
    setIsSaving(false)
  }, [project, projectName, updateProject])

  // Handle project name change
  const handleProjectNameChange = useCallback((name: string) => {
    setProjectName(name)
    if (project) {
      debouncedProjectNameSave(name)
    }
  }, [project, debouncedProjectNameSave])

  // Sync projectName when project loads
  useEffect(() => {
    if (project?.title) {
      setProjectName(project.title)
    }
  }, [project?.title])

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
  }, [])

  const handleAddSlide = useCallback(async () => {
    const newIndex = await addSlideToProject()
    if (newIndex >= 0) {
      setCurrentSlideIndex(newIndex)
    }
  }, [addSlideToProject])

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

  // AI Avatar state
  const [avatarEnabled, setAvatarEnabled] = useState(false)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  const {
    presets: avatarPresets,
    isLoading: avatarLoading,
    outputStream: avatarStream,
    selectAvatar,
    setExpression,
    setPosition: setAvatarPosition,
    start: startAvatar,
    stop: stopAvatar,
  } = useAvatar()

  // Avatar expression state
  const [avatarExpression, setAvatarExpression] = useState<"neutral" | "happy" | "serious">("neutral")

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
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const cameraBubblePosition = useRef({ x: 50, y: 50 })
  const cameraBubbleSize = useRef({ width: 120, height: 90 })

  // Camera bubble settings state
  const [cameraBubbleShape, setCameraBubbleShape] = useState<BubbleShape>("rounded-rect")
  const [cameraBubbleBorderColor, setCameraBubbleBorderColor] = useState("#ffffff")
  const [cameraBubbleBorderWidth, setCameraBubbleBorderWidth] = useState(3)
  const [cameraBubbleBorderRadius, setCameraBubbleBorderRadius] = useState(16)

  // Keep cameraStreamRef in sync with cameraStream
  useEffect(() => {
    cameraStreamRef.current = cameraStream
  }, [cameraStream])

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

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      // Only handle if on editor page and not recording
      if (currentPage !== "editor" || isRecording) return

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        goToSlide(Math.max(0, currentSlideIndex - 1))
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        goToSlide(Math.min(slides.length - 1, currentSlideIndex + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage, isRecording, currentSlideIndex, slides.length, goToSlide])

  const handleRecord = useCallback(async () => {
    // Show the recording preview first
    setShowRecordingPreview(true)

    // Start camera and mic, using the returned streams directly
    // Note: We use the return values directly instead of captured state to avoid closure issues
    let cameraStreamToUse = null
    let micStreamToUse = null

    try {
      cameraStreamToUse = await startCamera()
      setCameraEnabled(true)
    } catch (err) {
      console.error("Failed to start camera:", err)
    }

    try {
      micStreamToUse = await startMic()
      setMicEnabled(true)
    } catch (err) {
      console.error("Failed to start mic:", err)
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
    if (cameraStreamToUse) {
      const defaultPos = {
        x: recordingPreviewSize.width - cameraBubbleSize.current.width - 20,
        y: recordingPreviewSize.height - cameraBubbleSize.current.height - 20,
      }
      // Use avatar stream if avatar is enabled, otherwise use camera stream
      const streamForRecording = avatarEnabled && avatarStream ? avatarStream : cameraStreamToUse
      setCameraBubbleState({
        stream: streamForRecording,
        position: defaultPos,
        size: cameraBubbleSize.current,
        shape: cameraBubbleShape,
        borderRadius: cameraBubbleBorderRadius,
        borderColor: cameraBubbleBorderColor,
        borderWidth: cameraBubbleBorderWidth,
      })

      // Attach stream to video element and tell recorder about it
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = streamForRecording
        cameraVideoRef.current.play().catch(err => console.log("Video play error:", err))
        setCameraVideo(cameraVideoRef.current)
      }
    }

    // Pass mic stream to recorder for audio recording
    if (micStreamToUse) {
      console.log("[handleRecord] Setting audio stream, tracks:", micStreamToUse.getAudioTracks().length)
      setAudioStream(micStreamToUse)
    } else {
      console.log("[handleRecord] No mic stream available")
    }

    // Apply beauty settings to recorder
    setBeautySettings(beautyEnabled, beautySettings)

    // Start recording
    setIsRecording(true)
    startCanvasRecording()

    analytics.trackRecordingStarted(project?.id || "unknown")
  }, [startCamera, startMic, setExcalidrawCanvas, setCameraBubbleState, setCameraVideo, setAudioStream, setBeautySettings, setPreviewArea, beautyEnabled, beautySettings, startCanvasRecording, project, recordingPreviewSize, cameraBubbleShape, cameraBubbleBorderColor, cameraBubbleBorderWidth, cameraBubbleBorderRadius, avatarEnabled, avatarStream])

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
      if (avatarEnabled) {
        stopAvatar()
      }
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
        // If avatar is enabled, start avatar with the camera stream
        if (avatarEnabled) {
          startAvatar(stream)
        }
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
  }, [cameraEnabled, avatarEnabled, startCamera, stopCamera, setCameraBubbleState, cameraBubbleShape, cameraBubbleBorderColor, cameraBubbleBorderWidth, cameraBubbleBorderRadius, startAvatar, stopAvatar])

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

  // Toggle AI Avatar on/off
  const handleAvatarToggle = useCallback(() => {
    if (avatarEnabled) {
      stopAvatar()
      setAvatarEnabled(false)
    } else {
      setAvatarEnabled(true)
      // If no avatar selected, select the first one
      if (!selectedAvatarId && avatarPresets.length > 0) {
        setSelectedAvatarId(avatarPresets[0].id)
        selectAvatar(avatarPresets[0].id)
      }
      // Start avatar with camera stream if camera is enabled
      if (cameraEnabled && cameraStream) {
        startAvatar(cameraStream)
      }
    }
  }, [avatarEnabled, selectedAvatarId, avatarPresets, selectAvatar, stopAvatar, cameraEnabled, cameraStream, startAvatar])

  // Select avatar preset
  const handleAvatarSelect = useCallback((presetId: string) => {
    setSelectedAvatarId(presetId)
    selectAvatar(presetId)
    // If avatar is already running with camera, restart with new avatar
    if (avatarEnabled && cameraEnabled && cameraStream) {
      stopAvatar()
      startAvatar(cameraStream)
    }
  }, [selectAvatar, avatarEnabled, cameraEnabled, cameraStream, stopAvatar, startAvatar])

  // Change avatar expression
  const handleAvatarExpressionChange = useCallback((expression: "neutral" | "happy" | "serious") => {
    setAvatarExpression(expression)
    setExpression(expression)
  }, [setExpression])

  // Change avatar position
  const handleAvatarPositionPreset = useCallback((position: { x: number; y: number }) => {
    setAvatarPosition(position.x, position.y)
  }, [setAvatarPosition])

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
    const project = await createProject("Untitled Project")
    if (project) {
      localStorage.setItem("lastProjectId", project.id)
    }
    setCurrentPage("editor")
    analytics.trackProjectCreated(user?.id || "unknown", project?.id || "unknown")
  }, [createProject, user])

  const handleOpenProject = useCallback(async (projectId: string) => {
    await loadProject(projectId)
    localStorage.setItem("lastProjectId", projectId)
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
            onSave={handleManualSave}
            lastSavedAt={lastSavedAt}
            isSaving={isSaving}
          />
        }
        canvas={
          <div className="relative w-full h-full bg-canvas-light overflow-hidden">
            {/* Single shared Excalidraw canvas */}
            <ExcalidrawCanvas
              key={slides[currentSlideIndex]?.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              elements={(slides[currentSlideIndex]?.content?.elements || []).map((el: any) => ({
                ...el,
                frameId: `slide-frame-${currentSlideIndex}`, // Set frameId for containment
              }))}
              slideFrameElements={createSlideFrameElements(slides, currentSlideIndex, framePositionsState)}
              onElementsChange={(elements) => {
                const currentSlide = slides[currentSlideIndex]
                if (!currentSlide) return

                // Excalidraw handles frame containment natively
                // Elements inside a frame move with the frame automatically
                // Filter out frame elements and save content elements
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const contentElements = elements
                  .filter((el: any) => !el.id.startsWith("slide-frame-"))
                  .map((el: any) => ({
                    ...el,
                    slideId: currentSlide.id,
                  }))
                updateSlide(currentSlide.id, { content: { elements: contentElements } })
              }}
              onViewportChange={(scrollX, scrollY, zoom) => {
                // Viewport tracking - currently not used but available for future features
                console.debug(`Viewport: x=${scrollX}, y=${scrollY}, zoom=${zoom}`)
              }}
              onSlideFrameClick={(frameIndex) => {
                // frameIndex is the index from slide-frame-N
                if (frameIndex >= 0 && frameIndex < slides.length) {
                  goToSlide(frameIndex)
                }
              }}
            />

            <CameraBubble
              stream={cameraEnabled && !isRecording ? (avatarEnabled && avatarStream ? avatarStream : cameraStream) : null}
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
              cameraStream={cameraStream}
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

            {/* Floating Slide Rail on right side, vertically centered */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30">
              <div className="flex flex-col items-center gap-1 py-2 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border">
                <div className="text-[10px] font-medium text-muted-foreground mb-1">幻灯片</div>
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(index)}
                    className={`w-10 h-8 rounded border flex items-center justify-center transition-all ${
                      currentSlideIndex === index
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                    title={slide.name || `Slide ${index + 1}`}
                  >
                    <span className="text-xs font-medium">{index + 1}</span>
                  </button>
                ))}
                <button
                  onClick={handleAddSlide}
                  className="w-10 h-8 rounded border border-dashed border-border hover:border-primary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  title="添加幻灯片"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>

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
              avatarEnabled={avatarEnabled}
              avatarLoading={avatarLoading}
              avatarPresets={avatarPresets}
              selectedAvatarId={selectedAvatarId}
              avatarExpression={avatarExpression}
              onAvatarToggle={handleAvatarToggle}
              onAvatarSelect={handleAvatarSelect}
              onAvatarExpressionChange={handleAvatarExpressionChange}
              onAvatarPositionPreset={handleAvatarPositionPreset}
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
