import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui"
import type { RecordingState } from "@/types"

interface DraggableRecordingControlsProps {
  state: RecordingState
  duration: number
  onRecord: () => void
  onStop: () => void
  cameraEnabled?: boolean
  micEnabled?: boolean
  onCameraToggle?: () => void
  onMicToggle?: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function DraggableRecordingControls({
  state,
  duration,
  onRecord,
  onStop,
  cameraEnabled = false,
  micEnabled = false,
  onCameraToggle,
  onMicToggle,
}: DraggableRecordingControlsProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const isRecording = state === "recording"
  const isCountdown = state === "countdown"

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 100,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-3 flex flex-col gap-2 min-w-[200px]"
    >
      {/* Drag handle indicator */}
      <div className="flex justify-center mb-1">
        <div className="w-8 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Recording state indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono text-red-500">{formatDuration(duration)}</span>
        </div>
      )}

      {/* Main controls */}
      <div className="flex items-center justify-center gap-2">
        {!isRecording ? (
          <Button
            variant="recording"
            onClick={onRecord}
            disabled={isCountdown}
            size="sm"
          >
            {isCountdown ? (
              "Starting..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="8" />
                </svg>
                Record
              </>
            )}
          </Button>
        ) : (
          <Button variant="destructive" onClick={onStop} size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            Stop
          </Button>
        )}
      </div>

      {/* Media toggles */}
      <div className="flex items-center justify-center gap-1 border-t pt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCameraToggle}
          className={cameraEnabled ? "text-primary" : "text-gray-400"}
          title={cameraEnabled ? "关闭摄像头" : "开启摄像头"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={cameraEnabled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMicToggle}
          className={micEnabled ? "text-primary" : "text-gray-400"}
          title={micEnabled ? "关闭麦克风" : "开启麦克风"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={micEnabled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
