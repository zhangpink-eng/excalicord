import type { ReactNode } from "react"

interface MainLayoutProps {
  header: ReactNode
  slideRail?: ReactNode
  canvas: ReactNode
  rightPanel?: ReactNode
  controlBar: ReactNode
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
      <div className="flex-1 flex overflow-hidden">
        {slideRail && (
          <div className="w-16 border-r bg-background flex-shrink-0">
            {slideRail}
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">{canvas}</div>
        </div>
        {rightPanel && (
          <div className="w-[280px] border-l bg-background flex-shrink-0 overflow-y-auto">
            {rightPanel}
          </div>
        )}
      </div>
      <div className="h-16 border-t bg-background flex-shrink-0">
        {controlBar}
      </div>
    </div>
  )
}
