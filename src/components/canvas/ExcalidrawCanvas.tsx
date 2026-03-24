import { useEffect, useRef } from "react"
import { Excalidraw, type ExcalidrawAPIType } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"

interface ExcalidrawCanvasProps {
  elements?: any[]
  onElementsChange?: (elements: any[]) => void
  onViewportChange?: (scrollX: number, scrollY: number, zoom: number) => void
}

export function ExcalidrawCanvas({ elements = [], onElementsChange, onViewportChange }: ExcalidrawCanvasProps) {
  const excalidrawRef = useRef<ExcalidrawAPIType>(null)

  // Poll viewport changes at ~30fps
  useEffect(() => {
    let lastScrollX = 0
    let lastScrollY = 0
    let lastZoom = 1

    const pollViewport = () => {
      const api = excalidrawRef.current
      if (!api) {
        rafId = requestAnimationFrame(pollViewport)
        return
      }

      const appState = api.getAppState()
      if (appState) {
        const { scrollX, scrollY, zoom } = appState
        // Only notify if values changed meaningfully
        if (Math.abs(scrollX - lastScrollX) > 0.5 || Math.abs(scrollY - lastScrollY) > 0.5 || Math.abs(zoom - lastZoom) > 0.001) {
          lastScrollX = scrollX
          lastScrollY = scrollY
          lastZoom = zoom
          onViewportChange?.(scrollX, scrollY, zoom)
        }
      }
      rafId = requestAnimationFrame(pollViewport)
    }

    let rafId = requestAnimationFrame(pollViewport)
    return () => cancelAnimationFrame(rafId)
  }, [onViewportChange])

  return (
    <div className="excalidraw-canvas w-full h-full overflow-hidden bg-[#FAFAFA]">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{ elements }}
        onChange={(elements) => {
          onElementsChange?.([...elements])
        }}
      />
    </div>
  )
}
