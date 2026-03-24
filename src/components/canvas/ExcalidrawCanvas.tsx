import { useCallback, useEffect, useRef } from "react"
import { Excalidraw, type ExcalidrawImperativeAPI } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"

interface ExcalidrawCanvasProps {
  elements?: any[]
  onElementsChange?: (elements: any[]) => void
  onViewportChange?: (scrollX: number, scrollY: number, zoom: number) => void
}

export function ExcalidrawCanvas({ elements = [], onElementsChange, onViewportChange }: ExcalidrawCanvasProps) {
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null)

  // Use onScrollChange callback for viewport tracking (much cleaner than polling)
  useEffect(() => {
    const api = excalidrawApiRef.current
    if (!api || !onViewportChange) return

    const unsubscribe = api.onScrollChange((scrollX, scrollY, zoom) => {
      onViewportChange?.(scrollX, scrollY, zoom.scale)
    })

    return unsubscribe
  }, [onViewportChange])

  return (
    <div className="excalidraw-canvas w-full h-full overflow-hidden bg-[#FAFAFA]">
      <Excalidraw
        initialData={{ elements }}
        onChange={(elements) => {
          onElementsChange?.([...elements])
        }}
        excalidrawAPI={(api) => {
          excalidrawApiRef.current = api
        }}
      />
    </div>
  )
}
