export interface RepoInfo {
  name: string
  fullName: string
  owner: string
  description: string | null
  defaultBranch: string
  stars: number
  forks: number
  openIssues: number
  isPrivate: boolean
  visibility: string
  htmlUrl: string
  pushedAt: string
  createdAt: string
  language: string | null
}

export interface BranchInfo {
  name: string
  commitSha: string
  isDefault: boolean
}

export interface GitCommitInfo {
  sha: string
  shortSha: string
  message: string
  authorName: string
  authorDate: string
  htmlUrl: string
}

export interface RawTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree' | 'commit'
  sha: string
  size?: number
  url: string
}

export interface FileTreeNode {
  id: string
  name: string
  path: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  children?: FileTreeNode[]
}

export interface FileContentData {
  path: string
  name: string
  size: number
  sha: string
  content: string
  isBinary: boolean
  encoding?: string
  downloadUrl?: string
  htmlUrl: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: number // Unix timestamp
}

export type SyncState = 'synced' | 'checking' | 'error' | 'paused'

export type AppPage = 'home' | 'explorer' | 'playground' | 'analytics'

export type AppTheme =
  | 'ivory-gold'
  | 'obsidian-gold'
  | 'emerald-gold'
  | 'sapphire-abyss'
  | 'ruby-gold'
  | 'cosmic-amethyst'
