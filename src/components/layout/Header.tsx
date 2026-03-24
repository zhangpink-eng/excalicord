import { useState } from "react"
import { Button } from "@/components/ui"
import { useTranslation } from "@/hooks/useTranslation"
import { APP_NAME } from "@/lib/constants"
import { useAuth } from "@/contexts"

interface HeaderProps {
  projectName?: string
  onProjectNameChange?: (name: string) => void
  onTogglePanel?: () => void
  onShare?: () => void
  onPricing?: () => void
  onOpenProjectsPanel?: () => void
  panelVisible?: boolean
  languageSelector?: React.ReactNode
  themeToggle?: React.ReactNode
  onSignOut?: () => void
}

export function Header({
  projectName,
  onProjectNameChange,
  onTogglePanel,
  onShare,
  onPricing,
  onOpenProjectsPanel,
  panelVisible,
  languageSelector,
  themeToggle,
  onSignOut,
}: HeaderProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(projectName || "")
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleStartEdit = () => {
    setEditName(projectName || "")
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editName.trim()) {
      onProjectNameChange?.(editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  return (
    <header className="h-12 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-sm">{APP_NAME}</span>
        </div>
        {projectName !== undefined && (
          <>
            <span className="text-border">|</span>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-sm bg-background border border-input rounded px-2 py-1 outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <span
                onClick={handleStartEdit}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                title={t("header.editProjectName")}
              >
                {projectName}
              </span>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        {languageSelector}
        {themeToggle}
        <span className="text-xs text-muted-foreground mr-2">{t("header.autoSaved")}</span>

        {/* Projects button */}
        {onOpenProjectsPanel && (
          <Button variant="ghost" size="icon" onClick={onOpenProjectsPanel} title="Projects">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </Button>
        )}

        {/* Pricing icon */}
        <Button variant="ghost" size="icon" onClick={onPricing} title={t("header.pricing")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </Button>

        {/* Share icon */}
        <Button variant="ghost" size="icon" onClick={onShare} title={t("header.share")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
          </svg>
        </Button>

        {/* Settings/Config icon to toggle right panel */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePanel}
          title={panelVisible ? t("header.hideSettings") : t("header.showSettings")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Button>

        {/* User Avatar */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-accent rounded-lg p-1 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-medium">
                    {user.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium">{user.fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {onSignOut && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onSignOut()
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
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
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    Sign out
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
