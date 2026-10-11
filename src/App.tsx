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
  AppPage,
  AppTheme,
} from './types'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { CodeExplorerPage } from './pages/CodeExplorerPage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'
import { Toast } from './components/Toast'
import type { ToastMessage } from './components/Toast'
import { Crown } from 'lucide-react'

const DEFAULT_REPO_URL = 'https://github.com/amritanshguptadev/javascript-lab'

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home')
  const [theme, setTheme] = useState<AppTheme>('light') // Golden & White by default

  const [, setRepoUrl] = useState(DEFAULT_REPO_URL)
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
  const [syncIntervalMs, setSyncIntervalMs] = useState(60000)

  // Rate limit
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null)

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark')
      root.classList.remove('theme-light')
    } else {
      root.classList.remove('dark', 'theme-dark')
      root.classList.add('theme-light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Rate limit tracking
  useEffect(() => {
    return onRateLimitChange((info) => setRateLimit(info))
  }, [])

  // Connect and load repository
  const connectRepository = useCallback(
    async (url: string, targetBranchOverride?: string) => {
      const parsed = parseRepoUrl(url)
      if (!parsed) {
        setRepoError(
          'Invalid GitHub URL. Please provide a standard GitHub URL (e.g., https://github.com/amritanshguptadev/javascript-lab).'
        )
        return
      }

      setIsRepoLoading(true)
      setRepoError(null)
      setSelectedFileNode(null)
      setFileContentData(null)
      setFileError(null)

      try {
        const details = await fetchRepoDetails(parsed.owner, parsed.repo)
        setRepoInfo(details)
        setRepoUrl(url)

        const branchList = await fetchRepoBranches(parsed.owner, parsed.repo, details.defaultBranch)
        setBranches(branchList)

        const activeBranch =
          targetBranchOverride ||
          details.defaultBranch ||
          (branchList.length > 0 ? branchList[0].name : 'main')
        setCurrentBranch(activeBranch)

        const commit = await fetchLatestCommit(parsed.owner, parsed.repo, activeBranch)
        setLatestCommit(commit)

        setIsTreeLoading(true)
        const treeResult = await fetchRepoTree(parsed.owner, parsed.repo, commit.sha)
        const builtTree = buildFileTree(treeResult.items)
        setTreeNodes(builtTree)
        setIsTreeTruncated(treeResult.isTruncated)

        setLastSyncTime(new Date())
        setSyncState('synced')

        // Auto-select README.md if present
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
              title: 'File not found in branch',
              description: `"${selectedFileNode.path}" is not present in branch ${branchName}.`,
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

  // Sync check
  const checkForUpdates = useCallback(
    async (isManual = false) => {
      if (!repoInfo || !currentBranch) return

      if (!autoSyncEnabled && !isManual) {
        setSyncState('paused')
        return
      }

      setSyncState('checking')

      try {
        const newCommit = await fetchLatestCommit(repoInfo.owner, repoInfo.name, currentBranch)

        if (latestCommit && newCommit.sha !== latestCommit.sha) {
          setLatestCommit(newCommit)
          setIsTreeLoading(true)
          const treeResult = await fetchRepoTree(repoInfo.owner, repoInfo.name, newCommit.sha)
          const updatedTree = buildFileTree(treeResult.items)
          setTreeNodes(updatedTree)
          setIsTreeTruncated(treeResult.isTruncated)

          if (selectedFileNode) {
            loadFile(repoInfo.owner, repoInfo.name, selectedFileNode, currentBranch)
          }

          addToast({
            title: 'Repository Synchronized',
            description: `New commit: "${newCommit.message.split('\n')[0]}" (${newCommit.shortSha})`,
            type: 'success',
          })
        } else if (isManual) {
          addToast({
            title: 'Sanctuary Up to Date',
            description: `Synchronized with commit ${newCommit.shortSha}.`,
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
            title: 'Sync Check Failed',
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

  const checkRef = useRef(checkForUpdates)
  useEffect(() => {
    checkRef.current = checkForUpdates
  }, [checkForUpdates])

  // Periodic polling
  useEffect(() => {
    if (!autoSyncEnabled) {
      setSyncState('paused')
      return
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkRef.current(false)
      }
    }, syncIntervalMs)

    return () => clearInterval(interval)
  }, [autoSyncEnabled, syncIntervalMs])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoSyncEnabled) {
        checkRef.current(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [autoSyncEnabled])

  // Initial load
  useEffect(() => {
    connectRepository(DEFAULT_REPO_URL)
  }, [connectRepository])

  // Count total files in tree
  const totalFilesCount = treeNodes.reduce((acc, node) => {
    let count = 0
    function countLeaves(n: FileTreeNode) {
      if (n.type === 'blob') count++
      if (n.children) n.children.forEach(countLeaves)
    }
    countLeaves(node)
    return acc + count
  }, 0)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-800 dark:selection:text-amber-200">
      {/* Top Luxury Navbar with Multi-Page Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        theme={theme}
        onToggleTheme={toggleTheme}
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

      {/* Page Routing Views */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activePage === 'home' && (
          <HomePage
            repo={repoInfo}
            latestCommit={latestCommit}
            totalFiles={totalFilesCount}
            isLoading={isRepoLoading}
            error={repoError}
            onConnect={(url) => connectRepository(url)}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'explorer' && (
          <CodeExplorerPage
            repo={repoInfo}
            currentBranch={currentBranch}
            tree={treeNodes}
            isTreeTruncated={isTreeTruncated}
            isTreeLoading={isTreeLoading}
            selectedNode={selectedFileNode}
            fileContent={fileContentData}
            isFileLoading={isFileLoading}
            fileError={fileError}
            onSelectFile={(node) => {
              if (repoInfo) {
                loadFile(repoInfo.owner, repoInfo.name, node, currentBranch)
              }
            }}
            onRetryFile={() => {
              if (repoInfo && selectedFileNode) {
                loadFile(repoInfo.owner, repoInfo.name, selectedFileNode, currentBranch)
              }
            }}
          />
        )}

        {activePage === 'playground' && (
          <PlaygroundPage
            repo={repoInfo}
            currentBranch={currentBranch}
            tree={treeNodes}
          />
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage
            repo={repoInfo}
            tree={treeNodes}
            currentBranch={currentBranch}
            latestCommit={latestCommit}
          />
        )}

        {activePage === 'settings' && (
          <SettingsPage
            theme={theme}
            onToggleTheme={toggleTheme}
            autoSyncEnabled={autoSyncEnabled}
            onToggleAutoSync={() => setAutoSyncEnabled(!autoSyncEnabled)}
            syncInterval={syncIntervalMs}
            onChangeSyncInterval={setSyncIntervalMs}
            rateLimit={rateLimit}
            onClearCache={() => {
              addToast({
                title: 'Cache Purged',
                description: 'Local repository cache has been cleared.',
                type: 'info',
              })
            }}
          />
        )}
      </div>

      {/* Footer Status Bar with Gold Accents */}
      <footer className="border-t border-amber-200/60 bg-amber-50/50 px-4 py-1.5 text-[11px] text-slate-600 dark:border-amber-500/20 dark:bg-slate-950 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
            <Crown className="h-3.5 w-3.5" />
            JavaLand Sanctuary
          </span>
          {repoInfo && (
            <span className="hidden sm:inline">
              Active: <strong className="text-slate-800 dark:text-slate-200">{repoInfo.fullName}</strong> ({currentBranch})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span>
            Sync: <strong className={autoSyncEnabled ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}>{autoSyncEnabled ? `${syncIntervalMs / 1000}s` : 'Paused'}</strong>
          </span>
          {rateLimit && (
            <span className="hidden md:inline">
              API Quota: <strong className="text-amber-600 dark:text-amber-400">{rateLimit.remaining}</strong>/{rateLimit.limit}
            </span>
          )}
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
