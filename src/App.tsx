import { useState, useEffect, useCallback } from 'react'
import {
  parseRepoUrl,
  fetchRepoDetails,
  fetchRepoBranches,
  fetchLatestCommit,
  fetchRepoTree,
  fetchFileContent,
  onRateLimitChange,
  getCachedRateLimit,
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
import { Footer } from './components/Footer'
import { ConnectRepoModal } from './components/ConnectRepoModal'
import { HomePage } from './pages/HomePage'
import { CodeExplorerPage } from './pages/CodeExplorerPage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { Toast } from './components/Toast'
import type { ToastMessage } from './components/Toast'

const DEFAULT_REPO_URL = 'https://github.com/amritanshguptadev/javascript-lab'

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home')
  const [theme, setTheme] = useState<AppTheme>('light') // Golden & White by default

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

  // Rate limit
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(() => getCachedRateLimit())

  // Connect repo modal
  const [connectModalOpen, setConnectModalOpen] = useState(false)

  // Sync state (Zero automatic polling to preserve free API quota)
  const [syncState, setSyncState] = useState<SyncState>('synced')

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

  // Connect and load repository (utilizes persistent cache)
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

  // Load file content (uses immutable SHA caching)
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
              title: 'File not in branch',
              description: `"${selectedFileNode.path}" does not exist in branch ${branchName}.`,
              type: 'info',
            })
          }
        }

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

  // Manual on-demand refresh only (Zero automatic polling to conserve free API calls)
  const handleManualRefresh = useCallback(async () => {
    if (!repoInfo || !currentBranch) return
    setSyncState('checking')

    try {
      // Bypass commit cache on manual refresh
      const newCommit = await fetchLatestCommit(repoInfo.owner, repoInfo.name, currentBranch, true)

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
          title: 'Repository Updated',
          description: `New commit: "${newCommit.message.split('\n')[0]}" (${newCommit.shortSha})`,
          type: 'success',
        })
      } else {
        addToast({
          title: 'Up to Date',
          description: `Already synchronized with commit ${newCommit.shortSha}.`,
          type: 'info',
        })
      }
      setSyncState('synced')
    } catch (err: unknown) {
      setSyncState('error')
      const msg = err instanceof Error ? err.message : String(err)
      addToast({
        title: 'Check failed',
        description: msg,
        type: 'error',
      })
    } finally {
      setIsTreeLoading(false)
    }
  }, [repoInfo, currentBranch, latestCommit, selectedFileNode, loadFile, addToast])

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
    <div className="flex min-h-screen flex-col bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-800 dark:selection:text-amber-200">
      {/* Top Navbar */}
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
        onManualRefresh={handleManualRefresh}
        onOpenConnectModal={() => setConnectModalOpen(true)}
      />

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col">
        {activePage === 'home' && (
          <HomePage
            repo={repoInfo}
            latestCommit={latestCommit}
            totalFiles={totalFilesCount}
            onNavigate={setActivePage}
            onOpenConnectModal={() => setConnectModalOpen(true)}
          />
        )}

        {activePage === 'explorer' && (
          <div className="h-[calc(100vh-61px)] flex flex-col overflow-hidden">
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
          </div>
        )}

        {activePage === 'playground' && (
          <div className="h-[calc(100vh-61px)] flex flex-col overflow-hidden">
            <PlaygroundPage
              repo={repoInfo}
              currentBranch={currentBranch}
              tree={treeNodes}
            />
          </div>
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage
            repo={repoInfo}
            tree={treeNodes}
            currentBranch={currentBranch}
            latestCommit={latestCommit}
          />
        )}
      </div>

      {/* Comprehensive Footer (Visible on Home & Analytics pages) */}
      {(activePage === 'home' || activePage === 'analytics') && (
        <Footer
          repo={repoInfo}
          currentBranch={currentBranch}
          onNavigate={setActivePage}
          onOpenConnectModal={() => setConnectModalOpen(true)}
          rateLimit={rateLimit}
        />
      )}

      {/* Connect / Switch Repository Modal */}
      <ConnectRepoModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        currentUrl={repoUrl}
        onConnect={(url) => connectRepository(url)}
        isLoading={isRepoLoading}
        error={repoError}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
