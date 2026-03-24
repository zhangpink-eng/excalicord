import { useState } from "react"

export type Tool = "select" | "draw" | "text" | "rectangle" | "ellipse" | "diamond" | "arrow" | "line" | "image"

interface CanvasOverlayProps {
  activeTool?: Tool
  onToolChange?: (tool: Tool) => void
}

export function CanvasOverlay({ activeTool = "select", onToolChange }: CanvasOverlayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
    {
      id: "select",
      label: "Select",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="m13 13 6 6" />
        </svg>
      ),
    },
    {
      id: "draw",
      label: "Draw",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      ),
    },
    {
      id: "text",
      label: "Text",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" x2="15" y1="20" y2="20" />
          <line x1="12" x2="12" y1="4" y2="20" />
        </svg>
      ),
    },
    {
      id: "rectangle",
      label: "Rectangle",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
      ),
    },
    {
      id: "ellipse",
      label: "Ellipse",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      id: "diamond",
      label: "Diamond",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      ),
    },
    {
      id: "arrow",
      label: "Arrow",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 14 0" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      ),
    },
    {
      id: "line",
      label: "Line",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className={`absolute left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-16"
      }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-background border rounded-full shadow-md flex items-center justify-center hover:bg-muted transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isCollapsed ? "rotate-0" : "rotate-180"}`}
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* Tools panel */}
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-2 flex flex-col gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange?.(tool.id)}
            title={isCollapsed ? tool.label : undefined}
            className={`p-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTool === tool.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tool.icon}
            {!isCollapsed && <span className="text-xs font-medium">{tool.label}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
