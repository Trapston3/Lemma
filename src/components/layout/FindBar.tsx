'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useUIStore, selectIsFindBarOpen } from '@/store/ui-store';

/**
 * FindBar — Floating Ctrl+F search bar, Word-style.
 *
 * Searches document text inside the Tiptap editor and scrolls
 * matches into view. Uses the browser's built-in mark API for
 * highlighting (CSS ::highlight or mark tags via innerHTML approach).
 */
export function FindBar() {
  const isFindBarOpen = useUIStore(selectIsFindBarOpen);
  const closeFindBar  = useUIStore((s) => s.closeFindBar);

  const [query, setQuery]           = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const matchesRef = useRef<Range[]>([]);

  // ── Ctrl+F hijack ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleFindBar();
      }
      if (e.key === 'Escape') {
        if (useUIStore.getState().isFindBarOpen) {
          useUIStore.getState().closeFindBar();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Auto-focus on open ─────────────────────────────────────────
  useEffect(() => {
    if (isFindBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setMatchCount(0);
      setCurrentIdx(0);
      clearHighlights();
    }
  }, [isFindBarOpen]);

  // ── Highlight logic ────────────────────────────────────────────
  const clearHighlights = useCallback(() => {
    // Remove existing <mark> tags
    const editor = document.querySelector('.tiptap');
    if (!editor) return;
    const marks = editor.querySelectorAll('mark[data-find]');
    marks.forEach((m) => {
      const parent = m.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent ?? ''), m);
        parent.normalize();
      }
    });
    matchesRef.current = [];
  }, []);

  const runSearch = useCallback((q: string) => {
    clearHighlights();
    if (!q.trim()) {
      setMatchCount(0);
      setCurrentIdx(0);
      return;
    }

    const editor = document.querySelector('.tiptap');
    if (!editor) return;

    // Walk text nodes and wrap matches with <mark>
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);

    let count = 0;
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    for (const textNode of textNodes) {
      const text = textNode.textContent ?? '';
      if (!regex.test(text)) continue;
      regex.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const mark = document.createElement('mark');
        mark.setAttribute('data-find', String(count));
        mark.style.cssText = 'background:rgba(var(--md-sys-color-primary,160,196,255),0.35);border-radius:2px;';
        mark.textContent = match[0];
        frag.appendChild(mark);
        count++;
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      textNode.parentNode?.replaceChild(frag, textNode);
    }

    setMatchCount(count);
    setCurrentIdx(count > 0 ? 0 : -1);

    if (count > 0) scrollToMatch(0);
  }, [clearHighlights]);

  const scrollToMatch = (idx: number) => {
    const marks = document.querySelectorAll('mark[data-find]');
    marks.forEach((m, i) => {
      const el = m as HTMLElement;
      el.style.background = i === idx
        ? 'rgba(255,165,0,0.6)'
        : 'rgba(160,196,255,0.35)';
    });
    marks[idx]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const handleNext = () => {
    if (matchCount === 0) return;
    const next = (currentIdx + 1) % matchCount;
    setCurrentIdx(next);
    scrollToMatch(next);
  };

  const handlePrev = () => {
    if (matchCount === 0) return;
    const prev = (currentIdx - 1 + matchCount) % matchCount;
    setCurrentIdx(prev);
    scrollToMatch(prev);
  };

  // Re-run search when query changes
  useEffect(() => {
    if (isFindBarOpen) runSearch(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isFindBarOpen]);

  return (
    <AnimatePresence>
      {isFindBarOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="
            fixed top-4 right-6 z-[120]
            flex items-center gap-2 px-3 py-2
            rounded-md-lg border border-md-outline-variant/40
            bg-md-surface-container-high shadow-md-3
            min-w-[280px]
          "
        >
          <Search size={14} className="text-md-on-surface-variant shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.shiftKey ? handlePrev() : handleNext(); }
            }}
            placeholder="Find in document…"
            className="
              flex-1 bg-transparent outline-none
              text-sm text-md-on-surface placeholder:text-md-on-surface-variant/40
            "
          />

          {/* Match counter */}
          {query && (
            <span className="text-xs text-md-on-surface-variant whitespace-nowrap">
              {matchCount === 0 ? 'No results' : `${currentIdx + 1} / ${matchCount}`}
            </span>
          )}

          {/* Prev / Next */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrev}
              disabled={matchCount === 0}
              title="Previous match (Shift+Enter)"
              className="p-1 rounded hover:bg-md-surface-container-highest disabled:opacity-30 transition-colors"
            >
              <ChevronUp size={14} className="text-md-on-surface-variant" />
            </button>
            <button
              onClick={handleNext}
              disabled={matchCount === 0}
              title="Next match (Enter)"
              className="p-1 rounded hover:bg-md-surface-container-highest disabled:opacity-30 transition-colors"
            >
              <ChevronDown size={14} className="text-md-on-surface-variant" />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={closeFindBar}
            title="Close (Esc)"
            className="p-1 rounded hover:bg-md-surface-container-highest transition-colors"
          >
            <X size={14} className="text-md-on-surface-variant" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
