'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, FileText, LayoutTemplate, Settings,
  Search, BookMarked, PenLine, Eye, EyeOff, Terminal,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useEffect } from 'react';

/**
 * NavigationRail — M3 fixed left sidebar.
 *
 * Nav item actions:
 * - Home / Documents  → sets activeNavItem (shows editor)
 * - Templates         → sets activeNavItem to 'templates' (shows TemplatesView)
 * - Search            → opens the FindBar (Ctrl+F equivalent)
 * - Library           → toggles BibTeX sidebar
 * - Settings          → sets activeNavItem to 'settings' (shows SettingsView)
 */

const NAV_ITEMS = [
  { id: 'home',       icon: Home,           label: 'Home',      action: 'nav'     },
  { id: 'files',      icon: FileText,       label: 'Documents', action: 'nav'     },
  { id: 'templates',  icon: LayoutTemplate, label: 'Templates', action: 'nav'     },
  { id: 'search',     icon: Search,         label: 'Search',    action: 'findbar' },
  { id: 'library',    icon: BookMarked,     label: 'Library',   action: 'bib'     },
  { id: 'settings',   icon: Settings,       label: 'Settings',  action: 'nav'     },
] as const;

export function NavigationRail() {
  const {
    isZenMode, toggleZenMode,
    isVimMode, toggleVimMode,
    isBibSidebarOpen, toggleBibSidebar,
    openOmniBox, openFindBar,
    activeNavItem, setActiveNavItem,
  } = useUIStore();

  // Hidden in Zen Mode
  if (isZenMode) return null;

  // 1. Sync Zustand to Browser Back Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setActiveNavItem(event.state.view);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveNavItem]);

  const handleNavClick = (item: typeof NAV_ITEMS[number]) => {
    switch (item.action) {
      case 'nav':
        setActiveNavItem(item.id);
        window.history.pushState({ view: item.id }, '', `/#${item.id}`);
        break;
      case 'findbar':
        openFindBar();
        break;
      case 'bib':
        setActiveNavItem('home'); // ensure editor is visible
        window.history.pushState({ view: 'home' }, '', `/#home`);
        toggleBibSidebar();
        break;
    }
  };

  return (
    <nav
      className="
        fixed z-50 bg-md-surface-container border-md-outline-variant/30
        flex items-center
        /* Mobile: Bottom Bar */
        bottom-0 left-0 right-0 h-16 w-full flex-row px-4 border-t
        /* Desktop: Side Rail */
        md:top-0 md:bottom-0 md:left-0 md:w-20 md:h-full md:flex-col md:py-5 md:px-0 md:border-t-0 md:border-r
      "
      aria-label="Main navigation"
    >
      {/* ── FAB: Command Palette ── */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={openOmniBox}
        title="Open Command Palette (Ctrl+K)"
        aria-label="Open command palette"
        className="
          hidden md:flex items-center justify-center
          w-14 h-14 rounded-md-xl
          bg-md-primary-container text-md-on-primary-container
          shadow-md-2 mb-5
          transition-colors duration-200
        "
      >
        <PenLine size={22} strokeWidth={2} />
      </motion.button>

      {/* ── Navigation Items ── */}
      <div className="flex flex-row md:flex-col items-center justify-around md:justify-start gap-1 md:gap-0.5 flex-1 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNavItem === item.id;
          const Icon = item.icon;
          
          // Hide some items on mobile to save space
          const isMobileHidden = ['search', 'library'].includes(item.id);

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item)}
              aria-label={item.label}
              title={item.label}
              className={`
                relative flex flex-col items-center justify-center 
                w-14 md:w-16 py-1 gap-0.5 rounded-md-lg 
                transition-colors duration-200 group
                ${isMobileHidden ? 'hidden md:flex' : 'flex'}
              `}
            >
              <div className="relative flex items-center justify-center w-full h-8">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-1 md:inset-x-2 h-8 rounded-md-full bg-md-secondary-container"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive
                      ? 'text-md-on-secondary-container'
                      : 'text-md-on-surface-variant group-hover:text-md-on-surface'
                  }`}
                />
              </div>
              <span className={`text-[10px] md:text-[11px] leading-tight transition-colors duration-200 ${
                isActive
                  ? 'text-md-on-surface font-semibold'
                  : 'text-md-on-surface-variant font-medium'
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
        
        {/* Mobile-only Command Palette Trigger */}
        <button
          onClick={openOmniBox}
          className="flex md:hidden flex-col items-center justify-center w-14 py-1 gap-0.5"
        >
          <div className="w-8 h-8 flex items-center justify-center text-md-on-surface-variant">
            <PenLine size={20} strokeWidth={1.8} />
          </div>
          <span className="text-[10px] font-medium text-md-on-surface-variant">Menu</span>
        </button>
      </div>

      {/* ── Bottom Toggles ── */}
      <div className="hidden md:flex flex-col items-center gap-1.5 mt-2 pb-2">
        {/* Vim mode badge */}
        <AnimatePresence>
          {isVimMode && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center justify-center w-10 h-5 rounded-md-full bg-md-secondary text-md-on-secondary text-[9px] font-mono font-bold"
            >
              VIM
            </motion.div>
          )}
        </AnimatePresence>

        {/* BibTeX sidebar toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleBibSidebar}
          title={isBibSidebarOpen ? 'Close BibTeX Library' : 'Open BibTeX Library'}
          aria-pressed={isBibSidebarOpen}
          className={`
            flex items-center justify-center w-10 h-10 rounded-md-md
            transition-colors duration-200
            ${isBibSidebarOpen
              ? 'bg-md-tertiary-container text-md-on-tertiary-container'
              : 'text-md-on-surface-variant hover:bg-md-surface-container-high'
            }
          `}
        >
          <BookMarked size={18} strokeWidth={isBibSidebarOpen ? 2.5 : 1.8} />
        </motion.button>

        {/* Zen mode toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleZenMode}
          title="Toggle Zen Mode (Ctrl+Shift+Z)"
          aria-pressed={isZenMode}
          className="flex items-center justify-center w-10 h-10 rounded-md-md text-md-on-surface-variant hover:bg-md-surface-container-high transition-colors duration-200"
        >
          {isZenMode ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
        </motion.button>

        {/* Vim mode toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleVimMode}
          title="Toggle Vim Keybindings"
          aria-pressed={isVimMode}
          className={`
            flex items-center justify-center w-10 h-10 rounded-md-md
            transition-colors duration-200
            ${isVimMode
              ? 'bg-md-secondary-container text-md-on-secondary-container'
              : 'text-md-on-surface-variant hover:bg-md-surface-container-high'
            }
          `}
        >
          <Terminal size={18} strokeWidth={isVimMode ? 2.5 : 1.8} />
        </motion.button>
      </div>
    </nav>
  );
}
