import React from 'react'
import {
  Settings,
  Clock,
  Activity,
  Trash2,
  Sun,
  Moon,
  Crown
} from 'lucide-react'
import type { RateLimitInfo, AppTheme } from '../types'
import { clearRepoCache } from '../services/github'

interface SettingsPageProps {
  theme: AppTheme
  onToggleTheme: () => void
  autoSyncEnabled: boolean
  onToggleAutoSync: () => void
  syncInterval: number
  onChangeSyncInterval: (intervalMs: number) => void
  rateLimit: RateLimitInfo | null
  onClearCache: () => void
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  theme,
  onToggleTheme,
  autoSyncEnabled,
  onToggleAutoSync,
  syncInterval,
  onChangeSyncInterval,
  rateLimit,
  onClearCache,
}) => {
  const intervals = [
    { label: '15 seconds', ms: 15000 },
    { label: '30 seconds', ms: 30000 },
    { label: '60 seconds (Standard)', ms: 60000 },
    { label: '120 seconds', ms: 120000 },
  ]

  const handleClearCache = () => {
    clearRepoCache()
    onClearCache()
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-amber-200/50 pb-4 dark:border-amber-500/20">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <Settings className="h-3.5 w-3.5" />
          <span>Sanctuary Preferences</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
          System & Sync <span className="gold-gradient-text">Configuration</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Customize automatic polling intervals, appearance themes, and GitHub API quotas.
        </p>
      </div>

      <div className="space-y-6">
        {/* Module 1: Theme & Visual Style */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aesthetic Theme</h3>
              <p className="text-xs text-slate-500">Switch between pristine Royal Ivory & Gold or Midnight Obsidian.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'light') onToggleTheme()
              }}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                theme === 'light'
                  ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/30'
                  : 'border-slate-200 hover:border-amber-300 bg-white dark:border-slate-800 dark:bg-slate-950'
              }`}
            >
              <Sun className="h-6 w-6 text-amber-500" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Royal Ivory & Gold</p>
                <p className="text-[11px] text-slate-500">Pristine white backdrop with liquid gold highlights.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark') onToggleTheme()
              }}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                theme === 'dark'
                  ? 'border-amber-500 bg-slate-900 shadow-md ring-2 ring-amber-400/30'
                  : 'border-slate-200 hover:border-amber-300 bg-white dark:border-slate-800 dark:bg-slate-950'
              }`}
            >
              <Moon className="h-6 w-6 text-amber-400" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Midnight Obsidian Gold</p>
                <p className="text-[11px] text-slate-500">Rich dark workspace with luminous 24K gold accents.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Module 2: Auto-Synchronization Preferences */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Commit Polling Interval</h3>
                <p className="text-xs text-slate-500">How frequently JavaLand checks GitHub for new pushes.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleAutoSync}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                autoSyncEnabled
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {autoSyncEnabled ? 'Auto-Sync: Active' : 'Auto-Sync: Paused'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {intervals.map((item) => (
              <button
                key={item.ms}
                type="button"
                onClick={() => onChangeSyncInterval(item.ms)}
                className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition ${
                  syncInterval === item.ms
                    ? 'border-amber-500 bg-amber-500 text-slate-950 shadow font-bold'
                    : 'border-slate-200 hover:border-amber-300 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Module 3: GitHub API Rate Limits */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">GitHub API Quota</h3>
              <p className="text-xs text-slate-500">Live tracker for GitHub unauthenticated REST API quota.</p>
            </div>
          </div>

          {rateLimit ? (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">
                  Remaining Requests: <strong className="text-amber-600 dark:text-amber-400">{rateLimit.remaining}</strong> of {rateLimit.limit}
                </span>
                <span className="text-slate-500">
                  Resets: {new Date(rateLimit.resetTime).toLocaleTimeString()}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                  style={{ width: `${Math.max(5, (rateLimit.remaining / rateLimit.limit) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">API header details will populate on the next request.</p>
          )}
        </div>

        {/* Module 4: Cache Management */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Purge In-Memory Cache</h3>
              <p className="text-xs text-slate-500">Flush locally cached tree and file contents to fetch fresh data.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  )
}
