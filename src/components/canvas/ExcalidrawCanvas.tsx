import * as ExcalidrawLib from "@excalidraw/excalidraw"

const Excalidraw = ExcalidrawLib

export function ExcalidrawCanvas() {
  return (
    <div className="w-full h-full overflow-hidden bg-canvas-light">
      <Excalidraw.Excalidraw />
    </div>
  )
}
