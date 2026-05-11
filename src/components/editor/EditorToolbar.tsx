'use client';

import { type Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  Code, Quote, Minus,
  Sigma, PencilRuler, Undo2, Redo2,
  ChevronDown, Palette, Highlighter,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────
interface EditorToolbarProps {
  editor: Editor;
}

// ─── Font Families ────────────────────────────────────────────────
const FONT_FAMILIES = [
  { label: 'Sans Serif', value: 'Inter, system-ui, sans-serif' },
  { label: 'Serif',      value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace',  value: '"JetBrains Mono", "Fira Code", monospace' },
] as const;

// ─── Text Colors ──────────────────────────────────────────────────
const TEXT_COLORS = [
  { label: 'Default',  value: '' },
  { label: 'Red',      value: '#dc2626' },
  { label: 'Orange',   value: '#ea580c' },
  { label: 'Yellow',   value: '#ca8a04' },
  { label: 'Green',    value: '#16a34a' },
  { label: 'Blue',     value: '#2563eb' },
  { label: 'Purple',   value: '#9333ea' },
  { label: 'Pink',     value: '#db2777' },
] as const;

// ─── Highlight Colors ─────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { label: 'None',    value: '' },
  { label: 'Yellow',  value: '#fef08a' },
  { label: 'Green',   value: '#bbf7d0' },
  { label: 'Blue',    value: '#bfdbfe' },
  { label: 'Pink',    value: '#fbcfe8' },
  { label: 'Purple',  value: '#e9d5ff' },
  { label: 'Orange',  value: '#fed7aa' },
  { label: 'Red',     value: '#fecaca' },
] as const;

// ─── Tooltip Wrapper ──────────────────────────────────────────────
function TT({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <Tooltip.Provider delayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={6}
            className="
              px-2 py-1 rounded-md text-[11px] font-medium
              bg-md-inverse-surface text-md-inverse-on-surface
              shadow-md-2 z-[500]
              animate-in fade-in-0 zoom-in-95
            "
          >
            {content}
            <Tooltip.Arrow className="fill-md-inverse-surface" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// ─── ToolbarButton ────────────────────────────────────────────────
interface TBProps {
  icon: React.ElementType;
  isActive?: boolean;
  onClick: () => void;
  title: string;
  size?: number;
}

function TB({ icon: Icon, isActive = false, onClick, title, size = 16 }: TBProps) {
  return (
    <TT content={title}>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        aria-label={title}
        className={`
          flex items-center justify-center w-8 h-8 rounded-md-md
          transition-colors duration-100
          ${isActive
            ? 'bg-md-primary-container text-md-on-primary-container'
            : 'text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-on-surface'
          }
        `}
      >
        <Icon size={size} strokeWidth={isActive ? 2.5 : 1.8} />
      </motion.button>
    </TT>
  );
}

// ─── Divider ──────────────────────────────────────────────────────
function Divider() {
  return <div className="w-px h-6 bg-md-outline-variant/40 mx-1" />;
}

// ─── Dropdown Wrapper ─────────────────────────────────────────────
function Dropdown({
  label,
  tooltip,
  children,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  tooltip: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <TT content={tooltip}>
      <div ref={ref} className="relative">
        <button
          onClick={onToggle}
          className="
            flex items-center gap-1 px-2.5 py-1.5 rounded-md-md
            text-xs font-medium text-md-on-surface-variant
            hover:bg-md-surface-container-high transition-colors
          "
        >
          {label}
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              absolute top-full left-0 mt-1 z-50
              min-w-[160px] py-1
              bg-md-surface-container-high border border-md-outline-variant/40
              rounded-md-lg shadow-md-3
            "
          >
            {children}
          </motion.div>
        )}
      </div>
    </TT>
  );
}

// ─── Main Toolbar ─────────────────────────────────────────────────
export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [mathInput, setMathInput] = useState('');
  const mathInputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = useCallback((name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }, []);
  const closeDropdowns = useCallback(() => {
    setOpenDropdown(null);
    setIsMathModalOpen(false);
  }, []);

  useEffect(() => {
    if (isMathModalOpen && mathInputRef.current) {
      mathInputRef.current.focus();
    }
  }, [isMathModalOpen]);

  const handleInsertInlineMath = () => {
    if (mathInput.trim() && editor) {
      editor.chain().focus().setInlineMath(mathInput).run();
      setMathInput('');
      setIsMathModalOpen(false);
    }
  };

  const currentFont = FONT_FAMILIES.find(
    (f) => editor.isActive('textStyle', { fontFamily: f.value })
  )?.label ?? 'Sans Serif';

  return (
    <div
      className="
        sticky top-0 z-30
        flex items-center gap-0.5 flex-wrap
        px-3 py-1.5
        bg-md-surface-container border-b border-md-outline-variant/30
        backdrop-blur-sm
      "
    >
      {/* ── Undo / Redo ── */}
      <TB icon={Undo2} onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" />
      <TB icon={Redo2} onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)" />
      <Divider />

      {/* ── Font Family ── */}
      <Dropdown
        label={currentFont}
        tooltip="Font Family"
        isOpen={openDropdown === 'font'}
        onToggle={() => toggleDropdown('font')}
        onClose={closeDropdowns}
      >
        {FONT_FAMILIES.map((font) => (
          <button
            key={font.value}
            onClick={() => { editor.chain().focus().setFontFamily(font.value).run(); closeDropdowns(); }}
            className={`
              w-full px-3 py-1.5 text-left text-sm
              transition-colors hover:bg-md-surface-container-highest
              ${editor.isActive('textStyle', { fontFamily: font.value })
                ? 'text-md-primary font-semibold'
                : 'text-md-on-surface'
              }
            `}
            style={{ fontFamily: font.value }}
          >
            {font.label}
          </button>
        ))}
      </Dropdown>
      <Divider />

      {/* ── Headings ── */}
      <TB icon={Heading1} isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1" />
      <TB icon={Heading2} isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2" />
      <TB icon={Heading3} isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3" />
      <Divider />

      {/* ── Inline Formatting ── */}
      <TB icon={Bold}          isActive={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}          title="Bold (Ctrl+B)" />
      <TB icon={Italic}        isActive={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}        title="Italic (Ctrl+I)" />
      <TB icon={Underline}     isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}     title="Underline (Ctrl+U)" />
      <TB icon={Strikethrough} isActive={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}        title="Strikethrough" />
      <TB icon={Code}          isActive={editor.isActive('code')}      onClick={() => editor.chain().focus().toggleCode().run()}          title="Inline Code" />
      <Divider />

      {/* ── Text Color ── */}
      <Dropdown
        label="Color"
        tooltip="Text Color"
        isOpen={openDropdown === 'color'}
        onToggle={() => toggleDropdown('color')}
        onClose={closeDropdowns}
      >
        <div className="grid grid-cols-4 gap-1.5 p-2">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.label}
              onClick={() => {
                color.value
                  ? editor.chain().focus().setColor(color.value).run()
                  : editor.chain().focus().unsetColor().run();
                closeDropdowns();
              }}
              title={color.label}
              className="flex items-center justify-center w-8 h-8 rounded-md-md border border-md-outline-variant/30 hover:scale-110 transition-transform"
            >
              {color.value
                ? <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color.value }} />
                : <Palette size={14} className="text-md-on-surface-variant" />
              }
            </button>
          ))}
        </div>
      </Dropdown>

      {/* ── Highlight Color ── */}
      <Dropdown
        label=""
        tooltip="Highlight Color (text background)"
        isOpen={openDropdown === 'highlight'}
        onToggle={() => toggleDropdown('highlight')}
        onClose={closeDropdowns}
      >
        <div className="grid grid-cols-4 gap-1.5 p-2">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.label}
              onClick={() => {
                color.value
                  ? editor.chain().focus().setHighlight({ color: color.value }).run()
                  : editor.chain().focus().unsetHighlight().run();
                closeDropdowns();
              }}
              title={color.label}
              className="flex items-center justify-center w-8 h-8 rounded-md-md border border-md-outline-variant/30 hover:scale-110 transition-transform"
            >
              {color.value
                ? <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: color.value }} />
                : <Highlighter size={14} className="text-md-on-surface-variant" />
              }
            </button>
          ))}
        </div>
      </Dropdown>
      <Divider />

      {/* ── Alignment ── */}
      <TB icon={AlignLeft}    isActive={editor.isActive({ textAlign: 'left' })}    onClick={() => editor.chain().focus().setTextAlign('left').run()}    title="Align Left" />
      <TB icon={AlignCenter}  isActive={editor.isActive({ textAlign: 'center' })}  onClick={() => editor.chain().focus().setTextAlign('center').run()}  title="Align Center" />
      <TB icon={AlignRight}   isActive={editor.isActive({ textAlign: 'right' })}   onClick={() => editor.chain().focus().setTextAlign('right').run()}   title="Align Right" />
      <TB icon={AlignJustify} isActive={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify" />
      <Divider />

      {/* ── Lists ── */}
      <TB icon={List}         isActive={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet List" />
      <TB icon={ListOrdered}  isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List" />
      <TB icon={Quote}        isActive={editor.isActive('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Blockquote" />
      <TB icon={Minus}        onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule" />
      <Divider />

      {/* ── Insert Blocks ── */}
      <div className="relative">
        <TT content="Insert Inline Math ($...$)">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMathModalOpen(!isMathModalOpen)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-md-md
              text-xs font-medium transition-colors
              ${isMathModalOpen 
                ? 'bg-md-primary text-md-on-primary' 
                : 'bg-md-primary-container text-md-on-primary-container hover:opacity-90'
              }
              font-serif italic
            `}
          >
            $x$
          </motion.button>
        </TT>

        {isMathModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="
              absolute bottom-full left-0 mb-2 z-[60]
              w-64 p-3 bg-md-surface-container-high
              border border-md-outline-variant/40 rounded-md-xl shadow-md-4
            "
          >
            <p className="text-[11px] font-semibold text-md-on-surface-variant mb-2">Insert LaTeX Equation</p>
            <div className="flex flex-col gap-2">
              <input
                ref={mathInputRef}
                type="text"
                value={mathInput}
                onChange={(e) => setMathInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsertInlineMath()}
                placeholder="e.g. e^{i\pi} + 1 = 0"
                className="
                  w-full px-2 py-1.5 text-sm rounded-md-md
                  bg-md-surface-container-highest border border-md-outline-variant/30
                  text-md-on-surface focus:outline-none focus:ring-1 focus:ring-md-primary
                "
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsMathModalOpen(false)}
                  className="px-2 py-1 text-[10px] font-medium text-md-on-surface-variant hover:bg-md-surface-container-highest rounded-md-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsertInlineMath}
                  className="px-3 py-1 text-[10px] font-bold bg-md-primary text-md-on-primary rounded-md-sm shadow-md-1"
                >
                  Insert
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <TT content="Insert LaTeX Math Block ($$...$$)">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => editor.chain().focus().insertLatexBlock().run()}
          className="
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md-md
            text-xs font-medium
            bg-md-tertiary-container text-md-on-tertiary-container
            hover:opacity-90 transition-opacity
          "
        >
          <Sigma size={14} strokeWidth={2.5} />
          Math
        </motion.button>
      </TT>

      <TT content="Insert Diagram — draw shapes, lines & freehand with Excalidraw (canvas-style)">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => editor.chain().focus().insertExcalidrawBlock().run()}
          className="
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md-md
            text-xs font-medium
            bg-md-secondary-container text-md-on-secondary-container
            hover:opacity-90 transition-opacity
          "
        >
          <PencilRuler size={14} strokeWidth={2.5} />
          Diagram
        </motion.button>
      </TT>
    </div>
  );
}
