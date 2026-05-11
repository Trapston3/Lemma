'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, AlertTriangle } from 'lucide-react';

/**
 * LaTeXBlock — React Node View Component
 *
 * Renders as an M3 Card with two states:
 * - **Editing**: Shows a textarea for raw LaTeX input
 * - **Preview**: Renders the equation via KaTeX
 *
 * State transitions:
 * - Click on preview → switch to editing (focus textarea)
 * - Blur textarea → switch to preview (render KaTeX)
 * - Empty content shows a placeholder prompt
 */
export function LaTeXBlock({ node, updateAttributes, selected }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false); // Default to preview mode
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const latex: string = node.attrs.latex || '';

  // Render KaTeX when in preview mode
  useEffect(() => {
    if (!isEditing && previewRef.current && latex) {
      try {
        katex.render(latex, previewRef.current, {
          displayMode: true,
          throwOnError: true,
          strict: false,
          trust: true,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid LaTeX');
      }
    }
  }, [isEditing, latex]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleBlur = useCallback(() => {
    // Only switch to preview if there's content
    if (latex.trim()) {
      setIsEditing(false);
    }
  }, [latex]);

  const handleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
    }
  }, [isEditing]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateAttributes({ latex: e.target.value });
    },
    [updateAttributes]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Escape exits editing
      if (e.key === 'Escape') {
        e.preventDefault();
        if (latex.trim()) {
          setIsEditing(false);
        }
      }
    },
    [latex]
  );

  return (
    <NodeViewWrapper
      className="my-4"
      data-type="latex-block"
      contentEditable={false}
    >
      <motion.div
        layout
        onClick={handleClick}
        className={`
          relative
          rounded-md-lg
          border-2 transition-all duration-200
          cursor-pointer
          overflow-hidden
          ${
            selected || isEditing
              ? 'border-md-primary shadow-md-2'
              : 'border-md-outline-variant/40 hover:border-md-outline'
          }
        `}
      >
        {/* ── Header Badge ── */}
        <div
          className="
            flex items-center gap-2
            px-4 py-2
            bg-md-surface-container-high
            border-b border-md-outline-variant/30
          "
        >
          <Sigma
            size={16}
            className="text-md-primary"
            strokeWidth={2.5}
          />
          <span className="text-xs font-semibold text-md-on-surface-variant tracking-wide uppercase">
            LaTeX Block
          </span>
        </div>

        {/* ── Content Area ── */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="bg-md-surface-container p-4"
            >
              <textarea
                ref={textareaRef}
                value={latex}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Enter LaTeX… e.g. E = mc^2"
                spellCheck={false}
                className="
                  w-full min-h-[80px]
                  bg-md-surface-container-low
                  text-md-on-surface
                  border border-md-outline-variant/40
                  rounded-md-md
                  px-4 py-3
                  font-mono text-sm leading-relaxed
                  resize-y
                  outline-none
                  focus:border-md-primary
                  focus:ring-2 focus:ring-md-primary/20
                  transition-all duration-200
                  placeholder:text-md-on-surface-variant/40
                "
              />
              <p className="text-[11px] text-md-on-surface-variant/60 mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-md-surface-container-highest rounded text-[10px] font-semibold">Esc</kbd> or click outside to render
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="bg-md-surface-container-low p-6"
            >
              {error ? (
                <div className="flex items-start gap-3 p-3 bg-md-error-container rounded-md-md">
                  <AlertTriangle
                    size={16}
                    className="text-md-on-error-container mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-md-on-error-container">
                      Parse Error
                    </p>
                    <p className="text-xs text-md-on-error-container/70 mt-1 font-mono">
                      {error}
                    </p>
                  </div>
                </div>
              ) : latex ? (
                <div
                  ref={previewRef}
                  className="flex justify-center overflow-x-auto text-md-on-surface"
                />
              ) : (
                <p className="text-center text-md-on-surface-variant/50 text-sm italic">
                  Empty equation — click to edit
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </NodeViewWrapper>
  );
}
