import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"

export function ExcalidrawCanvas() {
  return (
    <div className="excalidraw-canvas w-full h-full overflow-hidden bg-[#FAFAFA]">
      <Excalidraw />
    </div>
  )
}
