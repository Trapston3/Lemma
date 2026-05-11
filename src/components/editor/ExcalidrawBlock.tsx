'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilRuler, Maximize2, Minimize2, ImageIcon } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { createPortal } from 'react-dom';

// ─── Dynamic Excalidraw import (SSR-safe) ────────────────────────
const ExcalidrawWrapper = dynamic(() => import("./ExcalidrawWrapper"), {
  ssr: false,
});

// ─── Component ───────────────────────────────────────────────────
export function ExcalidrawBlock({ node, updateAttributes, selected }: NodeViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDarkMode = useUIStore((s) => s.isDarkMode);

  const rawElements = node.attrs.elements ?? '[]';
  const elements = JSON.parse(rawElements);

  const hasContent = elements.length > 0;

  // Local ref to prevent infinite render loops during rapid drawing
  const elementsRef = useRef<readonly unknown[]>(elements);

  const handleSaveAndCollapse = () => {
    // 1. Unmount the heavy Excalidraw component first
    setIsExpanded(false);

    // 2. Defer the Tiptap schema update to the next macro-task
    // This allows React to finish the unmount commit phase safely,
    // avoiding the tunnel-rat unmount collision crash.
    setTimeout(() => {
      updateAttributes({
        elements: JSON.stringify(elementsRef.current),
      });
    }, 0);
  };

  const handleEdit = () => {
    // Reset refs to match node attributes when opening
    elementsRef.current = elements;
    setIsExpanded(true);
  };

  if (isExpanded) {
    return (
      <NodeViewWrapper contentEditable={false}>
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50 my-4">
          Editing Diagram in Full Screen...
        </div>

        {typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-8">
            <div className="relative w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
              
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Edit Diagram</h2>
                <button 
                  onClick={handleSaveAndCollapse}
                  className="px-4 py-2 bg-md-primary text-white rounded-md font-medium hover:opacity-90"
                >
                  Save & Close
                </button>
              </div>

              <div className="flex-1 relative w-full h-full">
                <ExcalidrawWrapper
                  theme={isDarkMode ? "dark" : "light"}
                  viewModeEnabled={false}
                  zenModeEnabled={false}
                  initialData={{
                    elements: elementsRef.current,
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(elements: any) => {
                    elementsRef.current = elements;
                  }}
                />
              </div>

            </div>
          </div>,
          document.body
        )}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="my-4" contentEditable={false}>
      <motion.div
        layout
        className={`
          rounded-md-lg border-2 overflow-hidden transition-all duration-200
          ${selected || isExpanded
            ? 'border-md-tertiary shadow-md-2'
            : 'border-md-outline-variant/40 hover:border-md-outline'
          }
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-md-surface-container-high border-b border-md-outline-variant/30">
          <div className="flex items-center gap-2">
            <PencilRuler size={16} className="text-md-tertiary" strokeWidth={2.5} />
            <span className="text-xs font-semibold text-md-on-surface-variant tracking-wide uppercase">
              Excalidraw Diagram
            </span>
            {hasContent && (
              <span className="text-[10px] text-md-on-surface-variant/50">
                {elements.length} element{elements.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={isExpanded ? handleSaveAndCollapse : handleEdit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md-md bg-md-tertiary-container text-md-on-tertiary-container text-xs font-medium hover:opacity-90 transition-opacity"
          >
            {isExpanded ? (
              <><Minimize2 size={12} />Save & Collapse</>
            ) : (
              <><Maximize2 size={12} />Edit</>
            )}
          </button>
        </div>

        {/* ── Preview ── */}
        <div className="bg-md-surface-container-low p-6 min-h-[120px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-md-on-surface-variant/50">
            <ImageIcon size={32} strokeWidth={1.5} />
            <p className="text-sm">
              {hasContent ? 'Diagram stored. Click Edit to interact.' : 'Click Edit to start drawing'}
            </p>
          </div>
        </div>
      </motion.div>
    </NodeViewWrapper>
  );
}
