'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, RotateCcw, Save } from 'lucide-react';
import { useUIStore, selectActiveDocumentId, selectIsTimeMachineOpen } from '@/store/ui-store';
import { getMilestones, type Milestone } from '@/lib/time-machine';
import type { JSONContent } from '@tiptap/react';

export function TimeMachinePanel() {
  const { toggleTimeMachine } = useUIStore();
  const isTimeMachineOpen = useUIStore(selectIsTimeMachineOpen);
  const activeDocumentId = useUIStore(selectActiveDocumentId);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [originalAst, setOriginalAst] = useState<JSONContent | null>(null);
  
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (isTimeMachineOpen && activeDocumentId) {
      loadHistory();
      // Snapshot the current editor state to restore if cancelled
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editor = (window as any).__lemmaEditor;
      if (editor && !hasInitializedRef.current) {
        setOriginalAst(editor.getJSON());
        hasInitializedRef.current = true;
      }
    } else {
      hasInitializedRef.current = false;
    }
  }, [isTimeMachineOpen, activeDocumentId]);

  const loadHistory = async () => {
    const history = await getMilestones(activeDocumentId);
    setMilestones(history);
    // 0 is the newest, history.length - 1 is the oldest
    setCurrentIndex(0); 
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    setCurrentIndex(idx);
    
    // Scrub the editor live
    const m = milestones[idx];
    if (m) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editor = (window as any).__lemmaEditor;
      if (editor) {
        editor.commands.setContent(m.ast);
      }
    }
  };

  const handleRestore = () => {
    // The editor is already showing the scrubbed AST, we just close the panel
    // which commits it as the current state.
    // In a real app we might want to save a new milestone for "Restored from X".
    toggleTimeMachine();
  };

  const handleCancel = () => {
    // Restore original
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).__lemmaEditor;
    if (editor && originalAst) {
      editor.commands.setContent(originalAst);
    }
    toggleTimeMachine();
  };

  if (!isTimeMachineOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-[100]"
      >
        <div className="bg-md-surface-container-high border border-md-outline-variant/30 rounded-md-xl shadow-md-4 p-5 flex flex-col gap-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-md-on-surface">
              <History size={20} className="text-md-tertiary" />
              <h3 className="font-bold tracking-wide">Time Machine</h3>
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-md-md hover:bg-md-surface-container-highest text-md-on-surface-variant transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrub Area */}
          {milestones.length === 0 ? (
            <div className="py-4 text-center text-sm text-md-on-surface-variant">
              No milestones found for this document.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-md-on-surface-variant w-16 text-right">
                  Oldest
                </span>
                <input
                  type="range"
                  min="0"
                  max={milestones.length - 1}
                  step="1"
                  value={currentIndex}
                  onChange={handleSliderChange}
                  className="flex-1 accent-md-tertiary h-1.5 bg-md-surface-container-highest rounded-lg appearance-none cursor-pointer"
                  // Reversing visually so left is older, right is newer
                  style={{ direction: 'rtl' }} 
                />
                <span className="text-xs font-medium text-md-on-surface-variant w-16">
                  Newest
                </span>
              </div>

              {/* Milestone Details */}
              <div className="flex items-center justify-between bg-md-surface-container py-2 px-4 rounded-md-md border border-md-outline-variant/20">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-md-on-surface">
                    {milestones[currentIndex].label}
                  </span>
                  <span className="text-[10px] text-md-on-surface-variant font-mono">
                    {new Date(milestones[currentIndex].timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 rounded-md-md text-xs font-medium text-md-on-surface hover:bg-md-surface-container-highest transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestore}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md-md text-xs font-medium bg-md-primary text-md-on-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <RotateCcw size={14} />
                    Restore Version
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
