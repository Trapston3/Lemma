'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Terminal, Columns2, FileStack } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';

// ─── Vim Keybinds Cheatsheet ──────────────────────────────────────
const VIM_BINDS = [
  { key: 'Alt+H/L',       desc: 'Move cursor left / right' },
  { key: 'Alt+J/K',       desc: 'Jump to next / previous block' },
  { key: 'Alt+W',         desc: 'Jump to next word' },
  { key: 'Alt+B',         desc: 'Jump back one word' },
  { key: 'Alt+0',         desc: 'Start of line' },
  { key: 'Alt+4',         desc: 'End of line' },
  { key: 'Ctrl+Shift+Home', desc: 'Start of document' },
  { key: 'Ctrl+Shift+End',  desc: 'End of document' },
  { key: 'Alt+U',         desc: 'Undo' },
  { key: 'Alt+R',         desc: 'Redo' },
  { key: 'Ctrl+Shift+D',  desc: 'Delete current block (dd)' },
  { key: 'Ctrl+Shift+Y',  desc: 'Duplicate current block (yy+p)' },
  { key: 'Escape',        desc: 'Blur / exit focus' },
];

const GLOBAL_BINDS = [
  { key: 'Ctrl+K',        desc: 'Open Command Palette (OmniBox)' },
  { key: 'Ctrl+Shift+Z',  desc: 'Toggle Zen / Focus Mode' },
  { key: 'Ctrl+F',        desc: 'Open document search' },
  { key: 'Ctrl+B',        desc: 'Bold' },
  { key: 'Ctrl+I',        desc: 'Italic' },
  { key: 'Ctrl+U',        desc: 'Underline' },
  { key: '/',             desc: 'Open slash command menu (in editor)' },
];

// ─── SettingsView ─────────────────────────────────────────────────
export function SettingsView() {
  const {
    isDarkMode, toggleDarkMode,
    isVimMode, toggleVimMode,
    isTraditionalMode, toggleTraditionalMode,
    documentFormat, setDocumentFormat,
  } = useUIStore();

  return (
    <main className="ml-20 min-h-screen bg-md-surface-container-low px-8 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-md-on-surface mb-2">Settings</h1>
          <p className="text-md-on-surface-variant">Customize your Lemma experience.</p>
        </div>

        {/* ── Appearance ── */}
        <Section title="Appearance">
          <Toggle
            icon={isDarkMode ? Moon : Sun}
            label="Dark Mode"
            description="Switch between light and dark M3 Expressive palette"
            active={isDarkMode}
            onToggle={toggleDarkMode}
          />
        </Section>

        {/* ── Editor Modes ── */}
        <Section title="Editor Modes">
          <Toggle
            icon={Terminal}
            label="Vim Keybindings"
            description="Enable Alt+hjkl movement and Ctrl+Shift+D/Y block operations"
            active={isVimMode}
            onToggle={toggleVimMode}
          />
        </Section>

        {/* ── Document Format ── */}
        <Section title="Document Format">
          <div className="flex gap-3">
            {(['A4', '16:9'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setDocumentFormat(fmt)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-md-lg
                  border transition-all duration-150 text-sm font-medium
                  ${documentFormat === fmt
                    ? 'bg-md-primary-container text-md-on-primary-container border-md-primary'
                    : 'border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container-high'
                  }
                `}
              >
                <FileStack size={14} strokeWidth={2} />
                {fmt}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-md-on-surface-variant">
            A4 is standard for academic papers. 16:9 formats the canvas as a presentation slide.
          </p>
        </Section>

        {/* ── Keyboard Shortcuts ── */}
        <Section title="Global Keyboard Shortcuts">
          <BindsTable binds={GLOBAL_BINDS} />
        </Section>

        <Section title="Vim Mode Keybinds">
          <BindsTable binds={VIM_BINDS} />
        </Section>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-md-xl border border-md-outline-variant/30
        bg-md-surface p-6 flex flex-col gap-4
      "
    >
      <h2 className="text-sm font-semibold text-md-on-surface-variant uppercase tracking-widest">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function Toggle({
  icon: Icon,
  label,
  description,
  active,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-center gap-3">
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-md-md
          ${active ? 'bg-md-primary-container text-md-on-primary-container' : 'bg-md-surface-container text-md-on-surface-variant'}
          transition-colors duration-150
        `}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-medium text-md-on-surface">{label}</p>
          <p className="text-xs text-md-on-surface-variant">{description}</p>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${active ? 'bg-md-primary' : 'bg-md-outline-variant'}
        `}
      >
        <span className={`
          absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md-1
          transition-transform duration-200
          ${active ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </button>
    </div>
  );
}

function BindsTable({ binds }: { binds: { key: string; desc: string }[] }) {
  return (
    <div className="flex flex-col gap-1">
      {binds.map(({ key, desc }) => (
        <div key={key} className="flex items-center justify-between py-1.5 border-b border-md-outline-variant/20 last:border-0">
          <span className="text-sm text-md-on-surface-variant">{desc}</span>
          <kbd className="text-[11px] px-2 py-0.5 rounded bg-md-surface-container font-mono text-md-on-surface border border-md-outline-variant/30">
            {key}
          </kbd>
        </div>
      ))}
    </div>
  );
}
