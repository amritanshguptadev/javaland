import React, { useState, useEffect, useMemo } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-markup'

import {
  FlaskConical,
  Play,
  RotateCcw,
  FileCode,
  Terminal,
  Code2,
  CheckCircle2,
  Copy,
  Check
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
  const [copied, setCopied] = useState(false)

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

  // Syntax highlighting for HTML source
  const highlightedHtml = useMemo(() => {
    if (!htmlContent) return ''
    try {
      return Prism.highlight(htmlContent, Prism.languages.markup || Prism.languages.html, 'html')
    } catch {
      return htmlContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  }, [htmlContent])

  // Syntax highlighting for JS source
  const highlightedJs = useMemo(() => {
    if (!jsContent) return ''
    try {
      return Prism.highlight(jsContent, Prism.languages.javascript, 'javascript')
    } catch {
      return jsContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  }, [jsContent])

  const htmlLineCount = useMemo(() => htmlContent ? htmlContent.split('\n').length : 0, [htmlContent])
  const jsLineCount = useMemo(() => jsContent ? jsContent.split('\n').length : 0, [jsContent])

  const handleCopyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  // Construct iframe source with console capture
  const sandboxDocument = useMemo(() => {
    if (!htmlContent) return ''

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

    const scriptToInject = jsContent ? `<script>\n${jsContent}\n</script>` : ''

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
              className="gold-button flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow cursor-pointer"
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
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition shrink-0 cursor-pointer ${
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
      <div className="flex flex-1 flex-col overflow-hidden max-w-7xl mx-auto w-full p-4 gap-4 min-h-[600px]">
        {/* Tab selection */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/50 pb-2 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
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
        <div className="flex-1 overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-white shadow-xl dark:border-amber-500/30 dark:bg-slate-900 min-h-[480px] flex flex-col">
          {isLoadingLab ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Loading lab files...</p>
            </div>
          ) : activeTab === 'preview' ? (
            /* Live Iframe Sandbox */
            <div className="h-full w-full bg-white flex-1 min-h-[450px]">
              <iframe
                key={runKey}
                title="Lab Interactive Runner"
                srcDoc={sandboxDocument}
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="h-full w-full border-none min-h-[450px]"
              />
            </div>
          ) : activeTab === 'html' ? (
            /* HTML Source View — High Contrast & Syntax Highlighted */
            <div className="flex-1 flex flex-col bg-[#0b0e14] text-slate-100 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2">
                <span className="text-[11px] font-bold text-amber-400 font-sans">
                  HTML Source (index.html)
                </span>
                <div className="flex items-center gap-3 font-sans">
                  <span className="text-[10px] text-slate-400 font-mono">{htmlLineCount} lines</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(htmlContent)}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-slate-700 transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto flex">
                <div className="select-none border-r border-slate-800 bg-[#07090e] px-3 py-3 text-right font-mono text-[11px] text-amber-500/60 shrink-0">
                  {Array.from({ length: htmlLineCount }).map((_, i) => (
                    <div key={i + 1} className="leading-[1.6rem] h-[1.6rem]">{i + 1}</div>
                  ))}
                </div>
                <div className="flex-1 p-3 overflow-x-auto">
                  <pre className="code-studio-container m-0 p-0 text-[12px] leading-[1.6rem] text-slate-100 whitespace-pre">
                    <code
                      className="language-html"
                      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                    />
                  </pre>
                </div>
              </div>
            </div>
          ) : activeTab === 'js' ? (
            /* JavaScript Source View — High Contrast & Syntax Highlighted */
            <div className="flex-1 flex flex-col bg-[#0b0e14] text-slate-100 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2">
                <span className="text-[11px] font-bold text-amber-400 font-sans">
                  JavaScript Source (script.js)
                </span>
                <div className="flex items-center gap-3 font-sans">
                  <span className="text-[10px] text-slate-400 font-mono">{jsLineCount} lines</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(jsContent)}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-slate-700 transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy JavaScript'}</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto flex">
                <div className="select-none border-r border-slate-800 bg-[#07090e] px-3 py-3 text-right font-mono text-[11px] text-amber-500/60 shrink-0">
                  {Array.from({ length: jsLineCount }).map((_, i) => (
                    <div key={i + 1} className="leading-[1.6rem] h-[1.6rem]">{i + 1}</div>
                  ))}
                </div>
                <div className="flex-1 p-3 overflow-x-auto">
                  <pre className="code-studio-container m-0 p-0 text-[12px] leading-[1.6rem] text-slate-100 whitespace-pre">
                    <code
                      className="language-javascript"
                      dangerouslySetInnerHTML={{ __html: highlightedJs }}
                    />
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* Console Output */
            <div className="h-full overflow-auto bg-[#0b0e14] p-4 font-mono text-xs text-emerald-400 flex-1">
              <div className="mb-2 border-b border-slate-800 pb-2 text-[11px] text-slate-400 font-sans flex items-center justify-between">
                <span>Sandbox Console Output — logs captured from execution:</span>
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-amber-400 hover:underline text-[10px] cursor-pointer"
                >
                  Clear Console
                </button>
              </div>
              {consoleLogs.length > 0 ? (
                consoleLogs.map((log, index) => (
                  <div key={index} className="py-1 border-b border-slate-900 font-mono text-[12px] leading-relaxed">
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic py-4">No console logs output yet. Click "Rerun Lab" or interact with the preview.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
