# CodeVault — GitHub Repository Explorer

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CodeVault** is a modern, developer-centric web application that allows users to explore public GitHub repositories, browse nested folder structures, inspect syntax-highlighted source code, and monitor repository updates directly in the browser without needing to visit GitHub.

---

## ✨ Features

- **Dynamic Public Repository Connection**:
  - Connect to any public GitHub repository via standard URL (e.g. `https://github.com/amritanshguptadev/javascript-lab`) or `owner/repo` format.
  - Automatically extracts repository owner, name, description, star count, fork count, and visibility.
  - Initial default repository: [amritanshguptadev/javascript-lab](https://github.com/amritanshguptadev/javascript-lab).
  - No repository trees, files, or commits are hardcoded; everything is fetched dynamically via the GitHub REST API.

- **Dynamic Branch Detection & Switching**:
  - Dynamically queries the default branch (e.g., `main` or `master`) via GitHub API.
  - Interactive branch selector dropdown allowing instant switching between active branches.
  - Tree and open file refresh automatically upon switching branches.

- **Hierarchical File & Directory Explorer**:
  - Full nested tree view displaying folders and files with proper directory indentation.
  - Distinguishes folders from files visually with dedicated language/type icons (JavaScript, TypeScript, HTML, CSS, JSON, Markdown, Python, C/C++, Java, Shell, etc.).
  - Expand and collapse folders with animated chevrons.
  - Expand All and Collapse All shortcuts.
  - Truncation detection with graceful fallback notification when GitHub returns a truncated recursive tree.

- **Instant Filename & Path Search**:
  - Live filtering as the user types in the search bar.
  - Matches filenames and nested paths while preserving ancestor folder hierarchies.
  - Auto-expands matching folder paths and displays real-time match counters.

- **Built-in Syntax-Highlighted Code Viewer**:
  - Powered by PrismJS with dark developer theme (JetBrains / Charcoal inspired palette).
  - Sticky line numbers column with monospace typography.
  - Line wrap toggle for long lines and horizontal scrolling support.
  - Breadcrumb navigation showing full path hierarchy.
  - File metadata strip: file size (formatted B/KB/MB), language badge, line count.
  - Image preview for `.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`, `.webp` files with checkered transparency background.
  - Safe binary file handling with direct download button.
  - Copy code to clipboard with animated feedback.
  - Download file action and direct GitHub raw file link.

- **Automatic Synchronization (Commit Polling)**:
  - Detects new commits pushed to the repository automatically using lightweight 60-second periodic polling.
  - Compares commit SHAs to avoid redundant tree and file re-downloads.
  - Tab visibility awareness: polling automatically pauses when the browser tab is hidden and resumes when focused.
  - Manual sync refresh button in the navbar.
  - Auto-sync toggle (play/pause).
  - Toast notification banners whenever changes are detected.

- **API Rate Limit & Security**:
  - Rate limit tracking: captures `x-ratelimit-remaining` and `x-ratelimit-reset` headers from responses and displays remaining quota in the UI.
  - Public-only mode without embedding or asking for tokens, eliminating credential leak risks.
  - Code is rendered as data, never executed in the browser.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Code Highlighting** | PrismJS |
| **API** | GitHub REST API v3 |
| **Deployment** | Vercel (SPA rewrite configured) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (version 18+ or 20+ recommended)
- npm or yarn or pnpm

### Installation

1. Clone or copy the project files to your local machine:
   ```bash
   cd "java king"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

---

## 📦 Production Build

To test and build the production bundle:

```bash
npm run build
```

This will run TypeScript type checking (`tsc -b`) and bundle optimized static assets into the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Deployment to Vercel

The application is pre-configured for seamless deployment to Vercel.

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of CodeVault"
   git remote add origin https://github.com/<your-username>/codevault.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **Add New...** > **Project**.
   - Select your `codevault` repository.

3. **Verify Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**:
   - Click **Deploy**. Vercel will build and deploy the app with a production URL (e.g., `https://codevault.vercel.app`).
   - The included `vercel.json` ensures client-side routing works without 404 errors.

### Option 2: Deploy using Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the interactive prompts to deploy directly.

---

## 🔒 Security & API Notes

- **Zero Credentials in Frontend**: CodeVault operates entirely on GitHub's public REST API. No API tokens or secrets are stored in the codebase or client bundle.
- **Unauthenticated Rate Limits**: GitHub provides 60 unauthenticated requests per hour per IP address. CodeVault implements in-memory caching for trees and file contents to minimize requests. The current remaining quota and reset time are visible in the navbar and footer.
- **Safe Code Rendering**: File contents are rendered securely inside pre-formatted blocks with HTML entity escaping or Prism tokenization. No user or repository code is executed as scripts.

---

## 📄 License

MIT License. Free for personal and commercial exploration.
