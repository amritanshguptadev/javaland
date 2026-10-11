import React, { useState } from 'react'
import {
  GitBranch,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Pause,
  Play,
  Check,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import type { BranchInfo, RepoInfo, SyncState, RateLimitInfo } from '../types'

interface NavbarProps {
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Code<span className="text-sky-400">Vault</span>
              </span>
              <span className="ml-2 rounded border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
                Explorer
              </span>
            </div>
          </div>

          {repo && (
            <div className="hidden items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 sm:flex">
              <GithubIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-200">{repo.owner}</span>
              <span className="text-slate-500">/</span>
              <span className="font-bold text-sky-400">{repo.name}</span>
            </div>
          )}
        </div>

        {/* Branch selector & Sync Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch dropdown */}
          {repo && branches.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-sky-500"
                title="Switch branch"
              >
                <GitBranch className="h-3.5 w-3.5 text-sky-400" />
                <span className="max-w-[120px] truncate">{currentBranch || repo.defaultBranch}</span>
                <span className="text-[10px] text-slate-400">({branches.length})</span>
              </button>

              {branchDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setBranchDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 z-20 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl">
                    <div className="mb-2 px-1">
                      <input
                        type="text"
                        placeholder="Search branches..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
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
                          className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                            b.name === currentBranch
                              ? 'bg-sky-500/15 font-semibold text-sky-300'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          {b.name === currentBranch && <Check className="h-3.5 w-3.5 text-sky-400" />}
                        </button>
                      ))}
                      {filteredBranches.length === 0 && (
                        <p className="px-2 py-3 text-center text-xs text-slate-500">
                          No branches match "{branchSearch}"
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sync status indicator */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs">
            {syncState === 'synced' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="hidden text-slate-400 md:inline">Synced</span>
                <span className="text-[11px] text-slate-500">{formatLastSync(lastSyncTime)}</span>
              </>
            )}
            {syncState === 'checking' && (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
                <span className="text-sky-300">Checking...</span>
              </>
            )}
            {syncState === 'paused' && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span className="text-amber-300">Paused</span>
              </>
            )}
            {syncState === 'error' && (
              <>
                <AlertTriangle className="h-3 w-3 text-rose-400" />
                <span className="text-rose-400">Sync issue</span>
              </>
            )}
          </div>

          {/* Auto-sync Play/Pause button */}
          <button
            type="button"
            onClick={onToggleAutoSync}
            title={autoSyncEnabled ? 'Pause 60s auto-sync polling' : 'Resume 60s auto-sync polling'}
            className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
          >
            {autoSyncEnabled ? (
              <Pause className="h-3.5 w-3.5 text-slate-300" />
            ) : (
              <Play className="h-3.5 w-3.5 text-amber-400" />
            )}
          </button>

          {/* Manual Refresh button */}
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={syncState === 'checking'}
            title="Check for updates on GitHub now"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncState === 'checking' ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Rate Limit indicator */}
          {rateLimit && (
            <div
              className="hidden lg:flex items-center gap-1 rounded-lg border border-slate-800/80 bg-slate-900/60 px-2 py-1 text-[11px] text-slate-400"
              title={`GitHub API Rate Limit: ${rateLimit.remaining} of ${rateLimit.limit} remaining. Resets at ${new Date(rateLimit.resetTime).toLocaleTimeString()}`}
            >
              <Activity className="h-3 w-3 text-sky-400" />
              <span>
                API: <strong className="text-slate-200">{rateLimit.remaining}</strong>/{rateLimit.limit}
              </span>
            </div>
          )}

          {/* View on GitHub */}
          {repo && (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-700 hover:text-white"
              title="Open repository on GitHub"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
