import { useState } from "react"
import { Header, MainLayout } from "@/components/layout"
import { SlideRail } from "@/components/slides/SlideRail"
import { RecordingControls } from "@/components/recording/RecordingControls"
import { ExcalidrawCanvas } from "@/components/canvas/ExcalidrawCanvas"
import { RightPanel } from "@/components/layout/RightPanel"
import type { RecordingState } from "@/types"

function App() {
  const [projectName] = useState("Untitled Project")
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [duration] = useState(0)
  const [slides, setSlides] = useState([
    { id: "1", name: "Slide 1", thumbnail: "" },
    { id: "2", name: "Slide 2", thumbnail: "" },
    { id: "3", name: "Slide 3", thumbnail: "" },
  ])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const handleRecord = () => {
    if (recordingState === "idle" || recordingState === "stopped") {
      setRecordingState("countdown")
      setTimeout(() => {
        setRecordingState("recording")
      }, 3000)
    } else if (recordingState === "recording") {
      setRecordingState("paused")
    } else if (recordingState === "paused") {
      setRecordingState("recording")
    }
  }

  const handleStop = () => {
    setRecordingState("stopped")
  }

  const handleExport = () => {
    console.log("Export clicked")
  }

  const handleShare = () => {
    console.log("Share clicked")
  }

  const handleAddSlide = () => {
    const newSlide = {
      id: String(Date.now()),
      name: `Slide ${slides.length + 1}`,
      thumbnail: "",
    }
    setSlides([...slides, newSlide])
  }

  return (
    <MainLayout
      header={
        <Header
          projectName={projectName}
          onExport={handleExport}
          onShare={handleShare}
        />
      }
      slideRail={
        <SlideRail
          slides={slides}
          currentIndex={currentSlideIndex}
          onSelect={setCurrentSlideIndex}
          onAdd={handleAddSlide}
        />
      }
      canvas={<ExcalidrawCanvas />}
      rightPanel={<RightPanel />}
      controlBar={
        <RecordingControls
          state={recordingState}
          duration={duration}
          onRecord={handleRecord}
          onStop={handleStop}
        />
      }
    />
  )
}

export default App
