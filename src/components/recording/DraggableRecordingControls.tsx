import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui"
import type { RecordingState } from "@/types"

interface DraggableRecordingControlsProps {
  state: RecordingState
  duration: number
  onRecord: () => void
  onStop: () => void
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
}: DraggableRecordingControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const isRecording = state === "recording"
  const isCountdown = state === "countdown"

  // Initialize position to bottom-right after mount
  useEffect(() => {
    const containerWidth = 140
    const containerHeight = 48
    const margin = 80
    setPosition({
      x: window.innerWidth - containerWidth - margin,
      y: window.innerHeight - containerHeight - margin,
    })
  }, [])

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
      const containerWidth = 140
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
  }, [isDragging, dragStart])

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

      {/* Recording state indicator - only show when recording */}
      {isRecording && (
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-xs text-red-500">
            {formatDuration(duration)}
          </span>
        </div>
      )}

      {/* Record/Stop button */}
      {!isRecording ? (
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
      ) : (
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
          Stop
        </Button>
      )}
    </div>
  )
}
