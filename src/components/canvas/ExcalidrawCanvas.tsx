import { useCallback, useEffect, useRef } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"

interface ExcalidrawCanvasProps {
  elements?: any[]
  slideFrameElements?: any[]
  onElementsChange?: (elements: any[]) => void
  onViewportChange?: (scrollX: number, scrollY: number, zoom: number) => void
  onSlideFrameClick?: (index: number) => void
}

export function ExcalidrawCanvas({
  elements = [],
  slideFrameElements = [],
  onElementsChange,
  onViewportChange,
  onSlideFrameClick,
}: ExcalidrawCanvasProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excalidrawApiRef = useRef<any | null>(null)

  // Use onScrollChange callback for viewport tracking (much cleaner than polling)
  useEffect(() => {
    const api = excalidrawApiRef.current
    if (!api || !onViewportChange) return

    const unsubscribe = api.onScrollChange((scrollX: number, scrollY: number, zoom: { scale: number }) => {
      onViewportChange?.(scrollX, scrollY, zoom.scale)
    })

    return unsubscribe
  }, [onViewportChange])

  // Handle element changes - detect slide frame clicks
  const handleChange = useCallback((allElements: any[]) => {
    // Check if any slide frame was clicked (simple detection via ID pattern)
    const frameClick = allElements.find(
      (el: any) => el.id.startsWith("slide-frame-") && el.backgroundColor === "#2563eb"
    )
    if (frameClick) {
      const frameIndex = parseInt(frameClick.id.replace("slide-frame-", ""), 10)
      if (!isNaN(frameIndex)) {
        onSlideFrameClick?.(frameIndex)
      }
    }
    onElementsChange?.([...allElements])
  }, [onElementsChange, onSlideFrameClick])

  // Combine regular elements with slide frame elements
  const allElements = [...slideFrameElements, ...elements]

  return (
    <div className="excalidraw-canvas w-full h-full overflow-hidden bg-[#FAFAFA]">
      <Excalidraw
        initialData={{ elements: allElements }}
        onChange={handleChange as any}
        excalidrawAPI={(api: any) => {
          excalidrawApiRef.current = api
        }}
      />
    </div>
  )
}
