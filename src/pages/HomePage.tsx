import React, { useState } from 'react'
import {
  Crown,
  Sparkles,
  Code2,
  FlaskConical,
  BarChart3,
  Search,
  GitCommit,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react'
import type { RepoInfo, GitCommitInfo, AppPage } from '../types'

interface HomePageProps {
  repo: RepoInfo | null
  latestCommit: GitCommitInfo | null
  totalFiles: number
  isLoading: boolean
  error: string | null
  onConnect: (url: string) => void
  onNavigate: (page: AppPage) => void
}

const FEATURED_REPOS = [
  {
    name: 'javascript-lab (Default)',
    url: 'https://github.com/amritanshguptadev/javascript-lab',
    desc: 'Interactive JavaScript algorithms, DOM labs, and web projects',
    lang: 'JavaScript',
    isDefault: true,
  },
  {
    name: 'facebook/react',
    url: 'https://github.com/facebook/react',
    desc: 'The library for web and native user interfaces',
    lang: 'JavaScript',
    isDefault: false,
  },
  {
    name: 'vuejs/core',
    url: 'https://github.com/vuejs/core',
    desc: 'Progressive JavaScript Framework for building modern web UI',
    lang: 'TypeScript',
    isDefault: false,
  },
  {
    name: 'tailwindlabs/tailwindcss',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    desc: 'A utility-first CSS framework for rapid UI development',
    lang: 'TypeScript',
    isDefault: false,
  },
]

export const HomePage: React.FC<HomePageProps> = ({
  repo,
  latestCommit,
  totalFiles,
  isLoading,
  error,
  onConnect,
  onNavigate,
}) => {
  const [inputUrl, setInputUrl] = useState('')

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputUrl.trim()) return
    onConnect(inputUrl.trim())
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 md:py-16 text-center border-b border-amber-200/40 dark:border-amber-500/20 bg-gradient-to-b from-amber-50/60 via-white to-transparent dark:from-amber-950/20 dark:via-slate-950 dark:to-slate-950">
        {/* Decorative Golden Orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-300/30 to-yellow-400/20 blur-3xl dark:from-amber-500/10 dark:to-yellow-500/10" />

        <div className="relative mx-auto max-w-4xl space-y-6">
          {/* Royal Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur dark:border-amber-500/30 dark:bg-slate-900/80">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              The Royal Repository Sanctuary
            </span>
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
          </div>

          {/* Majestic Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            Explore Repositories in <br />
            <span className="gold-gradient-text">Regal Elegance</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
            A bespoke, multi-page creative workspace for GitHub repositories. Browse nested source trees, execute interactive JavaScript labs live, and analyze code metrics with golden distinction.
          </p>

          {/* Quick Connect Bar */}
          <form onSubmit={handleConnect} className="mx-auto max-w-2xl pt-2">
            <div className="relative flex items-center rounded-2xl border-2 border-amber-300/70 bg-white p-1.5 shadow-xl shadow-amber-500/10 transition-all focus-within:border-amber-500 dark:border-amber-500/40 dark:bg-slate-900">
              <Search className="ml-3 h-5 w-5 text-amber-500" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter GitHub URL (e.g. https://github.com/amritanshguptadev/javascript-lab)"
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="gold-button flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <span>Connect</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-xs font-medium text-rose-500">{error}</p>
            )}
          </form>

          {/* Quick Repos Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Featured Repositories:</span>
            {FEATURED_REPOS.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => onConnect(item.url)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  item.isDefault
                    ? 'border-amber-400 bg-amber-100/80 text-amber-900 hover:bg-amber-200 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-amber-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Currently Connected Repository Showcase Banner */}
        {repo && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 p-6 md:p-8 shadow-xl backdrop-blur-md dark:border-amber-500/30 dark:bg-slate-900/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Globe className="h-3 w-3" /> Public Sanctuary
                  </span>
                  {repo.language && (
                    <span className="rounded-full border border-amber-300/60 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-amber-500/30 dark:bg-slate-800 dark:text-slate-200">
                      {repo.language}
                    </span>
                  )}
                  <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {totalFiles} files
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
                  {repo.owner} / <span className="gold-gradient-text">{repo.name}</span>
                </h2>

                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  {repo.description || 'Explore the complete directory structure and source files directly inside JavaLand.'}
                </p>

                {/* Commit info */}
                {latestCommit && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <GitCommit className="h-4 w-4 text-amber-500" />
                    <span>Latest Commit:</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                      {latestCommit.shortSha}
                    </span>
                    <span className="truncate max-w-xs font-medium text-slate-700 dark:text-slate-300">
                      — {latestCommit.message.split('\n')[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Deck */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('explorer')}
                  className="gold-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Open Code Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('playground')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-5 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-50 dark:border-amber-500/40 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
                >
                  <FlaskConical className="h-4 w-4 text-amber-500" />
                  <span>Launch Lab Sandbox</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('analytics')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Metrics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4 Feature Pillars Grid */}
        <div className="space-y-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Sanctuary Modules
            </h3>
            <p className="text-xs text-slate-500">
              Select a module to experience JavaLand's creative workspace capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Code Studio */}
            <div
              onClick={() => onNavigate('explorer')}
              className="group cursor-pointer rounded-2xl border border-amber-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950 dark:bg-amber-950/60 dark:text-amber-300">
                <Code2 className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Code Studio
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Full-featured source code browser with hierarchical directory navigation, syntax highlighting, and quick copy/download.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Enter Studio</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 2: Lab Sandbox */}
            <div
              onClick={() => onNavigate('playground')}
              className="group cursor-pointer rounded-2xl border border-amber-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 transition-colors group-hover:bg-yellow-500 group-hover:text-slate-950 dark:bg-yellow-950/60 dark:text-yellow-300">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Lab Runner
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Execute and interact with JavaScript labs directly in an isolated live browser sandbox without downloading anything.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Launch Sandbox</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 3: Analytics */}
            <div
              onClick={() => onNavigate('analytics')}
              className="group cursor-pointer rounded-2xl border border-amber-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950 dark:bg-amber-950/60 dark:text-amber-300">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Repository Analytics
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                In-depth breakdown of code languages, file size distributions, line metrics, and structure hierarchy insights.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>View Metrics</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 4: Settings & Sync */}
            <div
              onClick={() => onNavigate('settings')}
              className="group cursor-pointer rounded-2xl border border-amber-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700 transition-colors group-hover:bg-orange-500 group-hover:text-slate-950 dark:bg-orange-950/60 dark:text-orange-300">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Auto-Synchronizer
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Manage 60s live GitHub polling intervals, check API quotas, and configure cache invalidation preferences.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Configure Sync</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
