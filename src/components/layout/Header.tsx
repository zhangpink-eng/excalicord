import { Button } from "@/components/ui"
import { APP_NAME } from "@/lib/constants"

interface HeaderProps {
  projectName?: string
  onExport?: () => void
  onShare?: () => void
}

export function Header({ projectName, onExport, onShare }: HeaderProps) {
  return (
    <header className="h-12 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-sm">{APP_NAME}</span>
        </div>
        {projectName && (
          <>
            <span className="text-border">|</span>
            <span className="text-sm text-muted-foreground">{projectName}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Auto-saved</span>
        <Button variant="ghost" size="sm" onClick={onShare}>
          Share
        </Button>
        <Button size="sm" onClick={onExport}>
          Export
        </Button>
        <Button variant="ghost" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
      </div>
    </header>
  )
}
