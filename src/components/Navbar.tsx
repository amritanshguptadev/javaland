import React, { useState } from 'react'
import {
  GitBranch,
  RefreshCw,
  Check,
  Sun,
  Moon,
  Code2,
  FlaskConical,
  BarChart3,
  Globe,
  Home
} from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import type { BranchInfo, RepoInfo, SyncState, AppPage, AppTheme } from '../types'

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
  onManualRefresh: () => void
  onOpenConnectModal: () => void
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
  onManualRefresh,
  onOpenConnectModal,
}) => {
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(branchSearch.toLowerCase())
  )

  const navItems: { page: AppPage; label: string; icon: React.ReactNode }[] = [
    { page: 'home', label: 'Sanctuary', icon: <Home className="h-4 w-4" /> },
    { page: 'explorer', label: 'Studio', icon: <Code2 className="h-4 w-4" /> },
    { page: 'playground', label: 'Lab Runner', icon: <FlaskConical className="h-4 w-4" /> },
    { page: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-200/50 bg-white/95 backdrop-blur-md px-4 py-3 transition-colors dark:border-amber-500/20 dark:bg-slate-950/95 shadow-xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand Identity & Active Repository */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-baseline gap-1 text-left group transition cursor-pointer"
          >
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Java<span className="gold-gradient-text font-serif italic text-2xl font-normal">Land</span>
            </span>
          </button>

          {/* Active Repo Capsule with Switch Button */}
          {repo && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/70 pl-2.5 pr-1.5 py-1 text-xs dark:border-amber-500/30 dark:bg-slate-900">
              <GithubIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 max-w-[130px] truncate" title={repo.fullName}>
                {repo.name}
              </span>
              <button
                type="button"
                onClick={onOpenConnectModal}
                className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-slate-950 hover:bg-amber-400 transition"
                title="Switch repository or load default javascript-lab"
              >
                Switch
              </button>
            </div>
          )}
        </div>

        {/* Center: Clean Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activePage === item.page
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-amber-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Branch Dropdown */}
          {repo && branches.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                title="Switch branch"
              >
                <GitBranch className="h-3.5 w-3.5 text-amber-500" />
                <span className="max-w-[80px] truncate">{currentBranch || repo.defaultBranch}</span>
              </button>

              {branchDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setBranchDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 z-20 w-56 rounded-2xl border border-amber-200 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-amber-500/30 dark:bg-slate-900">
                    <div className="mb-2 px-1">
                      <input
                        type="text"
                        placeholder="Filter branches..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full rounded-lg border border-amber-200 bg-amber-50/50 px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-0.5">
                      {filteredBranches.map((b) => (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => {
                            onSelectBranch(b.name)
                            setBranchDropdownOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            b.name === currentBranch
                              ? 'bg-amber-100 font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'text-slate-700 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
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

          {/* Manual Refresh Button (Zero continuous polling) */}
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={syncState === 'checking'}
            title="Check for updates on GitHub"
            className="flex items-center justify-center rounded-full border border-amber-300/80 bg-white p-2 text-slate-700 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncState === 'checking' ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Midnight Obsidian & Gold' : 'Switch to Royal Ivory & Gold'}
            className="flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>

          {/* Connect Repo Button for Mobile / Small Screens */}
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="sm:hidden flex items-center justify-center rounded-full border border-amber-300/80 bg-white p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            title="Connect repository"
          >
            <Globe className="h-3.5 w-3.5 text-amber-500" />
          </button>

          {/* GitHub link */}
          {repo && (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50/60 p-2 text-amber-900 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-300"
              title="Open repository on GitHub"
            >
              <GithubIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
