import React, { useState } from 'react'
import {
  X,
  Search,
  Sparkles,
  RotateCcw,
  Globe,
  AlertCircle
} from 'lucide-react'
import { GithubIcon } from './GithubIcon'

interface ConnectRepoModalProps {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
  onConnect: (url: string) => void
  isLoading: boolean
  error: string | null
}

const DEFAULT_REPO_URL = 'https://github.com/amritanshguptadev/javascript-lab'

const POPULAR_REPOS = [
  { name: 'javascript-lab (Default)', url: 'https://github.com/amritanshguptadev/javascript-lab', isDefault: true },
  { name: 'facebook/react', url: 'https://github.com/facebook/react', isDefault: false },
  { name: 'vuejs/core', url: 'https://github.com/vuejs/core', isDefault: false },
  { name: 'tailwindlabs/tailwindcss', url: 'https://github.com/tailwindlabs/tailwindcss', isDefault: false },
]

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onConnect,
  isLoading,
  error,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || DEFAULT_REPO_URL)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputUrl.trim()) return
    onConnect(inputUrl.trim())
    onClose()
  }

  const handleSelectRepo = (url: string) => {
    setInputUrl(url)
    onConnect(url)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-3xl border-2 theme-border theme-surface p-6 shadow-2xl space-y-5 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b theme-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gold-button">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold theme-text-main">
                Connect Repository
              </h3>
              <p className="text-[11px] theme-text-muted">
                Explore any public GitHub repository inside JavaLand.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 theme-text-muted hover:theme-text-main cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Permanent Flagship Showcase Card */}
        <div className="rounded-2xl border-2 theme-border theme-surface-subtle p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full theme-surface-elevated border theme-border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider theme-text-main">
              <Sparkles className="h-3 w-3" /> Flagship Showcase
            </span>
            <span className="text-[11px] font-bold theme-text-main">Default Project</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <h4 className="text-sm font-extrabold theme-text-main flex items-center gap-1.5">
                <GithubIcon className="h-4 w-4 opacity-80" />
                <span>amritanshguptadev / javascript-lab</span>
              </h4>
              <p className="text-xs theme-text-muted mt-0.5">
                Contains interactive algorithms and web project labs (lab 1 to lab 6).
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSelectRepo(DEFAULT_REPO_URL)}
              className="gold-button flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 ml-3"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Load Default</span>
            </button>
          </div>
        </div>

        {/* Connect Any Other Repo Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-bold theme-text-main">
            Or connect another public GitHub repository:
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 opacity-60" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. https://github.com/facebook/react or owner/repo"
              className="w-full rounded-xl border theme-border theme-surface-subtle py-2 pl-9 pr-24 text-xs theme-text-main placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1 top-1 gold-button rounded-lg px-3 py-1 text-xs font-bold disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Quick select pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold theme-text-muted">Quick Picks:</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_REPOS.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => handleSelectRepo(item.url)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                  item.isDefault
                    ? 'theme-pill-active border-transparent font-bold'
                    : 'theme-border theme-surface theme-text-muted hover:theme-text-main'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
