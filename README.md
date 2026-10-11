# JavaLand — Royal Code Sanctuary & Repository Explorer

[![React](https://img.shields.io/badge/React-19-f59e0b.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-d97706.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-amber.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-fbbf24.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**JavaLand** is a bespoke, multi-page creative developer workspace and repository explorer designed with a luxurious **Golden & White aesthetic** (Royal Ivory & Gold with Midnight Obsidian Gold support). It moves far beyond a simple file-listing utility, offering an interactive, multi-dimensional code experience.

---

## 🏰 Multi-Page Experience & Creative Features

Unlike traditional single-page directory viewers, **JavaLand** is organized into 5 dedicated pages:

### 1. 🏰 Sanctuary Hub (`/home`)
- **Royal Hero Banner**: Crown-crested welcome section with golden gradients, fluid animations, and a quick-connect search bar.
- **Connected Repository Showcase**: Luxury card showing real-time owner, stars, forks, language, and latest commit SHA & message.
- **Featured Repositories Deck**: Instant one-click connection to curated repositories like `amritanshguptadev/javascript-lab` (Default), `facebook/react`, `vuejs/core`, and `tailwindlabs/tailwindcss`.
- **Sanctuary Modules Grid**: Quick jump cards to all platform areas.

### 2. ⚡ Code Studio (`/explorer`)
- **Creative Nested Tree Explorer**: Hierarchical folder explorer with golden chevron indicators, custom file icons by extension, and instant filename/path search.
- **Built-in Code Viewer**: Powered by PrismJS with warm golden token highlighting, sticky line numbers column, breadcrumbs, copy with animated feedback, and file download.
- **Studio Compass Inspector**: A collapsible side panel displaying blob SHA, formatted byte size, line count, full path, and copy path shortcuts.

### 3. 🧪 Live Lab Runner (`/playground`)
- **Interactive Execution Sandbox**: Built specifically for repositories with web projects (such as `amritanshguptadev/javascript-lab`'s `lab 1` through `lab 6`).
- **Live Sandboxed Preview**: Renders and executes the lab's `index.html` and `script.js` in a secure browser sandbox.
- **Multi-Tab Inspector**: Switch seamlessly between **Interactive Preview**, **HTML Source**, **JavaScript Source**, and **Live Console**.
- **Real-Time Console Capture**: Intercepts `console.log`, `console.warn`, and `console.error` from the running lab and streams them into the live console panel.
- **Rerun Lab Button**: Instantly resets and re-executes lab logic.

### 4. 📊 Repository Analytics (`/analytics`)
- **File Type & Language Distribution**: Interactive progress bars showcasing percentage breakdown by extension (`.js`, `.html`, `.css`, `.md`, etc.) with file counts and total bytes.
- **Volume & Metrics**: Total files, directory count, and total repository payload volume.
- **Largest Files Breakdown**: Top files sorted by size with formatted byte badges.
- **Branch & Commit Card**: Displays active branch and latest commit SHA.

### 5. ⚙️ Sanctuary Preferences (`/settings`)
- **Theme Selector**: Toggle between **Royal Ivory & Gold** (pristine white with liquid gold highlights) and **Midnight Obsidian Gold** (deep dark backdrop with luminous 24K gold accents).
- **Auto-Sync Polling**: Configure periodic commit polling (15s, 30s, 60s standard, 120s, or pause).
- **GitHub API Quota Meter**: Real-time progress bar displaying remaining unauthenticated requests and reset timestamp.
- **Cache Management**: One-click purge of in-memory tree and file caches.

---

## 🎨 Aesthetic & Design System

- **Color Palette**:
  - *Royal Ivory & Gold*: Cream/pearl backdrop (`#fbf9f5`), rich white cards (`#ffffff`), liquid gold gradients (`#f59e0b` to `#d97706`), champagne highlights (`#fef3c7`).
  - *Midnight Obsidian Gold*: Obsidian black (`#0c0e12`), dark slate cards (`#141721`), luminous 24K gold accents (`#fbbf24`).
- **Prism Token Styling**: Warm amber keywords, celestial blue functions, emerald strings, and gold variables.
- **Custom Accents**: Golden rounded scrollbars, warm glowing card borders, and smooth micro-interactions.

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
| **Hosting** | Vercel (SPA routing configured) |

---

## 🚀 Local Development

1. Open your terminal in the project directory:
   ```bash
   cd "java king"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:5173/
   ```

---

## 📦 Production Build

To test and compile the production bundle:

```bash
npm run build
```

The output is bundled into the `dist/` directory.

---

## 🌐 Deploy to Vercel

1. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "JavaLand: Royal Code Sanctuary multi-page release"
   git remote add origin https://github.com/<your-username>/javaland.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **Add New...** > **Project** and select your repository.
   - Framework preset: **Vite** (Build command: `npm run build`, Output directory: `dist`).
   - Click **Deploy**. The included `vercel.json` provides client-side SPA routing rewrites.

---

## 📄 License

MIT License. Crafted with regal precision.
