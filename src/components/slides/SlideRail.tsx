import { useState, useCallback } from "react"
import { SlideThumbnail } from "./SlideThumbnail"

interface SlideElement {
  type: string
  x: number
  y: number
  width?: number
  height?: number
  [key: string]: unknown
}

interface Slide {
  id: string
  name: string
  thumbnail?: string
  content?: {
    elements?: SlideElement[]
  }
}

interface SlideRailProps {
  slides: Slide[]
  currentIndex: number
  onSelect: (index: number) => void
  onAdd: () => void
  onDelete?: (id: string) => void
  onRename?: (id: string, name: string) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export function SlideRail({ slides, currentIndex, onSelect, onAdd, onDelete, onRename, onReorder }: SlideRailProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }, [dragOverIndex])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = draggedIndex
    if (fromIndex !== null && fromIndex !== toIndex && onReorder) {
      onReorder(fromIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, onReorder])

  return (
    <div className="h-full flex flex-col items-center py-2 gap-1 overflow-y-auto">
      {/* Header */}
      <div className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="3" x2="21" y1="9" y2="9" />
          <line x1="9" x2="9" y1="21" y2="9" />
        </svg>
        幻灯片
      </div>

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          draggable={!!onReorder}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            ${draggedIndex === index ? "opacity-50" : ""}
            ${dragOverIndex === index && draggedIndex !== index ? "transform scale-105" : ""}
            transition-all duration-200 cursor-grab active:cursor-grabbing
          `}
          style={{
            transform: dragOverIndex === index && draggedIndex !== index ? "scale(1.05)" : undefined,
          }}
        >
          <SlideThumbnail
            slide={slide}
            index={index}
            isSelected={currentIndex === index}
            onClick={() => onSelect(index)}
            onDelete={onDelete ? () => onDelete(slide.id) : undefined}
            onRename={onRename ? (name) => onRename(slide.id, name) : undefined}
            canDelete={slides.length > 1}
            showName={false}
          />
        </div>
      ))}
      <button
        onClick={onAdd}
        className="w-10 h-8 rounded border border-dashed border-border hover:border-primary flex items-center justify-center transition-colors text-muted-foreground hover:text-primary"
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
  )
}
