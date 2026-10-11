import React, { useState, useEffect, useMemo } from 'react'
import {
  FlaskConical,
  Play,
  RotateCcw,
  FileCode,
  Terminal,
  Code2,
  CheckCircle2
} from 'lucide-react'
import type { FileTreeNode, RepoInfo } from '../types'
import { fetchFileContent } from '../services/github'

interface PlaygroundPageProps {
  repo: RepoInfo | null
  currentBranch: string
  tree: FileTreeNode[]
}

export const PlaygroundPage: React.FC<PlaygroundPageProps> = ({
  repo,
  currentBranch,
  tree,
}) => {
  // Find all labs or directories containing index.html or script.js
  const availableLabs = useMemo(() => {
    const labs: { id: string; name: string; htmlPath?: string; jsPath?: string }[] = []

    function searchDirectories(nodes: FileTreeNode[]) {
      for (const node of nodes) {
        if (node.type === 'tree' && node.children) {
          const htmlNode = node.children.find((c) => c.name.toLowerCase() === 'index.html' || c.name.endsWith('.html'))
          const jsNode = node.children.find((c) => c.name.toLowerCase() === 'script.js' || c.name.endsWith('.js'))

          if (htmlNode || jsNode) {
            labs.push({
              id: node.path,
              name: node.name,
              htmlPath: htmlNode?.path,
              jsPath: jsNode?.path,
            })
          }
          searchDirectories(node.children)
        }
      }
    }

    searchDirectories(tree)

    // Sort labs alphabetically (e.g. lab 1, lab 2...)
    return labs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [tree])

  const [selectedLabId, setSelectedLabId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'js' | 'console'>('preview')
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [jsContent, setJsContent] = useState<string>('')
  const [isLoadingLab, setIsLoadingLab] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [runKey, setRunKey] = useState(0)

  // Auto-select first lab on load
  useEffect(() => {
    if (availableLabs.length > 0 && !selectedLabId) {
      setSelectedLabId(availableLabs[0].id)
    }
  }, [availableLabs, selectedLabId])

  // Fetch HTML and JS when selected lab changes
  useEffect(() => {
    if (!repo || !selectedLabId) return

    const lab = availableLabs.find((l) => l.id === selectedLabId)
    if (!lab) return

    let cancelled = false
    setIsLoadingLab(true)
    setConsoleLogs([])

    async function loadLabFiles() {
      try {
        let htmlText = '<!-- No index.html found -->'
        let jsText = '// No script.js found'

        if (lab?.htmlPath) {
          const fileData = await fetchFileContent(repo!.owner, repo!.name, lab.htmlPath, currentBranch)
          htmlText = fileData.content
        }

        if (lab?.jsPath) {
          const fileData = await fetchFileContent(repo!.owner, repo!.name, lab.jsPath, currentBranch)
          jsText = fileData.content
        }

        if (!cancelled) {
          setHtmlContent(htmlText)
          setJsContent(jsText)
          setRunKey((k) => k + 1)
        }
      } catch (err) {
        console.error('Failed to load lab files:', err)
      } finally {
        if (!cancelled) setIsLoadingLab(false)
      }
    }

    loadLabFiles()

    return () => {
      cancelled = true
    }
  }, [selectedLabId, repo, currentBranch, availableLabs])

  // Construct iframe source with console capture
  const sandboxDocument = useMemo(() => {
    if (!htmlContent) return ''

    // Injection script to capture console.log and forward to parent
    const consoleCaptureScript = `
      <script>
        (function() {
          const oldLog = console.log;
          const oldErr = console.error;
          const oldWarn = console.warn;
          console.log = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
            oldLog.apply(console, args);
          };
          console.warn = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
            oldWarn.apply(console, args);
          };
          console.error = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
            oldErr.apply(console, args);
          };
        })();
      </script>
    `

    // Inject JS script tag if separate jsContent exists
    const scriptToInject = jsContent ? `<script>\n${jsContent}\n</script>` : ''

    // If html contains </body>, inject before it, else append
    if (htmlContent.includes('</body>')) {
      return htmlContent
        .replace('<head>', `<head>${consoleCaptureScript}`)
        .replace('</body>', `${scriptToInject}</body>`)
    }

    return `<!DOCTYPE html><html><head>${consoleCaptureScript}</head><body>${htmlContent}${scriptToInject}</body></html>`
  }, [htmlContent, jsContent])

  // Listen to messages from sandbox iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CONSOLE_LOG') {
        setConsoleLogs((prev) => [...prev, `[${e.data.level.toUpperCase()}] ${e.data.message}`])
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleRerun = () => {
    setConsoleLogs([])
    setRunKey((k) => k + 1)
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Controls Bar */}
      <div className="border-b border-amber-200/60 bg-white px-4 py-3 shadow-xs dark:border-amber-500/20 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Interactive Lab Runner
              </h2>
              <p className="text-[11px] text-slate-500">
                Execute algorithms and DOM scripts directly in an isolated sandbox.
              </p>
            </div>
          </div>

          {/* Re-run button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRerun}
              className="gold-button flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Rerun Lab</span>
            </button>
          </div>
        </div>

        {/* Labs Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 max-w-7xl mx-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Available Labs:</span>
          {availableLabs.map((lab) => {
            const isSelected = lab.id === selectedLabId
            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => setSelectedLabId(lab.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'border border-amber-200 bg-amber-50/50 text-slate-700 hover:bg-amber-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lab.name}</span>
                {isSelected && <CheckCircle2 className="h-3 w-3" />}
              </button>
            )
          })}
          {availableLabs.length === 0 && (
            <span className="text-xs text-slate-400 italic">No web labs found in this repository.</span>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden max-w-7xl mx-auto w-full p-4 gap-4">
        {/* Tab selection */}
        <div className="flex items-center justify-between border-b border-amber-200/50 pb-2 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Interactive Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'html'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>HTML Source</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('js')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'js'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>JavaScript Source</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'console'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Live Console ({consoleLogs.length})</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Selected: <strong className="text-amber-600 dark:text-amber-400">{selectedLabId}</strong>
          </span>
        </div>

        {/* View container */}
        <div className="flex-1 overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-white shadow-xl dark:border-amber-500/30 dark:bg-slate-900">
          {isLoadingLab ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Loading lab files...</p>
            </div>
          ) : activeTab === 'preview' ? (
            /* Live Iframe Sandbox */
            <div className="h-full w-full bg-white">
              <iframe
                key={runKey}
                title="Lab Interactive Runner"
                srcDoc={sandboxDocument}
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="h-full w-full border-none"
              />
            </div>
          ) : activeTab === 'html' ? (
            /* HTML Source View */
            <div className="h-full overflow-auto p-4 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-950">
              <pre className="whitespace-pre-wrap">{htmlContent}</pre>
            </div>
          ) : activeTab === 'js' ? (
            /* JavaScript Source View */
            <div className="h-full overflow-auto p-4 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-950">
              <pre className="whitespace-pre-wrap">{jsContent}</pre>
            </div>
          ) : (
            /* Console Output */
            <div className="h-full overflow-auto bg-slate-950 p-4 font-mono text-xs text-emerald-400">
              <div className="mb-2 border-b border-slate-800 pb-2 text-[11px] text-slate-500">
                Sandbox Console Output — logs captured from execution:
              </div>
              {consoleLogs.length > 0 ? (
                consoleLogs.map((log, index) => (
                  <div key={index} className="py-1 border-b border-slate-900">
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No console logs output yet. Click "Rerun Lab" or interact with the preview.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
