import React, { useMemo } from 'react'
import {
  BarChart3,
  FileCode,
  FolderTree,
  HardDrive,
  GitBranch,
  Crown,
  GitCommit
} from 'lucide-react'
import type { FileTreeNode, RepoInfo, GitCommitInfo } from '../types'
import { formatFileSize } from '../utils/tree'

interface AnalyticsPageProps {
  repo: RepoInfo | null
  tree: FileTreeNode[]
  currentBranch: string
  latestCommit: GitCommitInfo | null
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  repo,
  tree,
  currentBranch,
  latestCommit,
}) => {
  // Aggregate file metrics
  const stats = useMemo(() => {
    let totalFiles = 0
    let totalFolders = 0
    let totalBytes = 0
    const extensionCounts: Record<string, { count: number; bytes: number }> = {}
    const allFilesList: { name: string; path: string; size: number }[] = []

    function traverse(nodes: FileTreeNode[]) {
      for (const node of nodes) {
        if (node.type === 'tree') {
          totalFolders++
          if (node.children) traverse(node.children)
        } else {
          totalFiles++
          const size = node.size || 0
          totalBytes += size
          allFilesList.push({ name: node.name, path: node.path, size })

          const ext = node.name.split('.').pop()?.toUpperCase() || 'OTHER'
          if (!extensionCounts[ext]) {
            extensionCounts[ext] = { count: 0, bytes: 0 }
          }
          extensionCounts[ext].count++
          extensionCounts[ext].bytes += size
        }
      }
    }

    traverse(tree)

    // Sort extensions by count
    const sortedExtensions = Object.entries(extensionCounts)
      .map(([ext, data]) => ({
        ext,
        count: data.count,
        bytes: data.bytes,
        percentage: totalFiles > 0 ? ((data.count / totalFiles) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.count - a.count)

    // Top largest files
    const topLargestFiles = [...allFilesList]
      .sort((a, b) => b.size - a.size)
      .slice(0, 8)

    return {
      totalFiles,
      totalFolders,
      totalBytes,
      sortedExtensions,
      topLargestFiles,
    }
  }, [tree])

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/50 pb-4 dark:border-amber-500/20">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Repository Intelligence</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Analytics & Structure <span className="gold-gradient-text">Metrics</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Quantitative analysis of code composition, size metrics, and directory distribution.
          </p>
        </div>

        {repo && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="rounded-xl border border-amber-300/80 bg-white p-2.5 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-medium text-slate-400">Branch:</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <GitBranch className="h-3.5 w-3.5" />
                <span>{currentBranch}</span>
              </div>
            </div>

            {latestCommit && (
              <div className="rounded-xl border border-amber-300/80 bg-white p-2.5 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-medium text-slate-400">Commit:</span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  <GitCommit className="h-3.5 w-3.5" />
                  <span>{latestCommit.shortSha}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Files */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-amber-500">
            <FileCode className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Files</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{stats.totalFiles}</p>
          <span className="text-xs text-slate-500">Tracked source files</span>
        </div>

        {/* Total Folders */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-yellow-500">
            <FolderTree className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Folders</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{stats.totalFolders}</p>
          <span className="text-xs text-slate-500">Directories & subtrees</span>
        </div>

        {/* Total Code Volume */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-amber-600">
            <HardDrive className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volume</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{formatFileSize(stats.totalBytes)}</p>
          <span className="text-xs text-slate-500">Total repository payload</span>
        </div>

        {/* Stargazers */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-yellow-500">
            <Crown className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stars</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{repo?.stars ?? 0}</p>
          <span className="text-xs text-slate-500">GitHub community stars</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Language & File Type Distribution */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              File Extension Distribution
            </h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              {stats.sortedExtensions.length} types
            </span>
          </div>

          <div className="space-y-3">
            {stats.sortedExtensions.map((item) => (
              <div key={item.ext} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    .{item.ext.toLowerCase()}
                  </span>
                  <span className="text-slate-500">
                    {item.count} files ({item.percentage}%) • {formatFileSize(item.bytes)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top Largest Files */}
        <div className="rounded-2xl border-2 border-amber-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Largest Files by Size
            </h3>
            <span className="text-xs text-slate-400">Byte breakdown</span>
          </div>

          <div className="space-y-2">
            {stats.topLargestFiles.map((file, i) => (
              <div
                key={file.path}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <span className="font-bold text-amber-500">#{i + 1}</span>
                  <span className="truncate font-mono text-slate-700 dark:text-slate-300" title={file.path}>
                    {file.path}
                  </span>
                </div>
                <span className="shrink-0 font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {formatFileSize(file.size)}
                </span>
              </div>
            ))}
            {stats.topLargestFiles.length === 0 && (
              <p className="text-xs text-slate-400 italic">No files available to calculate size metrics.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
