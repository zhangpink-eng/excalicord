import { useCallback, useEffect, useRef } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"

interface ExcalidrawCanvasProps {
  elements?: any[]
  slideFrameElements?: any[]
  onElementsChange?: (elements: any[]) => void
  onViewportChange?: (scrollX: number, scrollY: number, zoom: number) => void
  onSlideFrameClick?: (index: number) => void
  scrollToIndex?: number | null
}

export function ExcalidrawCanvas({
  elements = [],
  slideFrameElements = [],
  onElementsChange,
  onViewportChange,
  onSlideFrameClick,
  scrollToIndex,
}: ExcalidrawCanvasProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excalidrawApiRef = useRef<any | null>(null)
  // Track last scrolled index to avoid duplicate scrolls
  const lastScrolledIndexRef = useRef<number | null>(null)

  // Use onScrollChange callback for viewport tracking (much cleaner than polling)
  useEffect(() => {
    const api = excalidrawApiRef.current
    if (!api || !onViewportChange) return

    const unsubscribe = api.onScrollChange((scrollX: number, scrollY: number, zoom: { scale: number }) => {
      onViewportChange?.(scrollX, scrollY, zoom.scale)
    })

    return unsubscribe
  }, [onViewportChange])

  // Scroll to frame when scrollToIndex changes
  // We need to wait for Excalidraw to load elements into scene first
  const pendingScrollRef = useRef<number | null>(null)

  const attemptScroll = useCallback(() => {
    const api = excalidrawApiRef.current
    const scrollTo = pendingScrollRef.current
    if (!api || scrollTo === null || scrollTo === undefined) return

    const frameId = `slide-frame-${scrollTo}`
    const sceneElements = api.getSceneElements()
    console.log(`[ExcalidrawCanvas] attemptScroll, frameId=${frameId}, sceneElements=${sceneElements.length}`)
    const frameElement = sceneElements.find((el: any) => el.id === frameId)
    if (frameElement) {
      console.log(`[ExcalidrawCanvas] Scrolling to frame: ${frameId}`)
      api.scrollToContent(frameElement, { fitToContent: true, animate: true })
      lastScrolledIndexRef.current = scrollTo
      pendingScrollRef.current = null
    } else {
      console.log(`[ExcalidrawCanvas] Frame element not found, retrying...`)
      // Retry after a short delay
      setTimeout(attemptScroll, 50)
    }
  }, [])

  useEffect(() => {
    if (scrollToIndex === null || scrollToIndex === undefined) return
    if (scrollToIndex === lastScrolledIndexRef.current) return

    pendingScrollRef.current = scrollToIndex
    console.log(`[ExcalidrawCanvas] useEffect triggered, scrollToIndex=${scrollToIndex}, scheduling scroll`)

    // Try immediately in case elements are already loaded
    attemptScroll()
  }, [scrollToIndex, attemptScroll])

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
          console.log(`[ExcalidrawCanvas] excalidrawAPI callback, scrollToIndex=${scrollToIndex}`)
          // Try scrolling when API becomes available
          if (pendingScrollRef.current !== null && pendingScrollRef.current !== undefined) {
            // Small delay to let Excalidraw process initialData
            setTimeout(attemptScroll, 100)
          }
        }}
      />
    </div>
  )
}
