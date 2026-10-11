import type { RawTreeItem, FileTreeNode } from '../types'

export function buildFileTree(rawItems: RawTreeItem[]): FileTreeNode[] {
  const rootNodes: FileTreeNode[] = []
  const folderMap = new Map<string, FileTreeNode>()

  // Sort raw items so parents are naturally created before or as needed
  const sortedItems = [...rawItems].sort((a, b) => a.path.localeCompare(b.path))

  for (const item of sortedItems) {
    const parts = item.path.split('/')
    let currentPath = ''

    // Ensure intermediate directories exist in our structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (!folderMap.has(currentPath)) {
        const folderNode: FileTreeNode = {
          id: `folder:${currentPath}`,
          name: part,
          path: currentPath,
          type: 'tree',
          sha: '',
          children: [],
        }
        folderMap.set(currentPath, folderNode)

        if (parentPath && folderMap.has(parentPath)) {
          folderMap.get(parentPath)!.children?.push(folderNode)
        } else if (!parentPath) {
          rootNodes.push(folderNode)
        }
      }
    }

    const fileName = parts[parts.length - 1]
    const node: FileTreeNode = {
      id: `${item.type}:${item.path}`,
      name: fileName,
      path: item.path,
      type: item.type === 'tree' ? 'tree' : 'blob',
      sha: item.sha,
      size: item.size,
      children: item.type === 'tree' ? [] : undefined,
    }

    if (item.type === 'tree') {
      if (!folderMap.has(item.path)) {
        folderMap.set(item.path, node)
        const parentPath = parts.slice(0, -1).join('/')
        if (parentPath && folderMap.has(parentPath)) {
          folderMap.get(parentPath)!.children?.push(node)
        } else {
          rootNodes.push(node)
        }
      }
    } else {
      // It's a blob (file)
      const parentPath = parts.slice(0, -1).join('/')
      if (parentPath && folderMap.has(parentPath)) {
        folderMap.get(parentPath)!.children?.push(node)
      } else {
        rootNodes.push(node)
      }
    }
  }

  // Recursive sort: directories first, then alphabetical
  function sortNodes(nodes: FileTreeNode[]) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'tree' ? -1 : 1
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    })

    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    }
  }

  sortNodes(rootNodes)
  return rootNodes
}

export function filterTree(
  nodes: FileTreeNode[],
  searchQuery: string
): { filtered: FileTreeNode[]; matchingPaths: Set<string> } {
  const query = searchQuery.trim().toLowerCase()
  if (!query) {
    return { filtered: nodes, matchingPaths: new Set() }
  }

  const matchingPaths = new Set<string>()

  function filterRecursive(nodeList: FileTreeNode[]): FileTreeNode[] {
    const result: FileTreeNode[] = []

    for (const node of nodeList) {
      const isMatch = node.name.toLowerCase().includes(query) || node.path.toLowerCase().includes(query)

      if (node.type === 'tree' && node.children) {
        const filteredChildren = filterRecursive(node.children)
        if (isMatch || filteredChildren.length > 0) {
          matchingPaths.add(node.path)
          result.push({
            ...node,
            children: filteredChildren,
          })
        }
      } else if (isMatch) {
        matchingPaths.add(node.path)
        result.push(node)
      }
    }

    return result
  }

  const filtered = filterRecursive(nodes)
  return { filtered, matchingPaths }
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return ''
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

export function getFileLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    json: 'json',
    json5: 'json',
    md: 'markdown',
    markdown: 'markdown',
    mdx: 'markdown',
    py: 'python',
    pyw: 'python',
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    hpp: 'cpp',
    cc: 'cpp',
    cs: 'csharp',
    java: 'java',
    php: 'php',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    svg: 'xml',
    rs: 'rust',
    go: 'go',
    rb: 'ruby',
    dockerfile: 'dockerfile',
    toml: 'toml',
    ini: 'ini',
  }

  if (fileName.toLowerCase() === 'dockerfile') return 'dockerfile'
  if (fileName.toLowerCase() === 'makefile') return 'makefile'

  return langMap[ext] || 'plaintext'
}
