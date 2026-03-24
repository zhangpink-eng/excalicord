import { useState, useRef, useEffect, useCallback } from "react"

interface SlideElement {
  type: string
  x: number
  y: number
  width?: number
  height?: number
  strokeColor?: string
  backgroundColor?: string
  strokeWidth?: number
  text?: string
  textColor?: string
  fontSize?: number
}

interface Slide {
  id: string
  name: string
  thumbnail?: string
  content?: {
    elements?: SlideElement[]
  }
}

interface SlideThumbnailProps {
  slide: Slide
  index: number
  isSelected: boolean
  onClick: () => void
  onDelete?: () => void
  onRename?: (name: string) => void
  onResize?: (width: number, height: number) => void
  canDelete?: boolean
  showName?: boolean
}

export function SlideThumbnail({
  slide,
  index,
  isSelected,
  onClick,
  onDelete,
  onRename,
  onResize,
  canDelete = true,
  showName = true,
}: SlideThumbnailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(slide.name)
  const [thumbCanvas, setThumbCanvas] = useState<string | null>(slide.thumbnail || null)
  const [thumbSize, setThumbSize] = useState({ width: 40, height: 32 })
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Render slide elements to canvas for thumbnail
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const elements = slide.content?.elements || []

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match thumbnail display size (at 2x for retina)
    const dpr = 2
    canvas.width = thumbSize.width * dpr
    canvas.height = thumbSize.height * dpr
    ctx.scale(dpr, dpr)

    // Clear and fill background
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, thumbSize.width, thumbSize.height)

    if (elements.length === 0) {
      setThumbCanvas(null)
      return
    }

    // Calculate bounds of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    elements.forEach((el: SlideElement) => {
      if ("x" in el && "y" in el) {
        minX = Math.min(minX, el.x)
        minY = Math.min(minY, el.y)
        maxX = Math.max(maxX, el.x + ((el.width as number) || 0))
        maxY = Math.max(maxY, el.y + ((el.height as number) || 0))
      }
    })

    if (minX === Infinity) {
      setThumbCanvas(null)
      return
    }

    const contentWidth = maxX - minX || 1
    const contentHeight = maxY - minY || 1
    const scale = Math.min((thumbSize.width - 4) / contentWidth, (thumbSize.height - 4) / contentHeight, 1)

    const offsetX = (thumbSize.width - contentWidth * scale) / 2 - minX * scale
    const offsetY = (thumbSize.height - contentHeight * scale) / 2 - minY * scale

    // Render each element
    elements.forEach((el: SlideElement) => {
      if (!("x" in el)) return

      const x = el.x * scale + offsetX
      const y = el.y * scale + offsetY
      const w = (el.width as number) * scale || 0
      const h = (el.height as number) * scale || 0

      ctx.save()

      switch (el.type) {
        case "rectangle":
        case "line":
        case "diamond":
        case "ellipse": {
          const strokeColor = (el.strokeColor as string) || "#000"
          const fillColor = (el.backgroundColor as string) || "transparent"
          const strokeWidth = Math.max((el.strokeWidth as number) || 1, 0.5)

          ctx.strokeStyle = strokeColor
          ctx.lineWidth = strokeWidth
          ctx.fillStyle = fillColor

          if (el.type === "ellipse") {
            ctx.beginPath()
            ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
            if (fillColor !== "transparent") ctx.fill()
            ctx.stroke()
          } else {
            ctx.beginPath()
            if (el.type === "diamond") {
              ctx.moveTo(x + w / 2, y)
              ctx.lineTo(x + w, y + h / 2)
              ctx.lineTo(x + w / 2, y + h)
              ctx.lineTo(x, y + h / 2)
              ctx.closePath()
            } else {
              ctx.rect(x, y, w, h)
            }
            if (fillColor !== "transparent") ctx.fill()
            ctx.stroke()
          }
          break
        }
        case "text": {
          const text = (el.text as string) || ""
          const fontSize = Math.max((el.fontSize as number) || 14, 6) * scale
          ctx.fillStyle = (el.textColor as string) || "#000"
          ctx.font = `${fontSize}px Inter, sans-serif`
          ctx.textBaseline = "top"
          ctx.fillText(text, x, y, w)
          break
        }
      }

      ctx.restore()
    })

    // Convert to data URL
    setThumbCanvas(canvas.toDataURL("image/png"))
  }, [slide.content?.elements, slide.id, thumbSize])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: thumbSize.width,
      height: thumbSize.height,
    }
  }, [thumbSize])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y
      const newWidth = Math.max(30, Math.min(120, resizeStartRef.current.width + deltaX))
      const newHeight = Math.max(24, Math.min(96, resizeStartRef.current.height + deltaY))
      setThumbSize({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (onResize) {
        onResize(thumbSize.width, thumbSize.height)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, onResize, thumbSize])

  const handleDoubleClick = () => {
    if (onRename) {
      setEditName(slide.name)
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (editName.trim() && onRename) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditName(slide.name)
    }
  }

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }, [onDelete])

  return (
    <div
      ref={containerRef}
      className={`relative group flex flex-col items-center gap-1 ${
        isSelected ? "scale-105" : ""
      } transition-all duration-200`}
      style={{ cursor: isResizing ? "se-resize" : undefined }}
    >
      {/* Hidden canvas for rendering thumbnails */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Thumbnail area */}
      <div
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        className={`
          relative rounded border cursor-pointer overflow-hidden
          transition-all duration-200 select-none
          ${isSelected
            ? "border-primary shadow-lg ring-1 ring-primary/20"
            : "border-border hover:border-primary/50"
          }
        `}
        style={{ width: thumbSize.width, height: thumbSize.height }}
      >
        {thumbCanvas ? (
          <img
            src={thumbCanvas}
            alt={slide.name}
            className="w-full h-full object-contain bg-white"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-[8px] text-muted-foreground font-medium leading-none">
              {index + 1}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Resize handle */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute right-0 bottom-0 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: "linear-gradient(135deg, transparent 50%, rgba(37, 99, 235, 0.5) 50%)",
          }}
        />
      </div>

      {/* Slide number label - only show when showName is true */}
      {showName && (isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-16 h-5 text-[10px] text-center bg-background border border-primary rounded px-1 outline-none"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={`text-[10px] truncate max-w-16 ${
            isSelected ? "text-primary font-medium" : "text-muted-foreground"
          }`}
          title={slide.name}
        >
          {slide.name}
        </span>
      ))}

      {/* Delete button */}
      {canDelete && onDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive text-destructive-foreground rounded-full text-[6px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive/90 z-10 leading-none"
          title="删除幻灯片"
        >
          ×
        </button>
      )}
    </div>
  )
}
