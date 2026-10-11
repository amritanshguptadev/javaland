import React, { useState, useMemo } from 'react'
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  FileImage,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  ChevronsUpDown,
  AlertCircle
} from 'lucide-react'
import type { FileTreeNode } from '../types'
import { filterTree, formatFileSize } from '../utils/tree'
import { isImageFile } from '../services/github'

interface FileExplorerProps {
  tree: FileTreeNode[]
  selectedPath: string | null
  onSelectFile: (node: FileTreeNode) => void
  isTreeTruncated?: boolean
  isLoading?: boolean
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  if (isImageFile(fileName)) {
    return <FileImage className="h-4 w-4 text-purple-500 shrink-0" />
  }

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode2 className="h-4 w-4 text-amber-500 shrink-0" />
    case 'ts':
    case 'tsx':
      return <FileCode2 className="h-4 w-4 text-sky-500 shrink-0" />
    case 'html':
    case 'htm':
      return <FileCode2 className="h-4 w-4 text-orange-500 shrink-0" />
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode2 className="h-4 w-4 text-teal-500 shrink-0" />
    case 'json':
      return <FileJson className="h-4 w-4 text-yellow-600 shrink-0" />
    case 'md':
    case 'markdown':
      return <FileText className="h-4 w-4 text-amber-700 shrink-0" />
    case 'py':
      return <FileCode2 className="h-4 w-4 text-emerald-500 shrink-0" />
    case 'sh':
    case 'bash':
      return <FileCode2 className="h-4 w-4 text-lime-600 shrink-0" />
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
    case 'java':
    case 'cs':
      return <FileCode2 className="h-4 w-4 text-indigo-500 shrink-0" />
    default:
      return <File className="h-4 w-4 text-slate-400 shrink-0" />
  }
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  tree,
  selectedPath,
  onSelectFile,
  isTreeTruncated = false,
  isLoading = false,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    tree.forEach((node) => {
      if (node.type === 'tree') initial.add(node.path)
    })
    return initial
  })
  const [searchQuery, setSearchQuery] = useState('')

  const toggleFolder = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  // Filter tree based on search query
  const { filteredTree, totalMatches } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { filteredTree: tree, totalMatches: null }
    }
    const { filtered, matchingPaths } = filterTree(tree, searchQuery)
    return { filteredTree: filtered, totalMatches: matchingPaths.size }
  }, [tree, searchQuery])

  // If searching, ensure matching parent folders are auto-expanded
  const effectiveExpanded = useMemo(() => {
    if (!searchQuery.trim()) return expandedPaths
    const autoExpanded = new Set(expandedPaths)
    function expandAll(nodes: FileTreeNode[]) {
      for (const n of nodes) {
        if (n.type === 'tree') {
          autoExpanded.add(n.path)
          if (n.children) expandAll(n.children)
        }
      }
    }
    expandAll(filteredTree)
    return autoExpanded
  }, [filteredTree, searchQuery, expandedPaths])

  const handleExpandAll = () => {
    const all = new Set<string>()
    function collect(nodes: FileTreeNode[]) {
      for (const n of nodes) {
        if (n.type === 'tree') {
          all.add(n.path)
          if (n.children) collect(n.children)
        }
      }
    }
    collect(tree)
    setExpandedPaths(all)
  }

  const handleCollapseAll = () => {
    setExpandedPaths(new Set())
  }

  const renderNode = (node: FileTreeNode, depth = 0) => {
    const isFolder = node.type === 'tree'
    const isExpanded = effectiveExpanded.has(node.path)
    const isSelected = selectedPath === node.path

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path)
            } else {
              onSelectFile(node)
            }
          }}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`group flex items-center gap-1.5 py-1.5 pr-3 text-xs cursor-pointer transition-all rounded-lg mx-1 my-0.5 ${
            isSelected
              ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-900 font-bold border-l-3 border-amber-500 dark:text-amber-300'
              : 'text-slate-700 hover:bg-amber-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
          }`}
          title={`${node.path}${node.size !== undefined ? ` (${formatFileSize(node.size)})` : ''}`}
        >
          {isFolder ? (
            <span className="flex items-center gap-1">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-amber-500 shrink-0" />
              )}
            </span>
          ) : (
            <span className="flex items-center gap-1 pl-4">
              {getFileIcon(node.name)}
            </span>
          )}

          <span className="truncate flex-1 font-mono tracking-tight text-xs">{node.name}</span>

          {!isFolder && node.size !== undefined && (
            <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>

        {/* Recursive folder children */}
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950 border-r border-amber-200/60 dark:border-amber-500/20 text-slate-800 dark:text-slate-200">
      {/* Search & Actions Header */}
      <div className="p-2.5 border-b border-amber-200/50 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Explorer
            </span>
            {totalMatches !== null && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                {totalMatches} found
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleExpandAll}
              title="Expand all folders"
              className="rounded p-1 text-slate-500 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-slate-850"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              title="Collapse all folders"
              className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-400 text-[10px]"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-amber-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files..."
            className="w-full rounded-lg border border-amber-200/80 bg-amber-50/40 py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tree Notice if truncated */}
      {isTreeTruncated && (
        <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-700 border-b border-amber-500/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Large tree truncated by GitHub.</span>
        </div>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <span className="mt-2 text-xs">Loading tree...</span>
          </div>
        ) : filteredTree.length > 0 ? (
          filteredTree.map((node) => renderNode(node, 0))
        ) : (
          <div className="px-4 py-8 text-center text-xs text-slate-500">
            {searchQuery ? (
              <>
                <p>No matches for "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-amber-600 hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p>Repository tree is empty.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
