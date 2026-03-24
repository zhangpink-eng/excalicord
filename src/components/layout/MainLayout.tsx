import type { ReactNode } from "react"

interface MainLayoutProps {
  header: ReactNode
  slideRail?: ReactNode
  canvas: ReactNode
  rightPanel?: ReactNode
  controlBar?: ReactNode
}

export function MainLayout({
  header,
  slideRail,
  canvas,
  rightPanel,
  controlBar,
}: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {header}
      <div className="flex-1 flex overflow-hidden relative">
        {slideRail && (
          <div className="w-16 border-r bg-background flex-shrink-0 z-10">
            {slideRail}
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">{canvas}</div>
        </div>
        {/* Right panel floats over canvas */}
        {rightPanel && (
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-background/95 backdrop-blur-sm border-l overflow-y-auto z-20">
            {rightPanel}
          </div>
        )}
      </div>
      {controlBar && (
        <div className="h-16 border-t bg-background flex-shrink-0 z-30">
          {controlBar}
        </div>
      )}
    </div>
  )
}
