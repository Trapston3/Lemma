'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookMarked, Clipboard, Quote, AlertTriangle } from 'lucide-react';
import { useUIStore, selectIsBibSidebarOpen } from '@/store/ui-store';

// ─── Types ───────────────────────────────────────────────────────
interface BibEntry {
  type: string;
  key: string;
  title?: string;
  author?: string;
  year?: string;
  journal?: string;
  booktitle?: string;
  publisher?: string;
  url?: string;
  doi?: string;
}

// ─── Lean BibTeX parser ───────────────────────────────────────────
/**
 * Parses a BibTeX string into structured BibEntry objects.
 * Uses bibtex-parse for edge case handling.
 */
async function parseBibTeX(raw: string): Promise<BibEntry[]> {
  try {
    // @ts-expect-error bibtex-parse does not have types available
    const { default: bibtexParse } = await import('bibtex-parse');
    const parsed = bibtexParse.entries(raw);
    return parsed.map((entry: Record<string, unknown>) => ({
      type:       String(entry.type ?? 'misc').toLowerCase(),
      key:        String(entry.key ?? ''),
      title:      entry.fields && typeof entry.fields === 'object' ? String((entry.fields as Record<string, unknown>).title ?? '') : '',
      author:     entry.fields && typeof entry.fields === 'object' ? String((entry.fields as Record<string, unknown>).author ?? '') : '',
      year:       entry.fields && typeof entry.fields === 'object' ? String((entry.fields as Record<string, unknown>).year ?? '') : '',
      journal:    entry.fields && typeof entry.fields === 'object' ? String((entry.fields as Record<string, unknown>).journal ?? '') : '',
      booktitle:  entry.fields && typeof entry.fields === 'object' ? String((entry.fields as Record<string, unknown>).booktitle ?? '') : '',
      publisher:  entry.fields && typeof entry.fields === 'object' ? String((entry.fields as Record<string, unknown>).publisher ?? '') : '',
    }));
  } catch {
    return [];
  }
}

// ─── Sidebar Component ───────────────────────────────────────────
export function BibTeXSidebar() {
  const isOpen = useUIStore(selectIsBibSidebarOpen);
  const closePanel = useUIStore((s) => s.toggleBibSidebar);

  const [rawBibTeX, setRawBibTeX] = useState('');
  const [entries, setEntries] = useState<BibEntry[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);

  const handleParse = useCallback(async () => {
    if (!rawBibTeX.trim()) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = await parseBibTeX(rawBibTeX);
      if (parsed.length === 0) {
        setParseError('No valid BibTeX entries found. Check your format.');
      } else {
        setEntries(parsed);
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Parse error');
    } finally {
      setIsParsing(false);
    }
  }, [rawBibTeX]);

  const insertCitation = useCallback((key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).__lemmaEditor;
    if (editor) {
      editor.chain().focus().insertContent(`[@${key}]`).run();
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const handleDragStart = useCallback((key: string) => {
    dragRef.current = key;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragRef.current) {
      insertCitation(dragRef.current);
      dragRef.current = null;
    }
  }, [insertCitation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="
            fixed right-0 top-0 bottom-0 z-40
            w-80 flex flex-col
            bg-md-surface-container border-l border-md-outline-variant/30
            shadow-md-3
          "
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-md-outline-variant/30">
            <div className="flex items-center gap-2">
              <BookMarked size={16} className="text-md-primary" />
              <span className="text-sm font-semibold text-md-on-surface">BibTeX Library</span>
            </div>
            <button
              onClick={closePanel}
              className="p-1.5 rounded-md-md hover:bg-md-surface-container-high transition-colors text-md-on-surface-variant"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── BibTeX Input ── */}
          <div className="px-4 py-3 border-b border-md-outline-variant/30">
            <textarea
              value={rawBibTeX}
              onChange={(e) => setRawBibTeX(e.target.value)}
              placeholder={`Paste your BibTeX here:\n\n@article{author2024,\n  title={...},\n  author={...},\n  year={2024},\n  journal={...}\n}`}
              className="
                w-full h-40
                bg-md-surface-container-low
                text-md-on-surface text-xs font-mono
                border border-md-outline-variant/40 rounded-md-md
                px-3 py-2 resize-none outline-none
                focus:border-md-primary transition-colors
                placeholder:text-md-on-surface-variant/40
              "
            />
            <button
              onClick={handleParse}
              disabled={isParsing || !rawBibTeX.trim()}
              className="
                mt-2 w-full py-1.5 px-4
                rounded-md-full bg-md-primary text-md-on-primary
                text-sm font-medium
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:opacity-90 transition-opacity
              "
            >
              {isParsing ? 'Parsing…' : 'Parse BibTeX'}
            </button>

            {parseError && (
              <div className="mt-2 flex items-start gap-2 p-2.5 bg-md-error-container rounded-md-md">
                <AlertTriangle size={14} className="text-md-on-error-container mt-0.5 shrink-0" />
                <p className="text-xs text-md-on-error-container">{parseError}</p>
              </div>
            )}
          </div>

          {/* ── Entries List ── */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-md-on-surface-variant/50 gap-2">
                <BookMarked size={28} strokeWidth={1.5} />
                <p className="text-xs text-center">Paste BibTeX above and click Parse</p>
              </div>
            ) : (
              entries.map((entry) => (
                <BibEntryCard
                  key={entry.key}
                  entry={entry}
                  isCopied={copiedKey === entry.key}
                  onCite={() => insertCitation(entry.key)}
                  onDragStart={() => handleDragStart(entry.key)}
                  onDragEnd={handleDragEnd}
                />
              ))
            )}
          </div>

          {/* ── Footer ── */}
          {entries.length > 0 && (
            <div className="px-4 py-2 border-t border-md-outline-variant/30">
              <p className="text-[11px] text-md-on-surface-variant/60">
                {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} · Drag to insert citation
              </p>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── BibEntry Card ────────────────────────────────────────────────
interface BibEntryCardProps {
  entry: BibEntry;
  isCopied: boolean;
  onCite: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function BibEntryCard({ entry, isCopied, onCite, onDragStart, onDragEnd }: BibEntryCardProps) {
  const venue = entry.journal || entry.booktitle || entry.publisher || '';
  const authShort = entry.author?.split(',')[0]?.split(' and')[0]?.trim() ?? '';

  return (
    <motion.div
      layout
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileHover={{ scale: 1.01 }}
      className="
        rounded-md-md border border-md-outline-variant/30
        bg-md-surface-container-low
        p-3 cursor-grab active:cursor-grabbing
      "
    >
      {/* Entry type badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md-full bg-md-secondary-container text-md-on-secondary-container uppercase tracking-wide">
          @{entry.type}
        </span>
        <span className="text-[10px] text-md-on-surface-variant/60 font-mono truncate">
          {entry.key}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-md-on-surface line-clamp-2 mb-1">
        {entry.title || '(No title)'}
      </p>

      {/* Author + Year + Venue */}
      <p className="text-xs text-md-on-surface-variant/70">
        {[authShort, entry.year].filter(Boolean).join(' · ')}
        {venue && <span className="block italic truncate">{venue}</span>}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onCite}
          className="
            flex items-center gap-1.5 px-2.5 py-1
            rounded-md-full bg-md-primary-container text-md-on-primary-container
            text-xs font-medium hover:opacity-90 transition-opacity
          "
        >
          {isCopied
            ? <><Clipboard size={11} />Inserted!</>
            : <><Quote size={11} />Cite</>
          }
        </button>
      </div>
    </motion.div>
  );
}
