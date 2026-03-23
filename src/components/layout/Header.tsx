import { Button, LanguageSelector } from "@/components/ui"
import { APP_NAME } from "@/lib/constants"

interface HeaderProps {
  projectName?: string
  onTogglePanel?: () => void
  onShare?: () => void
  onPricing?: () => void
  panelVisible?: boolean
}

export function Header({ projectName, onTogglePanel, onShare, onPricing, panelVisible }: HeaderProps) {
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
        <LanguageSelector />
        <span className="text-xs text-muted-foreground">Auto-saved</span>
        <Button variant="ghost" size="sm" onClick={onPricing}>
          Pricing
        </Button>
        <Button variant="ghost" size="sm" onClick={onShare}>
          Share
        </Button>
        {/* Settings/Config icon to toggle right panel */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePanel}
          title={panelVisible ? "隐藏设置" : "显示设置"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={panelVisible ? "currentColor" : "none"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Button>
      </div>
    </header>
  )
}
