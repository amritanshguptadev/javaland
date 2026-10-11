import React from 'react'
import {
  Code2,
  FlaskConical,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  HardDrive,
  GitBranch,
  Activity,
  Globe
} from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import type { RepoInfo, RateLimitInfo, AppPage } from '../types'

interface FooterProps {
  repo: RepoInfo | null
  currentBranch: string
  onNavigate: (page: AppPage) => void
  onOpenConnectModal: () => void
  rateLimit: RateLimitInfo | null
}

export const Footer: React.FC<FooterProps> = ({
  repo,
  currentBranch,
  onNavigate,
  onOpenConnectModal,
  rateLimit,
}) => {
  return (
    <footer className="w-full border-t theme-border theme-nav transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 text-left cursor-pointer group"
            >
              <span className="text-xl font-black tracking-tight theme-text-main">
                Java<span className="gold-gradient-text font-serif italic text-2xl font-normal">Land</span>
              </span>
              <span className="rounded-full border theme-border theme-surface-elevated px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest theme-text-main">
                Studio
              </span>
            </button>
            <p className="text-xs theme-text-muted leading-relaxed">
              A bespoke developer platform crafted for exploring source code, executing interactive JavaScript labs live, and analyzing repository architecture.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs theme-text-main font-semibold">
              <ShieldCheck className="h-4 w-4 shrink-0 opacity-80" />
              <span>Public Read-Only • Zero Login Required</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider theme-text-main">
              Studio Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="theme-text-muted hover:theme-text-main transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Sanctuary Home</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('explorer')}
                  className="theme-text-muted hover:theme-text-main transition cursor-pointer flex items-center gap-1.5"
                >
                  <Code2 className="h-3.5 w-3.5 opacity-80" />
                  <span>Code Studio</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('playground')}
                  className="theme-text-muted hover:theme-text-main transition cursor-pointer flex items-center gap-1.5"
                >
                  <FlaskConical className="h-3.5 w-3.5 opacity-80" />
                  <span>Live Lab Runner</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('analytics')}
                  className="theme-text-muted hover:theme-text-main transition cursor-pointer flex items-center gap-1.5"
                >
                  <BarChart3 className="h-3.5 w-3.5 opacity-80" />
                  <span>Repository Analytics</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenConnectModal}
                  className="font-bold theme-text-main hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Globe className="h-3.5 w-3.5 opacity-80" />
                  <span>Switch / Connect Repo →</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Permanent Showcase Project */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider theme-text-main">
              Flagship Showcase
            </h4>
            <div className="rounded-2xl border theme-border theme-surface-subtle p-3.5 space-y-2">
              <a
                href="https://github.com/amritanshguptadev/javascript-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-bold text-xs theme-text-main hover:opacity-80 transition"
                title="Open javascript-lab on GitHub"
              >
                <GithubIcon className="h-4 w-4 shrink-0 opacity-80" />
                <span className="truncate">amritanshguptadev / javascript-lab</span>
              </a>
              <p className="text-[11px] theme-text-muted leading-snug">
                Permanent default home repository with interactive DOM algorithms and web challenges.
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="flex items-center gap-1 theme-text-muted">
                  <GitBranch className="h-3 w-3 opacity-80" />
                  <span>{currentBranch || 'main'}</span>
                </span>
                <a
                  href="https://github.com/amritanshguptadev/javascript-lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold theme-text-main hover:underline"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: API Efficiency & Quota */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider theme-text-main">
              API Optimization
            </h4>
            <div className="rounded-2xl border theme-border theme-surface p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <HardDrive className="h-3.5 w-3.5 shrink-0" />
                <span>Persistent Caching Active</span>
              </div>
              <p className="text-[11px] theme-text-muted leading-snug">
                Trees and files are persistently cached. Browsing files consumes 0 GitHub API calls.
              </p>
              {rateLimit && (
                <div className="pt-1 border-t theme-border flex items-center justify-between text-[11px] theme-text-muted">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 opacity-80 shrink-0" />
                    <span>Free Quota:</span>
                  </span>
                  <span className="font-bold theme-text-main">
                    {rateLimit.remaining} / {rateLimit.limit}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar without "Crafted with for developers" */}
        <div className="mt-8 pt-6 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs theme-text-muted">
          <p>© {new Date().getFullYear()} JavaLand. Curated with golden precision.</p>
          <div className="flex items-center gap-4">
            <a
              href={repo ? repo.htmlUrl : 'https://github.com/amritanshguptadev/javascript-lab'}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-text-main hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>Source Repository</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
