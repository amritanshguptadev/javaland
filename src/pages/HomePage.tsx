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
      <section className="relative px-6 py-16 text-center border-b theme-border">
        <div className="relative mx-auto max-w-4xl space-y-6">
          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight theme-text-main leading-tight">
            Explore & Execute Code with <br />
            <span className="gold-gradient-text font-serif italic">Artisan Precision</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base theme-text-muted sm:text-lg leading-relaxed">
            Welcome to <strong className="theme-text-main">JavaLand</strong> — a creative developer workspace designed for exploring source code trees, running interactive JavaScript labs live, and analyzing repository architecture.
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
              className="theme-btn-secondary flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FlaskConical className="h-4 w-4 opacity-80" />
              <span>Interactive Lab Runner</span>
            </button>

            <button
              type="button"
              onClick={onOpenConnectModal}
              className="theme-btn-secondary flex items-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-semibold transition"
            >
              <Globe className="h-4 w-4 opacity-80" />
              <span>Switch Repository</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Showcase */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Permanent Showcase Card for javascript-lab */}
        {repo && (
          <div className="relative overflow-hidden rounded-3xl border-2 theme-border theme-surface-subtle p-8 shadow-xl backdrop-blur-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full theme-surface-elevated px-3 py-1 text-xs font-black theme-text-main border theme-border">
                    <Sparkles className="h-3 w-3" /> Flagship Showcase
                  </span>
                  {repo.language && (
                    <span className="rounded-full border theme-border theme-surface px-3 py-1 text-xs font-bold theme-text-main">
                      {repo.language}
                    </span>
                  )}
                  <span className="rounded-full theme-surface-elevated px-3 py-1 text-xs font-bold theme-text-muted">
                    {totalFiles} files indexed
                  </span>
                </div>

                <h2 className="text-3xl font-black theme-text-main">
                  {repo.owner} / <span className="gold-gradient-text font-serif italic">{repo.name}</span>
                </h2>

                <p className="max-w-2xl text-sm theme-text-muted leading-relaxed">
                  {repo.description || 'Interactive JavaScript algorithms, DOM challenges, and web projects (lab 1 to lab 6). Explore the directory structure or run scripts in the live sandbox.'}
                </p>

                {latestCommit && (
                  <div className="flex items-center gap-2 text-xs theme-text-muted pt-1">
                    <GitCommit className="h-4 w-4 opacity-80 shrink-0" />
                    <span>Latest Commit:</span>
                    <span className="font-mono font-bold theme-text-main">
                      {latestCommit.shortSha}
                    </span>
                    <span className="truncate max-w-sm theme-text-muted">
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
                  className="theme-btn-secondary flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition"
                >
                  <FlaskConical className="h-4 w-4 opacity-80" />
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
            className="group cursor-pointer rounded-3xl border-2 theme-border theme-surface p-7 shadow-sm transition-all hover:border-theme-strong hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl theme-surface-subtle border theme-border theme-text-main transition-colors group-hover:gold-button">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black theme-text-main group-hover:theme-gradient-text transition-colors">
              Code Studio
            </h3>
            <p className="mt-2 text-xs theme-text-muted leading-relaxed">
              Full-featured source code exploration with collapsible directory tree, instant filename search, sticky line numbers, copy, and file download.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold theme-text-main">
              <span>Open Code Studio</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Lab Runner */}
          <div
            onClick={() => onNavigate('playground')}
            className="group cursor-pointer rounded-3xl border-2 theme-border theme-surface p-7 shadow-sm transition-all hover:border-theme-strong hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl theme-surface-subtle border theme-border theme-text-main transition-colors group-hover:gold-button">
              <FlaskConical className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black theme-text-main group-hover:theme-gradient-text transition-colors">
              Live Lab Runner
            </h3>
            <p className="mt-2 text-xs theme-text-muted leading-relaxed">
              Run and interact with JavaScript DOM challenges and algorithm labs live in an isolated browser sandbox with real-time console log streaming.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold theme-text-main">
              <span>Run Interactive Labs</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Analytics */}
          <div
            onClick={() => onNavigate('analytics')}
            className="group cursor-pointer rounded-3xl border-2 theme-border theme-surface p-7 shadow-sm transition-all hover:border-theme-strong hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl theme-surface-subtle border theme-border theme-text-main transition-colors group-hover:gold-button">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black theme-text-main group-hover:theme-gradient-text transition-colors">
              Repository Analytics
            </h3>
            <p className="mt-2 text-xs theme-text-muted leading-relaxed">
              Quantitative inspection of code composition, visual percentage bars by file extension, total file volume, and largest file distributions.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold theme-text-main">
              <span>Inspect Metrics</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
