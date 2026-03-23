import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

export interface CameraBubbleProps {
  stream: MediaStream | null
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  shape?: "rounded-rect" | "circle" | "pill"
  borderRadius?: number
  borderColor?: string
  borderWidth?: number
  onPositionChange?: (pos: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
  videoRef?: RefObject<HTMLVideoElement | null>
}

export function CameraBubble({
  stream,
  position = { x: 50, y: 50 },
  size = { width: 200, height: 150 },
  shape = "rounded-rect",
  borderRadius = 16,
  borderColor = "#ffffff",
  borderWidth = 3,
  onPositionChange,
  onSizeChange,
  videoRef: externalVideoRef,
}: CameraBubbleProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const videoRef = externalVideoRef || internalVideoRef
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(position)
  const [s, setS] = useState(size)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setIsDragging(true)
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    }
  }, [pos])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newPos = { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }
      setPos(newPos)
      onPositionChange?.(newPos)
    }
    if (isResizing) {
      const newWidth = Math.max(100, e.clientX - pos.x)
      const newHeight = Math.max(75, e.clientY - pos.y)
      const newSize = { width: newWidth, height: newHeight }
      setS(newSize)
      onSizeChange?.(newSize)
    }
  }, [isDragging, isResizing, pos, onPositionChange, onSizeChange])

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
    switch (shape) {
      case "circle":
        return { borderRadius: "50%" }
      case "pill":
        return { borderRadius: 9999 }
      default:
        return { borderRadius }
    }
  }

  const isCircle = shape === "circle"

  // Don't render anything when stream is null (hidden by default)
  if (!stream) {
    return null
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: isCircle ? s.width : s.width,
        height: isCircle ? s.width : s.height,
        ...getShapeStyle(),
        border: `${borderWidth}px solid ${borderColor}`,
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
        }}
      />
      {/* Resize handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          setIsResizing(true)
        }}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 20,
          height: 20,
          cursor: "se-resize",
          background: "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%)",
        }}
      />
    </div>
  )
}
