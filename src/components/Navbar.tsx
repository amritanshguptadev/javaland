import React, { useState } from 'react'
import {
  GitBranch,
  RefreshCw,
  Check,
  Palette,
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
  onSelectTheme: (theme: AppTheme) => void
  repo: RepoInfo | null
  branches: BranchInfo[]
  currentBranch: string
  onSelectBranch: (branchName: string) => void
  syncState: SyncState
  onManualRefresh: () => void
  onOpenConnectModal: () => void
}

const THEME_OPTIONS: { id: AppTheme; label: string; desc: string; dot: string }[] = [
  { id: 'ivory-gold', label: 'Ivory Imperial', desc: 'Pearl Alabaster & Warm Gold', dot: 'bg-amber-400 border-amber-600' },
  { id: 'obsidian-gold', label: 'Midnight Obsidian', desc: 'Deep Onyx & 24K Gold', dot: 'bg-yellow-400 border-yellow-200' },
  { id: 'emerald-gold', label: 'Emerald Sanctuary', desc: 'Ancient Pine & Radiant Jade', dot: 'bg-emerald-400 border-emerald-200' },
  { id: 'sapphire-abyss', label: 'Sapphire Abyss', desc: 'Oceanic Trench & Cyan Wave', dot: 'bg-cyan-400 border-cyan-200' },
  { id: 'ruby-gold', label: 'Crimson Velvet', desc: 'Imperial Ruby & Rose Gold', dot: 'bg-rose-400 border-rose-200' },
  { id: 'cosmic-amethyst', label: 'Cosmic Amethyst', desc: 'Starlight Nebula & Violet Aurora', dot: 'bg-purple-400 border-purple-200' },
]

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  theme,
  onSelectTheme,
  repo,
  branches,
  currentBranch,
  onSelectBranch,
  syncState,
  onManualRefresh,
  onOpenConnectModal,
}) => {
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
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
    <header className="sticky top-0 z-40 w-full theme-nav border-b theme-border px-3 sm:px-6 py-2.5 sm:py-3 transition-colors shadow-xs">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Brand Identity & Active Repository */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-baseline gap-1 text-left group transition cursor-pointer"
            title="Go to JavaLand Sanctuary Home"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight theme-text-main">
              Java<span className="gold-gradient-text font-serif italic text-xl sm:text-2xl font-normal">Land</span>
            </span>
          </button>

          {/* Active Repo Capsule with Switch Button */}
          {repo && (
            <div className="hidden md:flex items-center gap-2 rounded-full border theme-border theme-surface-subtle pl-3 pr-1.5 py-1 text-xs">
              <span className="font-semibold theme-text-main max-w-[140px] truncate" title={repo.fullName}>
                {repo.name}
              </span>
              <button
                type="button"
                onClick={onOpenConnectModal}
                className="gold-button rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer"
                title="Switch repository or reload default javascript-lab"
              >
                Switch
              </button>
            </div>
          )}
        </div>

        {/* Center: Navigation Tabs (Fluid touch scroll on mobile) */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = activePage === item.page
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'theme-pill-active'
                    : 'theme-text-muted hover:theme-text-main hover:opacity-100'
                }`}
              >
                {item.icon}
                <span className="hidden xs:inline sm:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Branch Dropdown */}
          {repo && branches.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setBranchDropdownOpen(!branchDropdownOpen)
                  setThemeDropdownOpen(false)
                }}
                className="flex items-center gap-1 sm:gap-1.5 rounded-full border theme-border theme-surface px-2.5 sm:px-3 py-1.5 text-xs font-semibold theme-text-main transition hover:opacity-90 cursor-pointer"
                title="Switch branch"
              >
                <GitBranch className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span className="max-w-[70px] sm:max-w-[90px] truncate">{currentBranch || repo.defaultBranch}</span>
              </button>

              {branchDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setBranchDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-20 w-56 rounded-2xl border theme-border theme-surface p-2 shadow-2xl backdrop-blur-xl">
                    <div className="mb-2 px-1">
                      <input
                        type="text"
                        placeholder="Filter branches..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full rounded-lg border theme-border theme-surface-subtle px-2.5 py-1 text-xs theme-text-main placeholder-slate-400 focus:outline-none"
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
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                            b.name === currentBranch
                              ? 'theme-surface-elevated font-bold theme-text-main'
                              : 'theme-text-muted hover:theme-surface-subtle hover:theme-text-main'
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          {b.name === currentBranch && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={syncState === 'checking'}
            title="Check for updates on GitHub"
            className="flex items-center justify-center rounded-full border theme-border theme-surface p-1.5 sm:p-2 theme-text-main transition hover:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncState === 'checking' ? 'animate-spin' : ''}`} />
          </button>

          {/* 6-Theme Atmospheric Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setThemeDropdownOpen(!themeDropdownOpen)
                setBranchDropdownOpen(false)
              }}
              title="Select luxury atmospheric theme"
              className="flex items-center justify-center rounded-full border theme-border theme-surface-subtle p-1.5 sm:p-2 theme-text-main transition hover:opacity-80 cursor-pointer"
            >
              <Palette className="h-3.5 w-3.5" />
            </button>

            {themeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setThemeDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-20 w-60 rounded-2xl border theme-border theme-surface p-2 shadow-2xl backdrop-blur-xl space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                    Atmospheric Themes (6)
                  </div>
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSelectTheme(opt.id)
                        setThemeDropdownOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                        theme === opt.id
                          ? 'theme-surface-elevated font-bold theme-text-main border theme-border'
                          : 'theme-text-muted hover:theme-surface-subtle hover:theme-text-main'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-4 w-4 rounded-full border ${opt.dot} shadow-xs shrink-0`} />
                        <div>
                          <div className="font-semibold text-xs leading-none">{opt.label}</div>
                          <div className="text-[10px] opacity-70 mt-0.5 leading-none">{opt.desc}</div>
                        </div>
                      </div>
                      {theme === opt.id && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Connect Repo Button for Mobile View */}
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="md:hidden flex items-center justify-center rounded-full border theme-border theme-surface p-1.5 theme-text-main cursor-pointer"
            title="Switch repository"
          >
            <Globe className="h-3.5 w-3.5" />
          </button>

          {/* GitHub link */}
          {repo && (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center justify-center rounded-full border theme-border theme-surface-subtle p-2 theme-text-main transition hover:opacity-80 cursor-pointer"
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
