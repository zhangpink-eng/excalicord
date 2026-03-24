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
}

export function SlideRail({ slides, currentIndex, onSelect, onAdd, onDelete, onRename }: SlideRailProps) {
  return (
    <div className="h-full flex flex-col items-center py-2 gap-2 overflow-y-auto">
      {slides.map((slide, index) => (
        <SlideThumbnail
          key={slide.id}
          slide={slide}
          index={index}
          isSelected={currentIndex === index}
          onClick={() => onSelect(index)}
          onDelete={onDelete ? () => onDelete(slide.id) : undefined}
          onRename={onRename ? (name) => onRename(slide.id, name) : undefined}
          canDelete={slides.length > 1}
        />
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
