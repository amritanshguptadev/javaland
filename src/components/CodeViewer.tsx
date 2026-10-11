import React, { useState, useMemo, useEffect } from 'react'
import Prism from 'prismjs'
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

  // No file selected state
  if (!fileData && !isLoading && !error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-300/80 bg-white shadow-xl dark:border-amber-500/30 dark:bg-slate-900">
          <FolderOpen className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">No file selected</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          Select any file from the left repository tree to inspect its source code inside the studio.
        </p>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Loading code...</p>
      </div>
    )
  }

  // Error state
  if (error || !fileData) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-rose-600">Failed to load file</h3>
        <p className="mt-1 max-w-md text-xs text-slate-500">{error || 'An unexpected error occurred.'}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
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
    <div className="flex h-full flex-col theme-surface theme-text-main overflow-hidden">
      {/* File Top Bar: Breadcrumbs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b theme-border theme-surface-subtle px-4 py-2.5">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs theme-text-muted">
          <FileCode className="h-4 w-4 theme-text-main shrink-0" />
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="opacity-50">/</span>}
              <span
                className={`${
                  index === pathParts.length - 1
                    ? 'font-bold theme-text-main font-mono'
                    : 'theme-text-muted'
                }`}
              >
                {part}
              </span>
            </React.Fragment>
          ))}

          {/* Size and language badge */}
          <span className="ml-2 rounded-md border theme-border theme-surface px-2 py-0.5 text-[10px] font-mono font-bold theme-text-main">
            {formatFileSize(fileData.size)}
          </span>
          <span className="rounded-md border theme-border theme-surface-elevated px-2 py-0.5 text-[10px] font-bold theme-text-main">
            {language}
          </span>
          {!isImage && !fileData.isBinary && (
            <span className="text-[11px] theme-text-muted font-medium">
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
              title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                wrapLines
                  ? 'theme-pill-active'
                  : 'theme-surface border theme-border theme-text-main hover:opacity-80'
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
              className="flex items-center gap-1 rounded-lg border theme-border theme-surface px-2.5 py-1 text-xs font-semibold theme-text-main transition hover:opacity-85 cursor-pointer"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 opacity-80" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg border theme-border theme-surface px-2.5 py-1 text-xs font-semibold theme-text-main transition hover:opacity-85 cursor-pointer"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5 opacity-80" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <a
            href={fileData.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border theme-border theme-surface px-2.5 py-1 text-xs font-semibold theme-text-main transition hover:opacity-85 cursor-pointer"
            title="Open on GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto theme-code-bg font-mono text-xs">
        {isImage ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="max-w-full rounded-2xl border-2 theme-border theme-surface p-4 shadow-2xl">
              <img
                src={fileData.content}
                alt={fileData.name}
                className="max-h-[60vh] max-w-full rounded object-contain"
              />
              <div className="mt-3 flex items-center justify-between text-xs theme-text-main font-sans">
                <span className="font-bold">{fileData.name}</span>
                <span>{formatFileSize(fileData.size)}</span>
              </div>
            </div>
          </div>
        ) : fileData.isBinary ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center theme-text-muted">
            <FileImage className="h-12 w-12 opacity-80" />
            <h4 className="mt-3 text-sm font-bold theme-text-main">Binary Resource</h4>
            <p className="mt-1 max-w-sm text-xs theme-text-muted">
              Binary format cannot be displayed as plain code. You can download it directly.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="gold-button mt-4 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
            >
              <Download className="h-4 w-4" />
              Download {fileData.name}
            </button>
          </div>
        ) : fileData.content === '' ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center theme-text-muted">
            <FileCode className="h-10 w-10 opacity-60" />
            <p className="mt-2 text-xs font-bold theme-text-main">Empty file (0 bytes)</p>
          </div>
        ) : (
          /* Highlighting with Line numbers */
          <div className="relative flex min-h-full">
            <div
              className="sticky left-0 z-10 select-none border-r theme-border theme-code-bg px-3 py-3 text-right font-mono text-[11px] text-amber-500/70"
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i + 1} className="leading-[1.6rem] h-[1.6rem]">
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="flex-1 py-3 px-4 overflow-x-auto">
              <pre
                className={`code-studio-container m-0 p-0 text-[12px] leading-[1.6rem] text-slate-100 ${
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
