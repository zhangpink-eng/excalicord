interface Slide {
  id: string
  name: string
  thumbnail: string
}

interface SlideRailProps {
  slides: Slide[]
  currentIndex: number
  onSelect: (index: number) => void
  onAdd: () => void
}

export function SlideRail({ slides, currentIndex, onSelect, onAdd }: SlideRailProps) {
  return (
    <div className="h-full flex flex-col items-center py-2 gap-2">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => onSelect(index)}
          className={`w-12 h-10 rounded border-2 transition-colors ${
            currentIndex === index
              ? "border-primary bg-primary/10"
              : "border-transparent hover:border-border"
          }`}
          title={slide.name}
        >
          <span className="text-xs">{index + 1}</span>
        </button>
      ))}
      <button
        onClick={onAdd}
        className="w-12 h-10 rounded border border-dashed border-border hover:border-primary flex items-center justify-center transition-colors"
        title="Add slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
