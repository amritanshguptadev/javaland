import { useState, useEffect, useCallback, useRef } from 'react'
import {
  parseRepoUrl,
  fetchRepoDetails,
  fetchRepoBranches,
  fetchLatestCommit,
  fetchRepoTree,
  fetchFileContent,
  onRateLimitChange,
} from './services/github'
import { buildFileTree } from './utils/tree'
import type {
  RepoInfo,
  BranchInfo,
  GitCommitInfo,
  FileTreeNode,
  FileContentData,
  SyncState,
  RateLimitInfo,
} from './types'
import { Navbar } from './components/Navbar'
import { RepoBar } from './components/RepoBar'
import { FileExplorer } from './components/FileExplorer'
import { CodeViewer } from './components/CodeViewer'
import { Toast } from './components/Toast'
import type { ToastMessage } from './components/Toast'
import { Menu, X, Terminal } from 'lucide-react'

const DEFAULT_REPO_URL = 'https://github.com/amritanshguptadev/javascript-lab'
const AUTO_SYNC_INTERVAL_MS = 60000 // 60 seconds efficient polling

export default function App() {
  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL)
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null)
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [currentBranch, setCurrentBranch] = useState<string>('')
  const [latestCommit, setLatestCommit] = useState<GitCommitInfo | null>(null)
  const [treeNodes, setTreeNodes] = useState<FileTreeNode[]>([])
  const [isTreeTruncated, setIsTreeTruncated] = useState(false)

  const [selectedFileNode, setSelectedFileNode] = useState<FileTreeNode | null>(null)
  const [fileContentData, setFileContentData] = useState<FileContentData | null>(null)

  // Loading & Error states
  const [isRepoLoading, setIsRepoLoading] = useState(false)
  const [isTreeLoading, setIsTreeLoading] = useState(false)
  const [isFileLoading, setIsFileLoading] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Auto-Sync state
  const [syncState, setSyncState] = useState<SyncState>('synced')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)

  // Rate limit
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null)

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Track rate limits globally
  useEffect(() => {
    return onRateLimitChange((info) => setRateLimit(info))
  }, [])

  // Connect and load repository
  const connectRepository = useCallback(
    async (url: string, targetBranchOverride?: string) => {
      const parsed = parseRepoUrl(url)
      if (!parsed) {
        setRepoError(
          'Invalid GitHub URL. Please provide a standard GitHub URL (e.g., https://github.com/amritanshguptadev/javascript-lab) or owner/repo format.'
        )
        return
      }

      setIsRepoLoading(true)
      setRepoError(null)
      setSelectedFileNode(null)
      setFileContentData(null)
      setFileError(null)

      try {
        // Step 1: Fetch repository metadata
        const details = await fetchRepoDetails(parsed.owner, parsed.repo)
        setRepoInfo(details)
        setRepoUrl(url)

        // Step 2: Fetch branches dynamically
        const branchList = await fetchRepoBranches(parsed.owner, parsed.repo, details.defaultBranch)
        setBranches(branchList)

        // Determine branch to activate (target override, default branch, or first branch)
        const activeBranch =
          targetBranchOverride ||
          details.defaultBranch ||
          (branchList.length > 0 ? branchList[0].name : 'main')
        setCurrentBranch(activeBranch)

        // Step 3: Fetch latest commit for this branch
        const commit = await fetchLatestCommit(parsed.owner, parsed.repo, activeBranch)
        setLatestCommit(commit)

        // Step 4: Fetch Git tree
        setIsTreeLoading(true)
        const treeResult = await fetchRepoTree(parsed.owner, parsed.repo, commit.sha)
        const builtTree = buildFileTree(treeResult.items)
        setTreeNodes(builtTree)
        setIsTreeTruncated(treeResult.isTruncated)

        setLastSyncTime(new Date())
        setSyncState('synced')

        // Auto-select README.md if present at root
        const readmeNode = builtTree.find(
          (n) => n.type === 'blob' && n.name.toLowerCase() === 'readme.md'
        )
        if (readmeNode) {
          loadFile(parsed.owner, parsed.repo, readmeNode, activeBranch)
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('Failed to connect repository:', errorMsg)
        setRepoError(errorMsg)
        setSyncState('error')
      } finally {
        setIsRepoLoading(false)
        setIsTreeLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Load file content
  const loadFile = useCallback(
    async (
      owner: string,
      repo: string,
      node: FileTreeNode,
      branch: string
    ) => {
      setSelectedFileNode(node)
      setIsFileLoading(true)
      setFileError(null)
      setSidebarOpen(false) // Close mobile drawer on selection

      try {
        const data = await fetchFileContent(owner, repo, node.path, branch, node.sha)
        setFileContentData(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setFileError(msg)
      } finally {
        setIsFileLoading(false)
      }
    },
    []
  )

  // Switch branch
  const handleSelectBranch = useCallback(
    async (branchName: string) => {
      if (!repoInfo || branchName === currentBranch) return
      setCurrentBranch(branchName)
      setIsTreeLoading(true)
      setSyncState('checking')

      try {
        const commit = await fetchLatestCommit(repoInfo.owner, repoInfo.name, branchName)
        setLatestCommit(commit)

        const treeResult = await fetchRepoTree(repoInfo.owner, repoInfo.name, commit.sha)
        const builtTree = buildFileTree(treeResult.items)
        setTreeNodes(builtTree)
        setIsTreeTruncated(treeResult.isTruncated)

        // If open file exists in new branch, refresh it, otherwise reset
        if (selectedFileNode) {
          const fileStillExists = treeResult.items.some(
            (i) => i.type === 'blob' && i.path === selectedFileNode.path
          )
          if (fileStillExists) {
            loadFile(repoInfo.owner, repoInfo.name, selectedFileNode, branchName)
          } else {
            setSelectedFileNode(null)
            setFileContentData(null)
            addToast({
              title: 'File not in branch',
              description: `"${selectedFileNode.path}" does not exist in branch ${branchName}.`,
              type: 'info',
            })
          }
        }

        setLastSyncTime(new Date())
        setSyncState('synced')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setSyncState('error')
        addToast({
          title: 'Branch switch failed',
          description: msg,
          type: 'error',
        })
      } finally {
        setIsTreeLoading(false)
      }
    },
    [repoInfo, currentBranch, selectedFileNode, loadFile, addToast]
  )

  // Automatic Sync Check logic (ETag/Commit SHA based)
  const checkForUpdates = useCallback(
    async (isManual = false) => {
      if (!repoInfo || !currentBranch) return

      // Don't poll if paused unless manually requested
      if (!autoSyncEnabled && !isManual) {
        setSyncState('paused')
        return
      }

      setSyncState('checking')

      try {
        const newCommit = await fetchLatestCommit(repoInfo.owner, repoInfo.name, currentBranch)

        // Check whether a new commit SHA was pushed to GitHub
        if (latestCommit && newCommit.sha !== latestCommit.sha) {
          // New commit detected!
          setLatestCommit(newCommit)

          // Refresh tree
          setIsTreeLoading(true)
          const treeResult = await fetchRepoTree(repoInfo.owner, repoInfo.name, newCommit.sha)
          const updatedTree = buildFileTree(treeResult.items)
          setTreeNodes(updatedTree)
          setIsTreeTruncated(treeResult.isTruncated)

          // If a file was open, refresh it if still existing
          if (selectedFileNode) {
            loadFile(repoInfo.owner, repoInfo.name, selectedFileNode, currentBranch)
          }

          addToast({
            title: 'Repository updated',
            description: `New commit detected: "${newCommit.message.split('\n')[0]}" (${newCommit.shortSha})`,
            type: 'success',
          })
        } else if (isManual) {
          addToast({
            title: 'Up to date',
            description: `Repository is already synchronized with commit ${newCommit.shortSha}.`,
            type: 'info',
          })
        }

        setLastSyncTime(new Date())
        setSyncState('synced')
      } catch (err: unknown) {
        console.warn('Sync check warning:', err)
        setSyncState('error')
        if (isManual) {
          const msg = err instanceof Error ? err.message : String(err)
          addToast({
            title: 'Sync failed',
            description: msg,
            type: 'error',
          })
        }
      } finally {
        setIsTreeLoading(false)
      }
    },
    [repoInfo, currentBranch, autoSyncEnabled, latestCommit, selectedFileNode, loadFile, addToast]
  )

  // Ref to always access latest checkForUpdates in intervals
  const checkRef = useRef(checkForUpdates)
  useEffect(() => {
    checkRef.current = checkForUpdates
  }, [checkForUpdates])

  // Periodic 60s polling
  useEffect(() => {
    if (!autoSyncEnabled) {
      setSyncState('paused')
      return
    }

    const interval = setInterval(() => {
      // Avoid polling if user has backgrounded the browser tab
      if (document.visibilityState === 'visible') {
        checkRef.current(false)
      }
    }, AUTO_SYNC_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [autoSyncEnabled])

  // Resume check when user tabs back into the browser
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoSyncEnabled) {
        checkRef.current(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [autoSyncEnabled])

  // Initial load on mount
  useEffect(() => {
    connectRepository(DEFAULT_REPO_URL)
  }, [connectRepository])

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navbar */}
      <Navbar
        repo={repoInfo}
        branches={branches}
        currentBranch={currentBranch}
        onSelectBranch={handleSelectBranch}
        syncState={syncState}
        lastSyncTime={lastSyncTime}
        onManualRefresh={() => checkForUpdates(true)}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={() => setAutoSyncEnabled(!autoSyncEnabled)}
        rateLimit={rateLimit}
      />

      {/* Repo Connect and Metadata Bar */}
      <RepoBar
        currentUrl={repoUrl}
        isLoading={isRepoLoading}
        error={repoError}
        repo={repoInfo}
        latestCommit={latestCommit}
        onConnect={(url) => connectRepository(url)}
      />

      {/* Main Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Toggle Button */}
        <div className="md:hidden absolute top-2 left-2 z-20">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow backdrop-blur"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span>Files</span>
          </button>
        </div>

        {/* Left Sidebar: File Explorer */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-slate-950 transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:w-80 shrink-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="h-full pt-12 md:pt-0">
            <FileExplorer
              tree={treeNodes}
              selectedPath={selectedFileNode?.path || null}
              onSelectFile={(node) => {
                if (repoInfo) {
                  loadFile(repoInfo.owner, repoInfo.name, node, currentBranch)
                }
              }}
              isTreeTruncated={isTreeTruncated}
              isLoading={isTreeLoading}
            />
          </div>
        </aside>

        {/* Overlay backdrop on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Right Main Panel: Built-in Source Code Viewer */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CodeViewer
            fileData={fileContentData}
            isLoading={isFileLoading}
            error={fileError}
            onRetry={() => {
              if (repoInfo && selectedFileNode) {
                loadFile(repoInfo.owner, repoInfo.name, selectedFileNode, currentBranch)
              }
            }}
          />
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 px-4 py-1.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400 font-mono">
            <Terminal className="h-3 w-3 text-sky-400" />
            CodeVault
          </span>
          {repoInfo && (
            <span>
              Connected to <strong className="text-slate-300">{repoInfo.fullName}</strong> ({currentBranch})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span>
            Auto-Sync: <span className={autoSyncEnabled ? 'text-emerald-400' : 'text-amber-400'}>{autoSyncEnabled ? 'Every 60s' : 'Paused'}</span>
          </span>
          {rateLimit && (
            <span>
              API Quota: <span className="text-slate-300">{rateLimit.remaining}</span>/{rateLimit.limit}
            </span>
          )}
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
