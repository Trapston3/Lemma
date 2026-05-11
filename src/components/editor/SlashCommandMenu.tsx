'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sigma,
  PencilRuler,
  Heading1,
  Heading2,
  List,
  Code,
  type LucideIcon,
} from 'lucide-react';
import type { SlashCommandItem } from '@/extensions/slash-commands';

// ─── Icon Map ────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  'sigma':        Sigma,
  'pencil-ruler': PencilRuler,
  'heading-1':    Heading1,
  'heading-2':    Heading2,
  'list':         List,
  'code':         Code,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sigma;
}

// ─── Types ───────────────────────────────────────────────────────
interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

// ─── Component ───────────────────────────────────────────────────
export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [items, command]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((p) => (p <= 0 ? items.length - 1 : p - 1));
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((p) => (p >= items.length - 1 ? 0 : p + 1));
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="
            z-[100] w-72 overflow-hidden
            rounded-md-lg border border-md-outline-variant/40
            bg-md-surface-container-high shadow-md-3 py-1.5
          "
        >
          <div className="px-3 py-1.5 mb-0.5">
            <p className="text-[10px] font-semibold text-md-on-surface-variant/60 uppercase tracking-widest">
              Insert Block
            </p>
          </div>

          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            const Icon = getIcon(item.icon);

            return (
              <button
                key={item.title}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  flex items-center gap-3 w-full px-3 py-2 text-left
                  transition-colors duration-100
                  ${isSelected
                    ? 'bg-md-primary-container/60'
                    : 'hover:bg-md-surface-container-highest'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-md-md shrink-0
                  transition-colors duration-100
                  ${isSelected
                    ? 'bg-md-primary text-md-on-primary'
                    : 'bg-md-surface-container text-md-on-surface-variant'
                  }
                `}>
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface'}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-md-on-surface-variant/70 truncate">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
  }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
