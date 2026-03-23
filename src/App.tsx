import { useCallback, useRef, useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { SlideRail } from "@/components/slides/SlideRail"
import { RecordingControls } from "@/components/recording/RecordingControls"
import { ExcalidrawCanvas, CameraBubble } from "@/components/canvas"
import { RightPanel } from "@/components/layout/RightPanel"
import { useMediaDevices, useSlides } from "@/hooks"
import type { ExportFormat } from "@/types"

function App() {
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

  const handleRecord = useCallback(() => {
    if (isRecording) {
      // Pause recording
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    } else {
      // Start recording
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

    // Create a demo blob for now
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

  return (
    <MainLayout
      header={
        <Header
          projectName={projectName}
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
