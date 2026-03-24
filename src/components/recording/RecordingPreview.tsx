import { useCallback, useEffect, useRef, useState } from "react"
import type { BubbleShape } from "@/components/canvas/CameraBubbleSettings"
import type { CameraBubbleState } from "@/services/video/CanvasRecorder"

interface RecordingPreviewProps {
  visible: boolean
  width: number
  height: number
  cameraStream: MediaStream | null
  cameraPosition: { x: number; y: number }
  cameraSize: { width: number; height: number }
  cameraShape: BubbleShape
  cameraBorderColor: string
  cameraBorderWidth: number
  cameraBorderRadius: number
  onCameraPositionChange: (pos: { x: number; y: number }) => void
  onCameraSizeChange: (size: { width: number; height: number }) => void
  onCameraBubbleStateChange?: (state: CameraBubbleState) => void
}

export function RecordingPreview({
  visible,
  width,
  height,
  cameraStream,
  cameraPosition,
  cameraSize,
  cameraShape,
  cameraBorderColor,
  cameraBorderWidth,
  cameraBorderRadius,
  onCameraPositionChange,
  onCameraSizeChange,
  onCameraBubbleStateChange,
}: RecordingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [localPosition, setLocalPosition] = useState(cameraPosition)
  const [localSize, setLocalSize] = useState(cameraSize)

  // Sync local state with props when they change externally
  useEffect(() => {
    setLocalPosition(cameraPosition)
  }, [cameraPosition])

  useEffect(() => {
    setLocalSize(cameraSize)
  }, [cameraSize])

  // Attach stream to video
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  const handleCameraMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - localPosition.x,
      y: e.clientY - localPosition.y,
    })
  }, [localPosition])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      // Constrain to recording area bounds
      const newX = Math.max(0, Math.min(width - localSize.width, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(height - localSize.height, e.clientY - dragOffset.y))
      const newPos = { x: newX, y: newY }
      setLocalPosition(newPos)
      onCameraPositionChange(newPos)

      // Also notify parent to update recorder state
      if (onCameraBubbleStateChange && cameraStream) {
        onCameraBubbleStateChange({
          stream: cameraStream,
          position: newPos,
          size: localSize,
          shape: cameraShape,
          borderRadius: cameraBorderRadius,
          borderColor: cameraBorderColor,
          borderWidth: cameraBorderWidth,
        })
      }
    }
    if (isResizing) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        // Calculate new size based on mouse position relative to container
        const containerLeft = rect.left
        const containerTop = rect.top
        const newWidth = Math.max(100, Math.min(400, e.clientX - containerLeft))
        const newHeight = Math.max(75, Math.min(300, e.clientY - containerTop))
        const newSize = { width: newWidth, height: newHeight }
        setLocalSize(newSize)
        onCameraSizeChange(newSize)

        // Also notify parent to update recorder state
        if (onCameraBubbleStateChange && cameraStream) {
          onCameraBubbleStateChange({
            stream: cameraStream,
            position: localPosition,
            size: newSize,
            shape: cameraShape,
            borderRadius: cameraBorderRadius,
            borderColor: cameraBorderColor,
            borderWidth: cameraBorderWidth,
          })
        }
      }
    }
  }, [isDragging, isResizing, width, height, localSize, localPosition, dragOffset, onCameraPositionChange, onCameraSizeChange, onCameraBubbleStateChange, cameraStream, cameraShape, cameraBorderColor, cameraBorderWidth, cameraBorderRadius])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  const getShapeStyle = (): React.CSSProperties => {
    switch (cameraShape) {
      case "circle":
        return { borderRadius: "50%" }
      case "pill":
        return { borderRadius: 9999 }
      default:
        return { borderRadius: cameraBorderRadius }
    }
  }

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    >
      {/* Recording area frame - transparent background with dashed border */}
      <div
        className="absolute bg-white/10 backdrop-blur-sm border-2 border-dashed border-red-500 pointer-events-auto"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Recording indicator */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">Recording</span>
        </div>

        {/* Size adjust handle - top right corner */}
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded cursor-se-resize pointer-events-auto"
          style={{ cursor: "se-resize" }}
        />

        {/* Camera bubble inside recording area */}
        {cameraStream && (
          <div
            onMouseDown={handleCameraMouseDown}
            style={{
              position: "absolute",
              left: localPosition.x,
              top: localPosition.y,
              width: localSize.width,
              height: localSize.height,
              ...getShapeStyle(),
              border: `${cameraBorderWidth}px solid ${cameraBorderColor}`,
              overflow: "hidden",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              zIndex: 10,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Resize handle for camera bubble */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation()
                setIsResizing(true)
              }}
              className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize"
              style={{
                background: "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.6) 50%)",
              }}
            />
          </div>
        )}
      </div>

      {/* Aspect ratio info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {width} × {height}
      </div>
    </div>
  )
}
