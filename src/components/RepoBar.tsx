import React, { useState } from 'react'
import {
  Search,
  Star,
  GitFork,
  GitCommit,
  Clock,
  User,
  AlertCircle,
  FolderGit2,
  Lock,
  Globe
} from 'lucide-react'
import type { RepoInfo, GitCommitInfo } from '../types'

interface RepoBarProps {
  currentUrl: string
  isLoading: boolean
  error: string | null
  repo: RepoInfo | null
  latestCommit: GitCommitInfo | null
  onConnect: (url: string) => void
}

const DEFAULT_REPO_URL = 'https://github.com/amritanshguptadev/javascript-lab'

export const RepoBar: React.FC<RepoBarProps> = ({
  currentUrl,
  isLoading,
  error,
  repo,
  latestCommit,
  onConnect,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || DEFAULT_REPO_URL)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    const trimmed = inputUrl.trim()
    if (!trimmed) {
      setValidationError('Please enter a GitHub repository URL or owner/repo')
      return
    }
    onConnect(trimmed)
  }

  const handleQuickLoad = (url: string) => {
    setInputUrl(url)
    setValidationError(null)
    onConnect(url)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="border-b border-slate-800 bg-slate-900/40 px-4 py-3">
      {/* Repository Connect Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value)
              if (validationError) setValidationError(null)
            }}
            placeholder="Enter public GitHub repo URL (e.g. https://github.com/amritanshguptadev/javascript-lab)"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2 pl-9 pr-24 text-sm text-slate-100 placeholder-slate-500 shadow-inner transition focus:border-sky-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          {inputUrl && (
            <button
              type="button"
              onClick={() => setInputUrl('')}
              className="absolute inset-y-0 right-20 flex items-center px-2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="absolute inset-y-1 right-1 flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 text-xs font-semibold text-white shadow transition hover:bg-sky-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Loading
              </span>
            ) : (
              'Explore'
            )}
          </button>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] font-medium text-slate-500">Quick:</span>
          <button
            type="button"
            onClick={() => handleQuickLoad(DEFAULT_REPO_URL)}
            className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] text-sky-300 transition hover:border-sky-500 hover:bg-slate-800"
          >
            javascript-lab (Default)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLoad('https://github.com/facebook/react')}
            className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          >
            facebook/react
          </button>
          <button
            type="button"
            onClick={() => handleQuickLoad('https://github.com/vercel/next.js')}
            className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          >
            vercel/next.js
          </button>
        </div>
      </form>

      {/* Validation or API Error Banner */}
      {(validationError || error) && (
        <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <div className="flex-1">
            <span className="font-semibold">Unable to access repository: </span>
            <span>{validationError || error}</span>
          </div>
        </div>
      )}

      {/* Connected Repository Info Strip */}
      {repo && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-200">
              <FolderGit2 className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-bold text-white">{repo.fullName}</span>
            </div>

            <div className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300">
              {repo.isPrivate ? (
                <>
                  <Lock className="h-3 w-3 text-amber-400" /> Private
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3 text-emerald-400" /> Public
                </>
              )}
            </div>

            {repo.language && (
              <span className="rounded bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                {repo.language}
              </span>
            )}

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1" title={`${repo.stars} stars`}>
                <Star className="h-3.5 w-3.5 text-amber-400" />
                {repo.stars}
              </span>
              <span className="flex items-center gap-1" title={`${repo.forks} forks`}>
                <GitFork className="h-3.5 w-3.5 text-slate-400" />
                {repo.forks}
              </span>
            </div>

            {repo.description && (
              <p className="w-full text-xs text-slate-400 sm:w-auto sm:max-w-md truncate">
                {repo.description}
              </p>
            )}
          </div>

          {/* Latest commit box */}
          {latestCommit && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300">
              <GitCommit className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <a
                href={latestCommit.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] font-semibold text-sky-400 hover:underline"
                title="View commit on GitHub"
              >
                {latestCommit.shortSha}
              </a>
              <span className="max-w-[180px] truncate text-slate-400" title={latestCommit.message}>
                {latestCommit.message.split('\n')[0]}
              </span>
              <div className="hidden items-center gap-1 text-[11px] text-slate-500 md:flex">
                <User className="h-3 w-3" />
                <span className="max-w-[80px] truncate">{latestCommit.authorName}</span>
                <Clock className="ml-1 h-3 w-3" />
                <span>{formatDate(latestCommit.authorDate)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
