import { useState, useCallback } from "react"
import { SlideThumbnail } from "./SlideThumbnail"

interface Slide {
  id: string
  name: string
  thumbnail?: string
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
    <div className="h-full flex flex-col items-center py-2 gap-2 overflow-y-auto">
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
          />
        </div>
      ))}
      <button
        onClick={onAdd}
        className="w-16 h-12 rounded border border-dashed border-border hover:border-primary flex items-center justify-center transition-colors text-muted-foreground hover:text-primary"
        title="Add slide"
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
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}
