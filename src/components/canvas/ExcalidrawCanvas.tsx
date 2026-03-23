import { useCallback, useRef, useState } from "react"
import ExcalidrawLib from "@excalidraw/excalidraw"

// Cast to any to avoid React 19 type incompatibility with Excalidraw
const Excalidraw = ExcalidrawLib as any

export function ExcalidrawCanvas() {
  const excalidrawRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [elements, setElements] = useState<any[]>([])

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: any[]) => {
      setElements(elements)
    },
    []
  )

  return (
    <div className="w-full h-full bg-canvas-light">
      <Excalidraw
        ref={excalidrawRef}
        initialElements={elements}
        onChange={handleChange}
        UIOptions={{
          canvas: {
            embeddableBrowser: false,
          },
        }}
      />
    </div>
  )
}
