import { useCallback, useEffect, useRef, useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { DraggableRecordingControls } from "@/components/recording/DraggableRecordingControls"
import { RecordingPreview } from "@/components/recording/RecordingPreview"
import { PreviewPlayer } from "@/components/recording/PreviewPlayer"
import { ExcalidrawCanvas, CameraBubble } from "@/components/canvas"
import { RightPanel } from "@/components/layout/RightPanel"
import { LanguageSelector, ThemeToggle } from "@/components/ui"
import { useMediaDevices, useTranslation, useAvatar, useSlides, useRecordingFlow } from "@/hooks"
import { useAuth } from "@/contexts"
import { useProject } from "@/contexts"
import { LoginPage, SignUpPage, DashboardPage, PricingPage, AuthCallbackPage } from "@/pages"
import { analytics } from "@/services/api/analytics"
import { db } from "@/services/api/supabase"
import { defaultBeautySettings, type BeautySettings } from "@/services/beauty/BeautyFilter"
import type { BubbleShape } from "@/components/canvas/CameraBubbleSettings"

/**
 * App - 应用根组件，协调整合层
 *
 * @description
 * App.tsx 是 Excalicord 的核心协调组件，负责：
 * - 页面路由（login/signup/dashboard/editor）
 * - 协调各 hook 和服务之间的交互
 * - 管理跨组件共享的 UI 状态
 * - 整合各个功能模块的输出
 *
 * @architecture
 * App 不直接实现业务逻辑，而是通过以下 hook 委托：
 * - {@link useSlides} - 幻灯片/帧状态管理
 * - {@link useRecordingFlow} - 录制状态机管理
 * - {@link useMediaDevices} - 摄像头/麦克风设备管理
 * - {@link useAvatar} - AI 虚拟形象管理
 * - {@link useProject} - 项目数据管理
 *
 * @example
 * 数据流：
 * 用户点击录制 → App.handleRecord → useRecordingFlow.startPreview
 *                                    → RecordingPreview 显示预览
 * 用户确认录制 → App.handleStartRecording → useRecordingFlow.startRecording
 *                                     → CanvasRecorder 开始捕获
 *
 * @see
 * - 技术架构文档: docs/technical-architecture.md
 * - 2.3 逻辑层架构
 */

type Page = "login" | "signup" | "dashboard" | "editor"

function App() {
  // =========================================================================
  // Section 1: Contexts & Hooks (数据层)
  // =========================================================================
  const { t } = useTranslation()
  const { user, isLoading: authLoading } = useAuth()

  // Project context - 数据持久化
  const { project, slides, updateSlide, createProject, loadProject, updateProject } = useProject()

  // Slide management hook - 幻灯片/帧状态
  const {
    currentSlideIndex,
    frameElements,
    frameDimensions,
    goToSlide,
    addSlide,
    aspectRatio,
    customWidth,
    customHeight,
    setAspectRatio,
    setCustomSize,
  } = useSlides()

  // =========================================================================
  // Section 2: Page & Project State (页面状态)
  // =========================================================================
  const [currentPage, setCurrentPage] = useState<Page>(user ? "editor" : "login")
  const [showPricing, setShowPricing] = useState(false)
  const [projectName, setProjectName] = useState("Untitled Project")

  // Save state
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const pendingProjectNameRef = useRef<string | null>(null)

  // =========================================================================
  // Section 3: Auth & Navigation Effects (认证 & 导航)
  // =========================================================================
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

  // Note: currentSlideIndex, goToSlide, addSlide, aspectRatio, customWidth, customHeight
  // are now managed by useSlides hook with localStorage persistence

  // =========================================================================
  // Section 4: Device & Recording Hooks (设备 & 录制)
  // =========================================================================
  const {
    cameraStream,
    startCamera,
    stopCamera,
    startMic,
    stopMic,
  } = useMediaDevices()

  // Recording flow state machine - 委托给 useRecordingFlow 管理
  const {
    state: recordingState,
    isPreviewing,
    showPreview,
    duration,
    startPreview,
    cancelPreview,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    setCameraBubbleState,
  } = useRecordingFlow()

  // =========================================================================
  // Section 5: Beauty & Avatar Settings (美颜 & 虚拟形象)
  // =========================================================================
  const [beautyEnabled, setBeautyEnabled] = useState(false)
  const [beautySettings, setBeautySettingsState] = useState<BeautySettings>(defaultBeautySettings)

  // AI Avatar state - 委托给 useAvatar 管理
  const [avatarEnabled, setAvatarEnabled] = useState(false)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  const {
    presets: avatarPresets,
    isLoading: avatarLoading,
    error: avatarError,
    outputStream: avatarStream,
    selectAvatar,
    setExpression,
    setScale: setAvatarScale,
    setPosition: setAvatarPosition,
    start: startAvatar,
    stop: stopAvatar,
  } = useAvatar()

  // Avatar expression state
  const [avatarExpression, setAvatarExpression] = useState<"neutral" | "happy" | "serious">("neutral")
  // Avatar scale state
  const [avatarScale, setAvatarScaleState] = useState(1.0)

  // =========================================================================
  // Section 6: UI State (UI 状态)
  // =========================================================================
  // Camera and mic toggle state (default: enabled)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Right panel visibility (default: visible for camera/mic controls)
  const [rightPanelVisible, setRightPanelVisible] = useState(true)

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

  // =========================================================================
  // Section 7: Camera Bubble Refs & Settings (摄像头气泡)
  // =========================================================================
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

      // Only handle if on editor page
      if (currentPage !== "editor") return

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
  }, [currentPage, currentSlideIndex, slides.length, goToSlide])

  // =========================================================================
  // Section 8: Recording Event Handlers (录制事件处理)
  // =========================================================================
  // 数据流: handleRecord → startPreview → RecordingPreview 显示
  //          handleStartRecording → startRecording → CanvasRecorder 开始捕获
  //          handleStop → stopRecording → 返回 Blob

  // Handle cancel from preview state
  const handleCancelRecording = useCallback(() => {
    cancelPreview()
  }, [cancelPreview])

  // Handle start recording from preview state
  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording()
    } catch (err) {
      console.error("Failed to start recording:", err)
    }
  }, [startRecording])

  // Handle record button click - enter preview state
  const handleRecord = useCallback(async () => {
    // Start camera and mic
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

    // Set up preview area for the recorder - use current slide's dimensions * 1.1
    const currentSlideDims = frameDimensions[currentSlideIndex] || { width: customWidth, height: customHeight }
    const previewAreaConfig = {
      x: 0,
      y: 0,
      width: Math.round(currentSlideDims.width * 1.1),
      height: Math.round(currentSlideDims.height * 1.1),
    }

    // Set up Excalidraw canvas reference
    const excalidrawCanvas = document.querySelector(".excalidraw-canvas canvas") as HTMLCanvasElement

    // Camera bubble size is 10% larger than slide
    const cameraBubbleDimensions = {
      width: Math.round(currentSlideDims.width * 1.1),
      height: Math.round(currentSlideDims.height * 1.1),
    }

    // Set up camera bubble state - default to bottom-right of preview area
    const defaultPos = {
      x: previewAreaConfig.width - cameraBubbleDimensions.width - 20,
      y: previewAreaConfig.height - cameraBubbleDimensions.height - 20,
    }
    // Use avatar stream if avatar is enabled, otherwise use camera stream
    const streamForRecording = avatarEnabled && avatarStream ? avatarStream : cameraStreamToUse

    const cameraBubbleConfig = {
      stream: streamForRecording,
      position: defaultPos,
      size: cameraBubbleSize.current,
      shape: cameraBubbleShape,
      borderRadius: cameraBubbleBorderRadius,
      borderColor: cameraBubbleBorderColor,
      borderWidth: cameraBubbleBorderWidth,
    }

    // Call startPreview with all the config
    await startPreview({
      previewArea: previewAreaConfig,
      cameraBubble: cameraBubbleConfig,
      canvas: excalidrawCanvas,
      cameraVideo: cameraVideoRef.current,
      audioStream: micStreamToUse,
      beautyEnabled,
      beautySettings,
      avatarEnabled,
      avatarStream,
      projectId: project?.id,
    })
  }, [startCamera, startMic, startPreview, frameDimensions, currentSlideIndex, customWidth, customHeight, avatarEnabled, avatarStream, beautyEnabled, beautySettings, cameraBubbleShape, cameraBubbleBorderColor, cameraBubbleBorderWidth, cameraBubbleBorderRadius, project])

  const handleStop = useCallback(async () => {
    await stopRecording()
  }, [stopRecording])

  // Handle pause recording
  const handlePauseRecording = useCallback(() => {
    pauseRecording()
  }, [pauseRecording])

  // Handle resume recording
  const handleResumeRecording = useCallback(() => {
    resumeRecording()
  }, [resumeRecording])

  // =========================================================================
  // Section 9: Preview & Export Handlers (预览 & 导出)
  // =========================================================================
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

  // =========================================================================
  // Section 10: Device Toggle Handlers (设备开关处理)
  // =========================================================================
  // 摄像头和麦克风的开关控制，通过 setCameraBubbleState 更新录制组件

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

  // Initialize camera and mic on mount (default enabled)
  useEffect(() => {
    const initMedia = async () => {
      if (cameraEnabled && !cameraStream) {
        try {
          const stream = await startCamera()
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
          console.error("Failed to start camera on init:", err)
        }
      }
      if (micEnabled) {
        try {
          await startMic()
        } catch (err) {
          console.error("Failed to start mic on init:", err)
        }
      }
    }
    initMedia()
  }, [])

  // =========================================================================
  // Section 11: Avatar & Share Handlers (虚拟形象 & 分享)
  // =========================================================================
  // 虚拟形象切换、表情、位置控制

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

  // =========================================================================
  // Section 12: Auth & Project Handlers (认证 & 项目)
  // =========================================================================
  // 登录、登出、项目创建/打开

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
              slideFrameElements={frameElements}
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
              scrollToIndex={currentSlideIndex}
            />

            <CameraBubble
              stream={cameraEnabled && (recordingState === "idle" || recordingState === "previewing") ? (avatarEnabled && avatarStream ? avatarStream : cameraStream) : null}
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
              visible={showPreview}
              isPreview={isPreviewing}
              width={Math.round((frameDimensions[currentSlideIndex]?.width || 1920) * 1.1)}
              height={Math.round((frameDimensions[currentSlideIndex]?.height || 1080) * 1.1)}
              cameraStream={cameraStream}
              cameraPosition={cameraBubblePosition.current}
              cameraSize={cameraBubbleSize.current}
              cameraShape={cameraBubbleShape}
              cameraBorderColor={cameraBubbleBorderColor}
              cameraBorderWidth={cameraBubbleBorderWidth}
              cameraBorderRadius={cameraBubbleBorderRadius}
              onCameraPositionChange={(pos) => { cameraBubblePosition.current = pos }}
              onCameraSizeChange={(size) => { cameraBubbleSize.current = size }}
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
                  onClick={addSlide}
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
              state={recordingState}
              duration={duration}
              onRecord={isPreviewing ? handleStartRecording : handleRecord}
              onStop={handleStop}
              onCancel={isPreviewing ? handleCancelRecording : undefined}
              onPause={recordingState === "recording" ? handlePauseRecording : undefined}
              onResume={recordingState === "paused" ? handleResumeRecording : undefined}
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
              avatarError={avatarError}
              avatarPresets={avatarPresets}
              selectedAvatarId={selectedAvatarId}
              avatarExpression={avatarExpression}
              avatarScale={avatarScale}
              onAvatarToggle={handleAvatarToggle}
              onAvatarSelect={handleAvatarSelect}
              onAvatarExpressionChange={handleAvatarExpressionChange}
              onAvatarPositionPreset={handleAvatarPositionPreset}
              onAvatarScaleChange={(scale) => {
                setAvatarScaleState(scale)
                setAvatarScale(scale)
              }}
              cameraEnabled={cameraEnabled}
              micEnabled={micEnabled}
              onCameraToggle={handleToggleCamera}
              onMicToggle={handleToggleMic}
              aspectRatio={aspectRatio}
              customWidth={customWidth}
              customHeight={customHeight}
              onAspectRatioChange={setAspectRatio}
              onCustomSizeChange={setCustomSize}
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
