# Lemma

Lemma is a modern, local-first academic writing and diagramming environment that merges the rich-text editing experience of Notion with the rigorous typesetting power of LaTeX and Typst. Built entirely to run in the browser, it requires no backend servers, databases, or API keys to function—your data never leaves your device.

![Lemma Editor Interface](./public/screenshot1.png)
![Lemma Traditional Split-Pane](./public/screenshot2.png)

## Why I Built This

I wanted an editor that felt fluid and beautiful to write in, but didn't compromise on producing publication-ready academic documents. LaTeX editors like Overleaf are incredibly powerful but visually archaic and require constant server round-trips to compile. Standard WYSIWYG editors look great but completely fail when you need to write complex equations, render vector diagrams, or output a perfectly formatted PDF.

Lemma bridges this gap by combining a custom Tiptap CRDT engine with a WebAssembly-powered Typst compiler.

## Architectural Highlights

This project was an exercise in pushing browser limits and escaping standard server-side rendering patterns.

### 🌐 Local-First Architecture
The entire application runs entirely in the client. Powered by `localforage` (IndexedDB) and **Yjs CRDTs**, Lemma provides zero-latency, offline-capable editing. There are no spinners when you open a document or save a change—everything syncs instantly to your local hardware.

### ⚡ In-Browser PDF Compilation
Serverless functions (like Vercel's) often have strict 50MB limits, which breaks large binary compilers. Instead of relying on a backend, Lemma streams a **Typst WebAssembly (WASM) compiler** directly via CDN into the browser. It takes the Tiptap JSON Abstract Syntax Tree, translates it into Typst source code on the fly, and compiles it into a beautiful PDF locally in milliseconds.

### 🎨 Infinite Canvas Integration
I integrated **Excalidraw** directly into the rich-text editor for seamless diagramming. Because Tiptap (ProseMirror) aggressively overtakes DOM events and styling, embedding a complex canvas inline usually results in broken toolbars and missing events. I solved this by mounting the active Excalidraw instance into an isolated **React Portal** modal, capturing the SVGs, and saving them back to the editor AST upon closure.

### 🕰️ Git-Style Time Machine
Instead of a standard undo/redo stack that gets lost when you refresh the page, Lemma implements an AST-based milestone snapshotting system. It saves immutable snapshots of your document over time, allowing you to browse past versions and restore them exactly as they were.

### 💅 Material You Design
The interface isn't just dark mode—it utilizes a dynamic, fluid **Material You** (M3) design system with custom CSS tokens. It features glassmorphic overlays, vibrant accent palettes, and responsive layouts that adapt beautifully to your screen size.

## Features at a Glance

- **Rich Text & Slash Commands:** Type `/` to instantly insert headings, quotes, math blocks, and diagrams.
- **KaTeX Math Engine:** Write LaTeX natively inline. Equations render beautifully in real-time.
- **Split-Pane Sync:** Prefer the traditional Overleaf/Texworks experience? Open the raw code pane and write raw Markdown/Typst—then hit sync to instantly update the visual AST.
- **Vim Mode:** Fully functional Vim keybindings for power users who hate touching the mouse.
- **Instant Export:** Generate perfectly typeset PDFs without waiting for a server.

## Getting Started

Because Lemma is local-first, there's no backend setup required.

```bash
# Clone the repository
git clone https://github.com/Trapston3/lemma.git
cd lemma

# Install dependencies (use legacy-peer-deps for Tiptap core resolutions)
npm install --legacy-peer-deps

# Run the development server
npm run dev
```

Open `http://localhost:3000` with your browser to see the result.

## Tech Stack

- **Framework:** Next.js (App Router) + React
- **Editor:** Tiptap / ProseMirror + Yjs
- **Compiler:** Typst WebAssembly (`@myriaddreamin/typst-ts-web-compiler`)
- **Canvas:** Excalidraw
- **Storage:** LocalForage (IndexedDB)
- **Styling:** Tailwind CSS + Custom Material Design 3 Tokens
- **Math:** KaTeX

---
*Built with ❤️ to make academic writing suck less.*
