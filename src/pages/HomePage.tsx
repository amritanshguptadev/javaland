import React from 'react'
import {
  Code2,
  FlaskConical,
  BarChart3,
  GitCommit,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react'
import type { RepoInfo, GitCommitInfo, AppPage } from '../types'

interface HomePageProps {
  repo: RepoInfo | null
  latestCommit: GitCommitInfo | null
  totalFiles: number
  onNavigate: (page: AppPage) => void
  onOpenConnectModal: () => void
}

export const HomePage: React.FC<HomePageProps> = ({
  repo,
  latestCommit,
  totalFiles,
  onNavigate,
  onOpenConnectModal,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative px-6 py-16 text-center border-b border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-b from-amber-50/70 via-white to-transparent dark:from-amber-950/20 dark:via-slate-950 dark:to-slate-950">
        <div className="relative mx-auto max-w-4xl space-y-6">
          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Explore & Execute Code with <br />
            <span className="gold-gradient-text font-serif italic">Artisan Precision</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg leading-relaxed">
            Welcome to <strong className="text-slate-900 dark:text-white">JavaLand</strong> — a creative developer workspace designed for exploring source code trees, running interactive JavaScript labs live, and analyzing repository architecture.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => onNavigate('explorer')}
              className="gold-button flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg"
            >
              <Code2 className="h-4 w-4" />
              <span>Launch Code Studio</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('playground')}
              className="flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-900 shadow-sm transition hover:bg-amber-50 dark:border-amber-500/40 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
            >
              <FlaskConical className="h-4 w-4 text-amber-500" />
              <span>Interactive Lab Runner</span>
            </button>

            <button
              type="button"
              onClick={onOpenConnectModal}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <Globe className="h-4 w-4 text-amber-500" />
              <span>Switch Repository</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Showcase */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Permanent Showcase Card for javascript-lab */}
        {repo && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-600/10 p-8 shadow-xl backdrop-blur-md dark:border-amber-500/30 dark:bg-slate-900/60">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-black text-amber-800 dark:text-amber-300">
                    <Sparkles className="h-3 w-3" /> Permanent Showcase
                  </span>
                  {repo.language && (
                    <span className="rounded-full border border-amber-300/80 bg-white px-3 py-0.5 text-xs font-bold text-slate-700 dark:border-amber-500/30 dark:bg-slate-800 dark:text-slate-200">
                      {repo.language}
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {totalFiles} files indexed
                  </span>
                </div>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  {repo.owner} / <span className="gold-gradient-text font-serif italic">{repo.name}</span>
                </h2>

                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {repo.description || 'Interactive JavaScript algorithms, DOM challenges, and web projects (lab 1 to lab 6). Explore the directory structure or run scripts in the live sandbox.'}
                </p>

                {latestCommit && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <GitCommit className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Latest Commit:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {latestCommit.shortSha}
                    </span>
                    <span className="truncate max-w-sm text-slate-700 dark:text-slate-300">
                      — {latestCommit.message.split('\n')[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Pills */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('explorer')}
                  className="gold-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider shadow"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Browse Tree</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('playground')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-5 py-3 text-xs font-bold text-amber-900 transition hover:bg-amber-50 dark:border-amber-500/40 dark:bg-slate-800 dark:text-amber-300"
                >
                  <FlaskConical className="h-4 w-4 text-amber-500" />
                  <span>Execute Labs</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3 Creative Feature Studios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Studio */}
          <div
            onClick={() => onNavigate('explorer')}
            className="group cursor-pointer rounded-3xl border-2 border-amber-200/80 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950 dark:bg-amber-950/60 dark:text-amber-300">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Code Studio
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Full-featured source code exploration with collapsible directory tree, instant filename search, sticky line numbers, copy, and file download.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Open Code Studio</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Lab Runner */}
          <div
            onClick={() => onNavigate('playground')}
            className="group cursor-pointer rounded-3xl border-2 border-amber-200/80 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700 transition-colors group-hover:bg-yellow-500 group-hover:text-slate-950 dark:bg-yellow-950/60 dark:text-yellow-300">
              <FlaskConical className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Live Lab Runner
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Run and interact with JavaScript DOM challenges and algorithm labs live in an isolated browser sandbox with real-time console log streaming.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Run Interactive Labs</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Analytics */}
          <div
            onClick={() => onNavigate('analytics')}
            className="group cursor-pointer rounded-3xl border-2 border-amber-200/80 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950 dark:bg-amber-950/60 dark:text-amber-300">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Repository Analytics
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Quantitative inspection of code composition, visual percentage bars by file extension, total file volume, and largest file distributions.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Inspect Metrics</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
