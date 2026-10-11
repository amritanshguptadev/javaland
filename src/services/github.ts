import type {
  RepoInfo,
  BranchInfo,
  GitCommitInfo,
  RawTreeItem,
  FileContentData,
  RateLimitInfo,
} from '../types'

const GITHUB_API_BASE = 'https://api.github.com'

// Rate limit tracker listener
type RateLimitListener = (info: RateLimitInfo) => void
const rateLimitListeners: RateLimitListener[] = []

export function onRateLimitChange(listener: RateLimitListener) {
  rateLimitListeners.push(listener)
  return () => {
    const idx = rateLimitListeners.indexOf(listener)
    if (idx !== -1) rateLimitListeners.splice(idx, 1)
  }
}

function updateRateLimitsFromHeaders(headers: Headers) {
  const limit = headers.get('x-ratelimit-limit')
  const remaining = headers.get('x-ratelimit-remaining')
  const reset = headers.get('x-ratelimit-reset')

  if (limit && remaining && reset) {
    const info: RateLimitInfo = {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      resetTime: parseInt(reset, 10) * 1000,
    }
    // Save to session storage for instant restore across reloads
    try {
      sessionStorage.setItem('javaland_ratelimit', JSON.stringify(info))
    } catch {
      // ignore storage quota errors
    }
    rateLimitListeners.forEach((l) => l(info))
  }
}

export function getCachedRateLimit(): RateLimitInfo | null {
  try {
    const raw = sessionStorage.getItem('javaland_ratelimit')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null
  const cleaned = url.trim().replace(/\/+$/, '')

  const fullUrlMatch = cleaned.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i
  )
  if (fullUrlMatch) {
    return {
      owner: fullUrlMatch[1],
      repo: fullUrlMatch[2].replace(/\.git$/i, ''),
    }
  }

  const shortMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/)
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2].replace(/\.git$/i, ''),
    }
  }

  return null
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`
  const headers = new Headers(options?.headers || {})
  headers.set('Accept', 'application/vnd.github.v3+json')

  const response = await fetch(url, {
    ...options,
    headers,
  })

  updateRateLimitsFromHeaders(response.headers)

  if (response.status === 304) {
    throw new Error('NOT_MODIFIED')
  }

  if (response.status === 403) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    if (remaining === '0') {
      const reset = response.headers.get('x-ratelimit-reset')
      const resetDate = reset ? new Date(parseInt(reset, 10) * 1000).toLocaleTimeString() : 'soon'
      throw new Error(`GitHub API rate limit exceeded. Free unauthenticated requests reset at ${resetDate}.`)
    }
    throw new Error('Access forbidden (403). Repository might be private or restricted.')
  }

  if (response.status === 404) {
    throw new Error('Repository or resource not found (404).')
  }

  if (!response.ok) {
    let msg = `GitHub API request failed (${response.status})`
    try {
      const errJson = await response.json()
      if (errJson.message) msg = errJson.message
    } catch {
      // ignore
    }
    throw new Error(msg)
  }

  return response.json()
}

// Persistent Storage Helper to prevent burning API calls
function getFromStorage<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(`jl_${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Check expiration if present
    if (parsed.exp && Date.now() > parsed.exp) {
      sessionStorage.removeItem(`jl_${key}`)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function setToStorage<T>(key: string, data: T, ttlMs?: number) {
  try {
    const payload = {
      data,
      exp: ttlMs ? Date.now() + ttlMs : undefined,
    }
    sessionStorage.setItem(`jl_${key}`, JSON.stringify(payload))
  } catch {
    // SessionStorage may be full or disabled, gracefully ignore
  }
}

export function clearRepoCache() {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith('jl_')) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignore
  }
}

