import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui"
import type { RecordingState } from "@/types"

interface DraggableRecordingControlsProps {
  state: RecordingState
  duration: number
  onRecord: () => void
  onStop: () => void
  onCancel?: () => void
  onPause?: () => void
  onResume?: () => void
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
  onCancel,
  onPause,
  onResume,
}: DraggableRecordingControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const isRecording = state === "recording"
  const isPaused = state === "paused"
  const isCountdown = state === "countdown"
  const isPreviewing = state === "previewing"

  // Calculate container width based on state
  const getContainerWidth = () => {
    if (isPreviewing) return 280
    if (isRecording || isPaused) return 280
    return 140
  }

  // Initialize position to bottom-right after mount
  useEffect(() => {
    const containerWidth = getContainerWidth()
    const containerHeight = 48
    const margin = 80
    setPosition({
      x: window.innerWidth - containerWidth - margin,
      y: window.innerHeight - containerHeight - margin,
    })
  }, [state])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on a button
    const target = e.target as HTMLElement
    if (target.closest("button")) return

    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const containerWidth = getContainerWidth()
      const containerHeight = 48
      const newX = Math.max(0, Math.min(window.innerWidth - containerWidth, e.clientX - dragStart.x))
      const newY = Math.max(0, Math.min(window.innerHeight - containerHeight, e.clientY - dragStart.y))
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
  }, [isDragging, dragStart, state])

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
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg flex items-center gap-1 px-2 py-1.5"
    >
      {/* Drag handle indicator - small dots */}
      <div className="flex flex-col gap-0.5 mr-1 cursor-grab active:cursor-grabbing">
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
        </div>
      </div>

      {/* Cancel button - only show in previewing state */}
      {isPreviewing && onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          size="sm"
          className="h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          取消
        </Button>
      )}

      {/* Recording state indicator - show when recording or paused */}
      {(isRecording || isPaused) && (
        <div className="flex items-center gap-1.5 mr-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-yellow-500"}`} />
          <span className={`font-mono text-xs ${isRecording ? "text-red-500" : "text-yellow-500"}`}>
            {formatDuration(duration)}
          </span>
        </div>
      )}

      {/* Previewing state: show Start Recording button */}
      {isPreviewing && (
        <Button
          variant="recording"
          onClick={onRecord}
          size="sm"
          className="h-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-1"
          >
            <circle cx="12" cy="12" r="8" />
          </svg>
          开始录制
        </Button>
      )}

      {/* Recording state: show Pause and Stop buttons */}
      {isRecording && (
        <>
          {onPause && (
            <Button
              variant="secondary"
              onClick={onPause}
              size="sm"
              className="h-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              暂停
            </Button>
          )}
          {onStop && (
            <Button variant="destructive" onClick={onStop} size="sm" className="h-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              停止
            </Button>
          )}
        </>
      )}

      {/* Paused state: show Resume and Stop buttons */}
      {isPaused && (
        <>
          {onResume && (
            <Button
              variant="recording"
              onClick={onResume}
              size="sm"
              className="h-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
              继续
            </Button>
          )}
          {onStop && (
            <Button variant="destructive" onClick={onStop} size="sm" className="h-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              停止
            </Button>
          )}
        </>
      )}

      {/* Idle state: show Record button */}
      {!isPreviewing && !isRecording && !isPaused && (
        <Button
          variant="recording"
          onClick={onRecord}
          disabled={isCountdown}
          size="sm"
          className="h-8"
        >
          {isCountdown ? (
            "Starting..."
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1"
              >
                <circle cx="12" cy="12" r="8" />
              </svg>
              Record
            </>
          )}
        </Button>
      )}
    </div>
  )
}
