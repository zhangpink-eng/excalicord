import { useState, useRef, useEffect } from "react"

interface Slide {
  id: string
  name: string
  thumbnail?: string
}

interface SlideThumbnailProps {
  slide: Slide
  index: number
  isSelected: boolean
  onClick: () => void
  onDelete?: () => void
  onRename?: (name: string) => void
  canDelete?: boolean
}

export function SlideThumbnail({
  slide,
  index,
  isSelected,
  onClick,
  onDelete,
  onRename,
  canDelete = true,
}: SlideThumbnailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(slide.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

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

  return (
    <div
      className={`relative group flex flex-col items-center gap-1 ${
        isSelected ? "scale-105" : ""
      } transition-all duration-200`}
    >
      {/* Thumbnail area */}
      <div
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        className={`
          relative w-16 h-12 rounded border-2 cursor-pointer overflow-hidden
          transition-all duration-200
          ${isSelected
            ? "border-primary shadow-lg ring-2 ring-primary/20"
            : "border-border hover:border-primary/50"
          }
        `}
      >
        {/* Placeholder for slide preview */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-medium">
            {index + 1}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Slide number label */}
      {isEditing ? (
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
      )}

      {/* Delete button */}
      {canDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive/90 z-10"
          title="Delete slide"
        >
          ×
        </button>
      )}
    </div>
  )
}
