import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui"
import { useAuth } from "@/contexts"

interface DashboardPageProps {
  onSignOut: () => void
  onGoToProjects: () => void
}

export function DashboardPage({ onSignOut, onGoToProjects }: DashboardPageProps) {
  const { user } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-[#0F0E11]">
      {/* Navigation Bar */}
      <header className="bg-[#0F0E11] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Excalicord
            </span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Product</a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Solutions</a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Resources</a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center gap-4">
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  {/* User Name */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm text-white font-medium leading-tight">
                      {user?.fullName || "User"}
                    </p>
                  </div>
                  {/* Dropdown Arrow */}
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
                    className={`text-white/40 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm text-white font-medium">{user?.fullName || "User"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onGoToProjects()
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
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
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      My Projects
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onSignOut()
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
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
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Turn Your Ideas Into
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Videos</span>
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Create engaging whiteboard videos with AI-powered tools. Record your ideas, add camera bubbles, and export to MP4 in minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={onGoToProjects}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/20 px-8 py-6 text-lg"
            >
              Go to Projects
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Infinite Canvas</h3>
            <p className="text-white/60">Draw, annotate, and brainstorm on an unlimited whiteboard powered by Excalidraw.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                <path d="M15.6 11.6L22 7v10l-6.4-4.5v-1z" />
                <rect width="14" height="14" x="2" y="6" rx="2" ry="2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Screen Recording</h3>
            <p className="text-white/60">Record your canvas with camera bubble overlay and export as MP4 video.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Export Anywhere</h3>
            <p className="text-white/60">Export your videos in multiple formats including MP4, WebM, and GIF.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
