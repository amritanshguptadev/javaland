import React, { useState, useMemo, useEffect } from 'react'
import Prism from 'prismjs'
// Load essential Prism grammars
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-scss'

import {
  Copy,
  Check,
  Download,
  ExternalLink,
  WrapText,
  FileCode,
  FileImage,
  AlertTriangle,
  FolderOpen
} from 'lucide-react'
import type { FileContentData } from '../types'
import { formatFileSize, getFileLanguage } from '../utils/tree'
import { isImageFile } from '../services/github'

interface CodeViewerProps {
  fileData: FileContentData | null
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  fileData,
  isLoading,
  error,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false)
  const [wrapLines, setWrapLines] = useState(false)

  // Clear copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  const language = useMemo(() => {
    if (!fileData) return 'plaintext'
    return getFileLanguage(fileData.name)
  }, [fileData])

  const highlightedCode = useMemo(() => {
    if (!fileData || fileData.isBinary || isImageFile(fileData.name)) return ''
    const grammar = Prism.languages[language] || Prism.languages.plaintext || Prism.languages.clike
    try {
      return Prism.highlight(fileData.content, grammar, language)
    } catch {
      return fileData.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }
  }, [fileData, language])

  const lineCount = useMemo(() => {
    if (!fileData || !fileData.content) return 0
    return fileData.content.split('\n').length
  }, [fileData])

  const handleCopy = async () => {
    if (!fileData || !fileData.content) return
    try {
      await navigator.clipboard.writeText(fileData.content)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy code to clipboard', err)
    }
  }

  const handleDownload = () => {
    if (!fileData) return
    const blob = new Blob([fileData.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = fileData.downloadUrl || url
    link.download = fileData.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Empty / No file selected state
  if (!fileData && !isLoading && !error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <FolderOpen className="h-8 w-8 text-sky-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-200">No file selected</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          Browse the repository tree on the left sidebar and click on any file to inspect its source code.
        </p>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-400">Fetching file contents from GitHub...</p>
      </div>
    )
  }

  // Error state
  if (error || !fileData) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-rose-300">Failed to load file</h3>
        <p className="mt-1 max-w-md text-xs text-slate-400">{error || 'An unexpected error occurred.'}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  const isImage = isImageFile(fileData.name)
  const pathParts = fileData.path.split('/')

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* File Top Bar: Breadcrumbs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/60 px-4 py-2.5">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400">
          <FileCode className="h-4 w-4 text-sky-400 shrink-0" />
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-slate-600">/</span>}
              <span
                className={`${
                  index === pathParts.length - 1
                    ? 'font-semibold text-slate-100 font-mono'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {part}
              </span>
            </React.Fragment>
          ))}

          {/* Size and language badge */}
          <span className="ml-2 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
            {formatFileSize(fileData.size)}
          </span>
          <span className="rounded bg-sky-950/70 border border-sky-800/50 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
            {language}
          </span>
          {!isImage && !fileData.isBinary && (
            <span className="text-[11px] text-slate-500">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!isImage && !fileData.isBinary && (
            <button
              type="button"
              onClick={() => setWrapLines(!wrapLines)}
              title={wrapLines ? 'Disable line wrapping' : 'Enable line wrapping'}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition ${
                wrapLines
                  ? 'bg-sky-500/20 text-sky-300 font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <WrapText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Wrap</span>
            </button>
          )}

          {!fileData.isBinary && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              title="Copy file contents"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <a
            href={fileData.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
            title="Open raw file on GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs">
        {isImage ? (
          /* Image Preview with checkered background */
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="max-w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl backdrop-blur">
              <img
                src={fileData.content}
                alt={fileData.name}
                className="max-h-[60vh] max-w-full rounded object-contain"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{fileData.name}</span>
                <span>{formatFileSize(fileData.size)}</span>
              </div>
            </div>
          </div>
        ) : fileData.isBinary ? (
          /* Non-previewable Binary File */
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
            <FileImage className="h-12 w-12 text-slate-500" />
            <h4 className="mt-3 text-sm font-semibold text-slate-200">Binary file</h4>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              This file cannot be displayed as source code. You can download it directly to view it on your machine.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              <Download className="h-4 w-4" />
              Download {fileData.name}
            </button>
          </div>
        ) : fileData.content === '' ? (
          /* Empty File */
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500">
            <FileCode className="h-10 w-10 text-slate-600" />
            <p className="mt-2 text-xs font-medium text-slate-400">This file is empty (0 bytes)</p>
          </div>
        ) : (
          /* Source Code Viewer with Line Numbers and Highlighting */
          <div className="relative flex min-h-full">
            {/* Line numbers column */}
            <div
              className="sticky left-0 z-10 select-none border-r border-slate-800/80 bg-slate-950/95 px-3 py-3 text-right font-mono text-[11px] text-slate-600"
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i + 1} className="leading-[1.6rem] h-[1.6rem]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code column */}
            <div className="flex-1 py-3 px-4 overflow-x-auto">
              <pre
                className={`code-container m-0 p-0 text-[12px] leading-[1.6rem] ${
                  wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                }`}
              >
                <code
                  className={`language-${language}`}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
