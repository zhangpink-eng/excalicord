import type { ReactNode } from "react"

export function RightPanel() {
  return (
    <div className="p-4">
      <h3 className="font-semibold text-sm mb-4">Tools</h3>
      <div className="space-y-1">
        <ToolButton icon="pencil" label="Draw" active />
        <ToolButton icon="type" label="Text" />
        <ToolButton icon="square" label="Shapes" />
        <ToolButton icon="image" label="Image" />
      </div>

      <h3 className="font-semibold text-sm mb-4 mt-6">Beautify</h3>
      <div className="space-y-1">
        <ToolButton icon="sparkles" label="Effects" />
        <ToolButton icon="sliders" label="Adjustments" />
      </div>
    </div>
  )
}

function ToolButton({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active?: boolean
}): ReactNode {
  const icons: Record<string, ReactNode> = {
    pencil: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
    type: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" x2="15" y1="20" y2="20" />
        <line x1="12" x2="12" y1="4" y2="20" />
      </svg>
    ),
    square: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
      </svg>
    ),
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    sparkles: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    sliders: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="2" x2="6" y1="14" y2="14" />
        <line x1="10" x2="14" y1="8" y2="8" />
        <line x1="18" x2="22" y1="16" y2="16" />
      </svg>
    ),
  }

  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {icons[icon]}
      <span>{label}</span>
    </button>
  )
}
