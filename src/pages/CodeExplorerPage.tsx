import React, { useState } from 'react'
import {
  Menu,
  X,
  FileCode,
  Sparkles,
  Copy,
  Check
} from 'lucide-react'
import type { FileTreeNode, FileContentData, RepoInfo } from '../types'
import { FileExplorer } from '../components/FileExplorer'
import { CodeViewer } from '../components/CodeViewer'
import { formatFileSize } from '../utils/tree'

interface CodeExplorerPageProps {
  repo: RepoInfo | null
  currentBranch: string
  tree: FileTreeNode[]
  isTreeTruncated: boolean
  isTreeLoading: boolean
  selectedNode: FileTreeNode | null
  fileContent: FileContentData | null
  isFileLoading: boolean
  fileError: string | null
  onSelectFile: (node: FileTreeNode) => void
  onRetryFile: () => void
}

export const CodeExplorerPage: React.FC<CodeExplorerPageProps> = ({
  repo,
  currentBranch,
  tree,
  isTreeTruncated,
  isTreeLoading,
  selectedNode,
  fileContent,
  isFileLoading,
  fileError,
  onSelectFile,
  onRetryFile,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [pathCopied, setPathCopied] = useState(false)

  const handleCopyPath = () => {
    if (!selectedNode) return
    navigator.clipboard.writeText(selectedNode.path)
    setPathCopied(true)
    setTimeout(() => setPathCopied(false), 2000)
  }

  return (
    <div className="relative flex flex-1 overflow-hidden h-full">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden absolute top-2 left-2 z-20">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-md backdrop-blur dark:border-amber-500/40 dark:bg-slate-900 dark:text-amber-300"
        >
          {mobileDrawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span>Tree</span>
        </button>
      </div>

      {/* Left Sidebar: File Tree */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:w-76 shrink-0 dark:bg-slate-950 ${
          mobileDrawerOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="h-full pt-12 md:pt-0">
          <FileExplorer
            tree={tree}
            selectedPath={selectedNode?.path || null}
            onSelectFile={(node) => {
              onSelectFile(node)
              setMobileDrawerOpen(false)
            }}
            isTreeTruncated={isTreeTruncated}
            isLoading={isTreeLoading}
          />
        </div>
      </aside>

      {/* Overlay backdrop on mobile */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Center Main Panel: Code Studio */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-amber-200/40 dark:border-slate-800">
        <CodeViewer
          fileData={fileContent}
          isLoading={isFileLoading}
          error={fileError}
          onRetry={onRetryFile}
        />
      </main>

      {/* Right Column: File Inspector Compass */}
      {selectedNode && (
        <aside
          className={`hidden xl:flex flex-col w-72 shrink-0 bg-amber-50/30 dark:bg-slate-950 p-4 border-l border-amber-200/50 dark:border-slate-800 text-xs space-y-4 overflow-y-auto ${
            inspectorOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 dark:border-slate-800">
            <span className="font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 text-[11px] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Studio Compass
            </span>
            <button
              type="button"
              onClick={() => setInspectorOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              title="Close inspector"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* File Card */}
          <div className="rounded-xl border border-amber-300/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedNode.name}>
                {selectedNode.name}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                  {formatFileSize(selectedNode.size)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Branch:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{currentBranch}</span>
              </div>
              {selectedNode.sha && (
                <div className="flex justify-between">
                  <span>Blob SHA:</span>
                  <span className="font-mono text-slate-500">{selectedNode.sha.substring(0, 7)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyPath}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 transition"
            >
              {pathCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Path Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-amber-600" />
                  <span>Copy Full Path</span>
                </>
              )}
            </button>
          </div>

          {/* Repo Info Card */}
          {repo && (
            <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connected Sanctuary</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{repo.fullName}</p>
              <p className="text-[11px] text-slate-500 line-clamp-3">{repo.description || 'No description provided.'}</p>
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
