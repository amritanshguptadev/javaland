import React, { useState } from 'react'
import {
  Crown,
  GitBranch,
  RefreshCw,
  ExternalLink,
  Pause,
  Play,
  Check,
  Activity,
  AlertTriangle,
  Sun,
  Moon,
  Home,
  Code2,
  FlaskConical,
  BarChart3,
  Settings
} from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import type { BranchInfo, RepoInfo, SyncState, RateLimitInfo, AppPage, AppTheme } from '../types'

interface NavbarProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  theme: AppTheme
  onToggleTheme: () => void
  repo: RepoInfo | null
  branches: BranchInfo[]
  currentBranch: string
  onSelectBranch: (branchName: string) => void
  syncState: SyncState
  lastSyncTime: Date | null
  onManualRefresh: () => void
  autoSyncEnabled: boolean
  onToggleAutoSync: () => void
  rateLimit: RateLimitInfo | null
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  theme,
  onToggleTheme,
  repo,
  branches,
  currentBranch,
  onSelectBranch,
  syncState,
  lastSyncTime,
  onManualRefresh,
  autoSyncEnabled,
  onToggleAutoSync,
  rateLimit,
}) => {
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(branchSearch.toLowerCase())
  )

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const navItems: { page: AppPage; label: string; icon: React.ReactNode }[] = [
    { page: 'home', label: 'Sanctuary', icon: <Home className="h-4 w-4" /> },
    { page: 'explorer', label: 'Code Studio', icon: <Code2 className="h-4 w-4" /> },
    { page: 'playground', label: 'Lab Runner', icon: <FlaskConical className="h-4 w-4" /> },
    { page: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { page: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-200/50 bg-white/90 backdrop-blur-md px-4 py-2.5 transition-colors dark:border-amber-500/20 dark:bg-slate-950/90 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Brand & Logo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group transition"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-md shadow-amber-500/30 ring-2 ring-amber-300/60 dark:ring-amber-500/30">
              <Crown className="h-5 w-5 text-slate-950 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Java<span className="gold-gradient-text">Land</span>
              </span>
              <span className="ml-2 hidden rounded-full border border-amber-400/40 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 sm:inline">
                Sanctuary
              </span>
            </div>
          </button>

          {/* Connected Repo Pill */}
          {repo && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50/80 px-3 py-1 text-xs text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
              <GithubIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{repo.owner}</span>
              <span className="text-amber-400">/</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{repo.name}</span>
            </div>
          )}
        </div>

        {/* Multi-Page Navigation Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activePage === item.page
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-amber-300'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Controls, Branch & Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Branch selector */}
          {repo && branches.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300/60 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                title="Switch branch"
              >
                <GitBranch className="h-3.5 w-3.5 text-amber-500" />
                <span className="max-w-[100px] truncate">{currentBranch || repo.defaultBranch}</span>
              </button>

              {branchDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setBranchDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 z-20 w-60 rounded-xl border border-amber-200 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-amber-500/30 dark:bg-slate-900">
                    <div className="mb-2 px-1">
                      <input
                        type="text"
                        placeholder="Search branches..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full rounded-md border border-amber-200 bg-amber-50/50 px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {filteredBranches.map((b) => (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => {
                            onSelectBranch(b.name)
                            setBranchDropdownOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${
                            b.name === currentBranch
                              ? 'bg-amber-100 font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'text-slate-700 hover:bg-amber-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          {b.name === currentBranch && <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sync status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/50 px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-900">
            {syncState === 'synced' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
                <span className="text-slate-600 dark:text-slate-400">{formatLastSync(lastSyncTime)}</span>
              </>
            )}
            {syncState === 'checking' && (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                <span className="text-amber-600 dark:text-amber-300">Checking...</span>
              </>
            )}
            {syncState === 'paused' && (
              <>
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span className="text-slate-500">Paused</span>
              </>
            )}
            {syncState === 'error' && (
              <>
                <AlertTriangle className="h-3 w-3 text-rose-500" />
                <span className="text-rose-500">Alert</span>
              </>
            )}
          </div>

          {/* Auto-sync Play/Pause button */}
          <button
            type="button"
            onClick={onToggleAutoSync}
            title={autoSyncEnabled ? 'Pause 60s auto-sync polling' : 'Resume 60s auto-sync polling'}
            className="flex items-center justify-center rounded-lg border border-amber-200 bg-white p-1.5 text-slate-600 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {autoSyncEnabled ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 text-amber-500" />
            )}
          </button>

          {/* Manual Refresh button */}
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={syncState === 'checking'}
            title="Check for updates on GitHub now"
            className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white p-1.5 text-xs font-medium text-slate-700 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncState === 'checking' ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Midnight Obsidian & Gold' : 'Switch to Royal Ivory & Gold'}
            className="flex items-center justify-center rounded-lg border border-amber-300/80 bg-amber-50 p-1.5 text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>

          {/* Rate Limit indicator */}
          {rateLimit && (
            <div
              className="hidden xl:flex items-center gap-1 rounded-lg border border-amber-300/60 bg-amber-50/50 px-2 py-1 text-[11px] text-amber-800 dark:border-slate-800 dark:bg-slate-900 dark:text-amber-400"
              title={`API Limit: ${rateLimit.remaining}/${rateLimit.limit}`}
            >
              <Activity className="h-3 w-3 text-amber-500" />
              <span>{rateLimit.remaining}</span>
            </div>
          )}

          {/* View on GitHub */}
          {repo && (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 rounded-lg border border-amber-300/80 bg-amber-50/60 px-2 py-1.5 text-xs text-amber-900 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-300"
              title="Open repository on GitHub"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <ExternalLink className="h-3 w-3 text-amber-500" />
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