export async function fetchRepoDetails(owner: string, repo: string): Promise<RepoInfo> {
  const cacheKey = `repo_${owner}_${repo}`
  const cached = getFromStorage<RepoInfo>(cacheKey)
  if (cached) return cached

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiRequest(`/repos/${owner}/${repo}`)
  const result: RepoInfo = {
    name: data.name,
    fullName: data.full_name,
    owner: data.owner?.login || owner,
    description: data.description || null,
    defaultBranch: data.default_branch || 'main',
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    isPrivate: Boolean(data.private),
    visibility: data.visibility || (data.private ? 'private' : 'public'),
    htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`,
    pushedAt: data.pushed_at || '',
    createdAt: data.created_at || '',
    language: data.language || null,
  }

  // Cache repo details for 30 minutes
  setToStorage(cacheKey, result, 30 * 60 * 1000)
  return result
}

export async function fetchRepoBranches(
  owner: string,
  repo: string,
  defaultBranchName: string
): Promise<BranchInfo[]> {
  const cacheKey = `branches_${owner}_${repo}`
  const cached = getFromStorage<BranchInfo[]>(cacheKey)
  if (cached) return cached

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list: any[] = await apiRequest(`/repos/${owner}/${repo}/branches?per_page=100`)
  const result: BranchInfo[] = list.map((b) => ({
    name: b.name,
    commitSha: b.commit?.sha || '',
    isDefault: b.name === defaultBranchName,
  }))

  setToStorage(cacheKey, result, 30 * 60 * 1000)
  return result
}

export async function fetchLatestCommit(
  owner: string,
  repo: string,
  ref: string,
  bypassCache = false
): Promise<GitCommitInfo> {
  const cacheKey = `commit_${owner}_${repo}_${ref}`
  if (!bypassCache) {
    const cached = getFromStorage<GitCommitInfo>(cacheKey)
    if (cached) return cached
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiRequest(`/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`)
  const result: GitCommitInfo = {
    sha: data.sha,
    shortSha: (data.sha || '').substring(0, 7),
    message: data.commit?.message || 'No commit message',
    authorName: data.commit?.author?.name || data.author?.login || 'Unknown',
    authorDate: data.commit?.author?.date || '',
    htmlUrl: data.html_url || `https://github.com/${owner}/${repo}/commit/${data.sha}`,
  }

  // Cache commit for 5 minutes
  setToStorage(cacheKey, result, 5 * 60 * 1000)
  return result
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  treeSha: string
): Promise<{ items: RawTreeItem[]; isTruncated: boolean }> {
  // Tree SHAs are immutable in Git, so we can cache them persistently!
  const cacheKey = `tree_${treeSha}`
  const cached = getFromStorage<{ items: RawTreeItem[]; isTruncated: boolean }>(cacheKey)
  if (cached) return cached

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiRequest(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(treeSha)}?recursive=1`
  )

  const items: RawTreeItem[] = Array.isArray(data.tree) ? data.tree : []
  const isTruncated = Boolean(data.truncated)

  const result = { items, isTruncated }
  setToStorage(cacheKey, result)
  return result
}

// Media & file detection
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'])
const BINARY_EXTENSIONS = new Set([
  'pdf', 'zip', 'tar', 'gz', '7z', 'rar', 'exe', 'dll', 'so', 'dylib',
  'mp3', 'wav', 'ogg', 'mp4', 'webm', 'mov', 'avi', 'ttf', 'woff', 'woff2', 'eot',
  'iso', 'bin', 'class', 'pyc', 'wasm'
])

export function getFileExtension(path: string): string {
  const lastDot = path.lastIndexOf('.')
  if (lastDot === -1) return ''
  return path.substring(lastDot + 1).toLowerCase()
}

export function isImageFile(path: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(path))
}

export function isBinaryFile(path: string): boolean {
  const ext = getFileExtension(path)
  return BINARY_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext)
}

function decodeBase64Utf8(base64: string): string {
  const cleanBase64 = base64.replace(/\n/g, '')
  const binaryString = atob(cleanBase64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(bytes)
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  knownSha?: string
): Promise<FileContentData> {
  // If knownSha is provided, file blobs are immutable and cached forever!
  const cacheKey = knownSha ? `file_${knownSha}` : `file_${owner}_${repo}_${path}_${ref}`
  const cached = getFromStorage<FileContentData>(cacheKey)
  if (cached) return cached

  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await apiRequest(
    `/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`
  )

  const name = data.name || path.split('/').pop() || ''
  const size = data.size ?? 0
  const sha = data.sha || knownSha || ''
  const htmlUrl = data.html_url || `https://github.com/${owner}/${repo}/blob/${ref}/${path}`
  const downloadUrl = data.download_url

  const ext = getFileExtension(name)
  const isImage = isImageFile(name)
  const isBinary = isBinaryFile(name)

  let contentText = ''

  if (isImage) {
    if (data.content && data.encoding === 'base64') {
      const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`
      contentText = `data:${mime};base64,${data.content.replace(/\n/g, '')}`
    } else if (downloadUrl) {
      contentText = downloadUrl
    }
  } else if (isBinary) {
    contentText = ''
  } else {
    if (data.content && data.encoding === 'base64') {
      try {
        contentText = decodeBase64Utf8(data.content)
      } catch {
        contentText = atob(data.content.replace(/\n/g, ''))
      }
    } else if (downloadUrl && size > 1000000) {
      const rawRes = await fetch(downloadUrl)
      contentText = await rawRes.text()
    } else if (data.content) {
      contentText = data.content
    }
  }

  const result: FileContentData = {
    path,
    name,
    size,
    sha,
    content: contentText,
    isBinary: isBinary && !isImage,
    encoding: data.encoding,
    downloadUrl,
    htmlUrl,
  }

  setToStorage(cacheKey, result)
  return result
}
