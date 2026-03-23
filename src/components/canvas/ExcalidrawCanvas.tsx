import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"

interface ExcalidrawCanvasProps {
  elements?: any[]
  onElementsChange?: (elements: any[]) => void
}

export function ExcalidrawCanvas({ elements = [], onElementsChange }: ExcalidrawCanvasProps) {
  return (
    <div className="excalidraw-canvas w-full h-full overflow-hidden bg-[#FAFAFA]">
      <Excalidraw
        initialData={{ elements }}
        onChange={(elements) => {
          onElementsChange?.([...elements])
        }}
      />
    </div>
  )
}
