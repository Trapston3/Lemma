'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sigma, PencilRuler, FileText, BookOpenText,
  Eye, EyeOff, Terminal, BookMarked,
  Download, Loader2, CheckCircle2, XCircle, Moon, Sun,
  Columns2, FileStack, History, Save,
} from 'lucide-react';

import { useUIStore, SEED_PRESETS } from '@/store/ui-store';
import { TEMPLATES, type Template } from '@/lib/templates';
import type { CompileStatus } from '@/lib/typst-compiler';
import { saveMilestone } from '@/lib/time-machine';

// ─── Colour Swatches for seed presets ────────────────────────────
const SWATCH_COLORS: Record<string, string> = {
  '#A0C4FF': 'bg-[#A0C4FF]',
  '#A8D5A2': 'bg-[#A8D5A2]',
  '#FFADAD': 'bg-[#FFADAD]',
  '#C77DFF': 'bg-[#C77DFF]',
  '#4A4E69': 'bg-[#4A4E69]',
};

// ─── OmniBox Component ───────────────────────────────────────────
export function OmniBox() {
  const {
    isOmniBoxOpen, closeOmniBox,
    isZenMode, toggleZenMode,
    isVimMode, toggleVimMode,
    isTraditionalMode, toggleTraditionalMode,
    isDarkMode, toggleDarkMode,
    isBibSidebarOpen, toggleBibSidebar,
    isTimeMachineOpen, toggleTimeMachine,
    setSeedColor, seedColor,
    documentTitle,
    activeDocumentId,
  } = useUIStore();

  const [compileStatus, setCompileStatus] = useState<CompileStatus>({ status: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSaveMilestone = async () => {
    closeOmniBox();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorJSON = (window as any).__lemmaEditor?.getJSON?.();
    if (editorJSON) {
      await saveMilestone(activeDocumentId, editorJSON, 'Manual Save');
    }
  };

  // ── Global Ctrl+K toggle ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleOmniBox();
      }
      // Ctrl+Shift+Z — Toggle Zen mode
      if (e.key === 'Z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        useUIStore.getState().toggleZenMode();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Auto-focus input on open ──────────────────────────────────
  useEffect(() => {
    if (isOmniBoxOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOmniBoxOpen]);

  // ── PDF Export via Typst WASM ─────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    closeOmniBox();
    setCompileStatus({ status: 'loading' });

    try {
      const { compileToTypst, downloadBlob } = await import('@/lib/typst-compiler');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editorJSON = (window as any).__lemmaEditor?.getJSON?.();
      if (!editorJSON) {
        setCompileStatus({ status: 'error', message: 'Editor not ready' });
        return;
      }
      const blob = await compileToTypst(editorJSON, documentTitle, setCompileStatus);
      downloadBlob(blob, `${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      setCompileStatus({
        status: 'error',
        message: err instanceof Error ? err.message : 'Export failed',
      });
    }
  }, [closeOmniBox, documentTitle]);

  // ── Load Template ─────────────────────────────────────────────
  const handleLoadTemplate = useCallback((template: Template) => {
    closeOmniBox();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).__lemmaEditor;
    if (editor) editor.commands.setContent(template.content);
  }, [closeOmniBox]);

  // ── Compile status toast ──────────────────────────────────────
  const statusIcon = {
    idle: null,
    loading: <Loader2 size={14} className="animate-spin text-md-primary" />,
    compiling: <Loader2 size={14} className="animate-spin text-md-secondary" />,
    success: <CheckCircle2 size={14} className="text-green-500" />,
    error: <XCircle size={14} className="text-md-error" />,
  }[compileStatus.status];

  // ── Shared item class (fixes highlight) ──────────────────────
  const itemCls = `
    flex items-center gap-3 px-3 py-2 rounded-md-md cursor-pointer
    text-sm text-md-on-surface
    data-[selected=true]:bg-md-primary-container
    data-[selected=true]:text-md-on-primary-container
    hover:bg-md-surface-container-highest
    transition-colors duration-100
  `;

  return (
    <>
      {/* ── Export status toast ── */}
      <AnimatePresence>
        {compileStatus.status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="
              fixed bottom-6 right-6 z-[200]
              flex items-center gap-2.5 px-4 py-2.5
              rounded-md-full shadow-md-3
              bg-md-inverse-surface text-md-inverse-on-surface
              text-sm font-medium
            "
          >
            {statusIcon}
            {compileStatus.status === 'loading'   && 'Loading Typst WASM…'}
            {compileStatus.status === 'compiling' && 'Compiling PDF…'}
            {compileStatus.status === 'success'   && 'PDF downloaded!'}
            {compileStatus.status === 'error'     && `Error: ${'message' in compileStatus ? compileStatus.message : ''}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Omni-Box Dialog ── */}
      <Command.Dialog
        open={isOmniBoxOpen}
        onOpenChange={(open) => { if (!open) closeOmniBox(); }}
        label="Lemma Command Palette"
      >
        {/* Backdrop */}
        <AnimatePresence>
          {isOmniBoxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[150] bg-md-on-surface/20 backdrop-blur-sm"
              onClick={closeOmniBox}
            />
          )}
        </AnimatePresence>

        {/* Panel */}
        <AnimatePresence>
          {isOmniBoxOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="
                fixed inset-x-0 top-[15vh] mx-auto z-[160]
                w-full max-w-[560px] px-4
              "
            >
              <div className="
                rounded-md-xl border border-md-outline-variant/40
                bg-md-surface-container-high shadow-md-3
                overflow-hidden
              ">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-md-outline-variant/30">
                  <span className="text-md-on-surface-variant">⌘</span>
                  <Command.Input
                    ref={inputRef}
                    placeholder="Type a command or search…"
                    className="
                      flex-1 bg-transparent outline-none
                      text-md-on-surface text-sm placeholder:text-md-on-surface-variant/50
                    "
                  />
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-md-surface-container text-md-on-surface-variant/60 font-mono">
                    ESC
                  </kbd>
                </div>

                {/* Command list */}
                <Command.List className="max-h-[400px] overflow-y-auto py-2">
                  <Command.Empty className="px-4 py-6 text-center text-sm text-md-on-surface-variant/60">
                    No commands found.
                  </Command.Empty>

                  {/* ── Actions ── */}
                  <Command.Group heading="Actions" className="px-2">
                    <CmdItem
                      itemCls={itemCls}
                      icon={isZenMode ? Eye : EyeOff}
                      label={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
                      shortcut="Ctrl+Shift+Z"
                      onSelect={() => { toggleZenMode(); closeOmniBox(); }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={Terminal}
                      label={isVimMode ? 'Disable Vim Keybindings' : 'Enable Vim Keybindings'}
                      badge={isVimMode ? 'ON' : undefined}
                      onSelect={() => { toggleVimMode(); closeOmniBox(); }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={Columns2}
                      label={isTraditionalMode ? 'Exit Traditional (Split-Pane) Mode' : 'Enter Traditional (Overleaf) Mode'}
                      badge={isTraditionalMode ? 'ON' : undefined}
                      onSelect={() => { toggleTraditionalMode(); closeOmniBox(); }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={isDarkMode ? Sun : Moon}
                      label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                      onSelect={() => { toggleDarkMode(); closeOmniBox(); }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={BookMarked}
                      label={isBibSidebarOpen ? 'Close BibTeX Sidebar' : 'Open BibTeX Sidebar'}
                      shortcut="B"
                      onSelect={() => { toggleBibSidebar(); closeOmniBox(); }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={History}
                      label={isTimeMachineOpen ? 'Close Time Machine' : 'Open Time Machine (History)'}
                      onSelect={() => { toggleTimeMachine(); closeOmniBox(); }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={Save}
                      label="Save Milestone"
                      onSelect={handleSaveMilestone}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={Download}
                      label="Export PDF (Typst WASM)"
                      shortcut="P"
                      onSelect={handleExportPDF}
                    />
                  </Command.Group>

                  {/* ── Format ── */}
                  <Command.Group heading="Document Format" className="px-2 mt-1">
                    <CmdItem
                      itemCls={itemCls}
                      icon={FileStack}
                      label="A4 Format (Default)"
                      onSelect={() => { useUIStore.getState().setDocumentFormat('A4'); closeOmniBox(); }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={FileStack}
                      label="16:9 Presentation Slide"
                      onSelect={() => { useUIStore.getState().setDocumentFormat('16:9'); closeOmniBox(); }}
                    />
                  </Command.Group>

                  {/* ── Insert Blocks ── */}
                  <Command.Group heading="Insert" className="px-2 mt-1">
                    <CmdItem
                      itemCls={itemCls}
                      icon={Sigma}
                      label="Insert Math Block (LaTeX)"
                      onSelect={() => {
                        closeOmniBox();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).__lemmaEditor?.commands.insertLatexBlock();
                      }}
                    />
                    <CmdItem
                      itemCls={itemCls}
                      icon={PencilRuler}
                      label="Insert Diagram / Shape (Excalidraw)"
                      onSelect={() => {
                        closeOmniBox();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).__lemmaEditor?.commands.insertExcalidrawBlock();
                      }}
                    />
                  </Command.Group>

                  {/* ── Templates ── */}
                  <Command.Group heading="Templates" className="px-2 mt-1">
                    {TEMPLATES.map((template) => (
                      <CmdItem
                        key={template.id}
                        itemCls={itemCls}
                        icon={FileText}
                        label={template.name}
                        description={template.description}
                        onSelect={() => handleLoadTemplate(template)}
                      />
                    ))}
                  </Command.Group>

                  {/* ── Theme ── */}
                  <Command.Group heading="Theme Color" className="px-2 mt-1">
                    {SEED_PRESETS.map((preset) => (
                      <Command.Item
                        key={preset.hex}
                        value={`theme ${preset.name}`}
                        onSelect={() => { setSeedColor(preset.hex); closeOmniBox(); }}
                        className={itemCls}
                      >
                        <div className={`
                          w-5 h-5 rounded-md-full border-2 shrink-0
                          ${SWATCH_COLORS[preset.hex] ?? 'bg-md-primary'}
                          ${seedColor === preset.hex ? 'border-md-primary' : 'border-md-outline-variant'}
                        `} />
                        <span>{preset.name}</span>
                        {seedColor === preset.hex && (
                          <span className="ml-auto text-[10px] text-md-primary font-semibold">Active</span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>

                  {/* ── Help ── */}
                  <Command.Group heading="Help" className="px-2 mt-1">
                    <CmdItem
                      itemCls={itemCls}
                      icon={BookOpenText}
                      label="Documentation"
                      onSelect={() => { closeOmniBox(); window.open('https://github.com/lemma/docs', '_blank'); }}
                    />
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="flex items-center gap-3 px-4 py-2 border-t border-md-outline-variant/30 text-[11px] text-md-on-surface-variant/50">
                  <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
                  <span><kbd className="font-mono">↵</kbd> Select</span>
                  <span><kbd className="font-mono">Esc</kbd> Close</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Command.Dialog>
    </>
  );
}

// ─── Reusable CmdItem ────────────────────────────────────────────
interface CmdItemProps {
  itemCls: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  shortcut?: string;
  badge?: string;
  onSelect: () => void;
}

function CmdItem({ itemCls, icon: Icon, label, description, shortcut, badge, onSelect }: CmdItemProps) {
  return (
    <Command.Item value={label} onSelect={onSelect} className={itemCls}>
      <div className="
        flex items-center justify-center w-7 h-7
        rounded-md-md bg-md-surface-container
        text-md-on-surface-variant shrink-0
      ">
        <Icon size={14} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{label}</p>
        {description && (
          <p className="text-xs text-md-on-surface-variant/70 truncate">{description}</p>
        )}
      </div>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-md-full bg-md-secondary-container text-md-on-secondary-container font-semibold">
          {badge}
        </span>
      )}
      {shortcut && (
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-md-surface-container text-md-on-surface-variant/50 font-mono">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
