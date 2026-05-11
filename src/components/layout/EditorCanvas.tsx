'use client';

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, selectIsZenMode, selectIsTraditionalMode, selectDocumentFormat } from '@/store/ui-store';
import { marked } from 'marked';

interface EditorCanvasProps {
  children: ReactNode;
  /** Raw LaTeX/Typst source for the split-pane left pane (traditional mode) */
  rawSource?: string;
  onRawSourceChange?: (val: string) => void;
}

export function EditorCanvas({ children, rawSource = '', onRawSourceChange }: EditorCanvasProps) {
  const isZenMode         = useUIStore(selectIsZenMode);
  const isTraditionalMode = useUIStore(selectIsTraditionalMode);
  const documentFormat    = useUIStore(selectDocumentFormat);

  // Paper width classes based on document format
  const paperMaxW  = documentFormat === '16:9' ? 'max-w-6xl' : 'max-w-4xl';
  const paperPadV  = isZenMode ? 'py-12' : 'py-10';
  const paperPadH  = isZenMode ? 'px-14' : 'px-12';

  const handleSyncToPreview = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = typeof window !== 'undefined' ? (window as any).__lemmaEditor : null;
    if (!editor) return;
    
    try {
      // Pre-process LaTeX blocks so marked doesn't destroy them
      const preprocessed = rawSource.replace(
        /\$\$\s*([\s\S]*?)\s*\$\$/g,
        '<div data-type="latex-block" data-latex="$1"></div>'
      );
      
      const htmlContent = await marked.parse(preprocessed);
      editor.commands.setContent(htmlContent, { emitUpdate: true });
    } catch (error) {
      console.error("Failed to parse markdown:", error);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={`${isZenMode}-${isTraditionalMode}-${documentFormat}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          min-h-screen flex flex-col items-center w-full
          bg-md-surface-container-low
          transition-all duration-300 ease-in-out
          px-4 py-8 pb-24 md:pb-8
          ${isZenMode ? 'ml-0' : 'ml-0 md:ml-20'}
        `}
      >
        {/* Zen mode exit hint */}
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              fixed top-4 right-4 z-50
              flex items-center gap-1.5 px-3 py-1.5
              rounded-md-full bg-md-surface-container-high
              border border-md-outline-variant/30
              text-xs text-md-on-surface-variant/70
            "
          >
            Zen Mode · <kbd className="font-mono text-md-on-surface-variant">Ctrl+Shift+Z</kbd>
          </motion.div>
        )}

        {isTraditionalMode ? (
          /* ── Traditional (Overleaf) Split-Pane ── */
          <div className={`w-full ${paperMaxW} mx-auto flex flex-col lg:flex-row gap-0 shadow-md-3 rounded-md-lg overflow-hidden border border-md-outline-variant/30`}>
            {/* Left: raw code editor */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e2e] border-b lg:border-b-0 lg:border-r border-md-outline-variant/20">
              <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-white/5">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f38ba8]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fab387] ml-2" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a6e3a1] ml-2" />
                  <span className="ml-3 text-xs text-white/40 font-mono">main.typ</span>
                </div>
                <button
                  onClick={handleSyncToPreview}
                  className="bg-md-primary text-md-on-primary hover:opacity-90 px-3 py-1 rounded-md-md text-xs font-semibold transition-opacity"
                >
                  Render Preview
                </button>
              </div>
              <textarea
                value={rawSource}
                onChange={(e) => onRawSourceChange?.(e.target.value)}
                spellCheck={false}
                className="
                  flex-1 w-full min-h-[50vh] lg:min-h-[80vh] resize-none
                  bg-transparent text-[#cdd6f4] font-mono text-sm
                  px-6 py-5 outline-none
                  leading-relaxed
                  placeholder:text-white/20
                "
                placeholder="// Type Typst or LaTeX source here…"
              />
            </div>

            {/* Right: visual preview (the Tiptap editor) */}
            <div className={`flex-1 flex flex-col bg-md-surface px-6 py-8 md:${paperPadH} md:${paperPadV} overflow-auto`}>
              <div className="text-[10px] uppercase tracking-widest text-md-on-surface-variant/40 font-semibold mb-4">
                Visual Preview
              </div>
              {children}
            </div>
          </div>
        ) : (
          /* ── Standard document paper ── */
          <motion.div
            layout
            className={`
              w-full mx-auto ${paperMaxW}
              bg-md-surface
              border border-md-outline-variant/30
              rounded-md-lg shadow-md-3
              transition-all duration-300
              ${paperPadH} ${paperPadV}
              ${documentFormat === '16:9'
                ? 'aspect-video overflow-auto'
                : ''
              }
            `}
          >
            {children}
          </motion.div>
        )}
      </motion.main>
    </AnimatePresence>
  );
}
