# JavaLand — Royal Code Sanctuary & Repository Explorer

[![React](https://img.shields.io/badge/React-19-f59e0b.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-d97706.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-amber.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-fbbf24.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**JavaLand** is an ultra-luxurious, multi-page creative developer sanctuary and repository explorer. Designed with regal aesthetics and powered by 6 complete atmospheric visual themes, JavaLand provides instant exploration, code viewing, live interactive lab sandbox running, and repository analytics with zero unnecessary API overhead.

---

## 🏰 Multi-Page Experience & Architecture

JavaLand is crafted as a multi-page sanctuary with a persistent universal header, regal floating quick actions, and unified footer:

### 1. 🏰 Sanctuary Hub (`/home`)
- **Royal Hero Banner**: Majestic welcome section with theme-tailored ambient lighting, animated badges, and quick-connect input.
- **Flagship Connection**: Permanent integration for `amritanshguptadev/javascript-lab` with real-time metadata, live branch, commit SHA, and stars.
- **Multi-Repo Dock**: Instant one-click connection to switch repositories smoothly (`javascript-lab`, `react`, `vue`, `tailwindcss`) or connect any custom GitHub repo.
- **Sanctuary Modules Grid**: Direct gateways to the Studio, Lab Sandbox, and Repository Analytics.

### 2. ⚡ Code Studio (`/explorer`)
- **Creative Nested Tree Explorer**: Hierarchical folder navigator with smooth chevron expansion, custom file icons, and instant real-time filename filter.
- **High-Contrast Code Viewer**: Powered by PrismJS with theme-reactive syntax highlighting, sticky line numbering, breadcrumbs, animated copy feedback, and instant raw file download.
- **Zero-API In-Memory & Session Caching**: Once loaded, tree structures and file contents are cached in `sessionStorage`—browsing previously opened files costs 0 GitHub API requests.
- **Studio Compass Inspector**: Real-time side inspector displaying file size, line counts, SHA, exact path, and quick copy triggers.

### 3. 🧪 Live Lab Runner (`/playground`)
- **Interactive Execution Sandbox**: Built specifically for web projects and interactive tutorials (such as `amritanshguptadev/javascript-lab`'s `lab 1` through `lab 6`).
- **Live Sandboxed Preview**: Executes HTML and JS in an isolated, safe iframe sandbox.
- **Multi-Tab Inspector**: Switch seamlessly between **Interactive Preview**, **HTML Source**, **JavaScript Source**, and **Live Console**.
- **Real-Time Console Stream**: Intercepts `console.log`, `console.warn`, and `console.error` and streams formatted output into the live console panel.
- **Instant Lab Switcher**: Quick pill selector for labs with one-click reload.

### 4. 📊 Repository Analytics (`/analytics`)
- **Language & Extension Breakdown**: Interactive progress bars detailing percentage distribution across file types (`.js`, `.html`, `.css`, `.md`, `.json`, etc.).
- **Volume Metrics**: Total files, directory count, and computed payload weight.
- **Heaviest Files Leaderboard**: Sorted table of largest files with formatted size badges.
- **Repository Health & Commits**: Real-time commit SHA card and repository architecture overview.

---

## 🎨 6 Immersive Atmospheric Themes

Switch seamlessly across 6 deeply crafted visual environments from the header menu or floating quick bar:

| Theme | Ambient Mood | Visual Tone |
|---|---|---|
| **Ivory Imperial** | Crisp, royal palace ivory & liquid gold | Cream light canvas with amber gold highlights |
| **Midnight Obsidian** | Ultra-deep black void & 24K gold | Deep dark canvas with shimmering golden accents |
| **Emerald Sanctuary** | Mystical evergreen twilight & champagne gold | Deep emerald tones with lustrous champagne gold |
| **Sapphire Abyss** | Midnight oceanic blue & celestial gold | Deep oceanic indigo with luminous starlight gold |
| **Crimson Velvet** | Royal burgundy mahogany & bronze gold | Warm crimson dark tones with fiery gold details |
| **Cosmic Amethyst** | Deep violet nebula & lavender gold | Royal amethyst canvas with incandescent lavender gold |

*All themes persist in `localStorage` and adapt the entire interface: backgrounds, cards, typography, borders, badges, scrollbars, code viewers, and sandboxes.*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 & Semantic CSS Theme Tokens |
| **Icons** | Lucide React |
| **Syntax Highlighting** | PrismJS |
| **API** | GitHub REST API v3 (Optimized with `sessionStorage` caching) |
| **Hosting** | Vercel (Ready with `vercel.json` SPA catch-all rewrites) |

---

## 🚀 Local Development

```bash
# 1. Clone repository
git clone https://github.com/amritanshguptadev/javaland.git
cd javaland

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 📦 Production Build

```bash
npm run build
```

The compiled, production-ready bundle will be in `dist/`.

---

## 🌐 Deploy to Vercel

This repository is pre-configured for 1-click zero-config deployment on Vercel:

1. Push your changes to GitHub:
   ```bash
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com/new):
   - Import `amritanshguptadev/javaland`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Click **Deploy**
3. `vercel.json` includes client-side SPA routing rewrites so all page URLs (`/`, `/home`, `/explorer`, `/playground`, `/analytics`) resolve smoothly on direct browser refresh.

---

## 📄 License

MIT License. Designed with royal elegance.
