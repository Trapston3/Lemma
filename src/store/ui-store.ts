import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

// ─── Seed Color Presets ──────────────────────────────────────────
export const SEED_PRESETS = [
  { name: 'Pastel Blue',      hex: '#A0C4FF' },
  { name: 'Sage Green',       hex: '#A8D5A2' },
  { name: 'Warm Coral',       hex: '#FFADAD' },
  { name: 'Electric Violet',  hex: '#C77DFF' },
  { name: 'Midnight',         hex: '#4A4E69' },
] as const;

export type SeedPreset = typeof SEED_PRESETS[number]['name'];
export type DocumentFormat = 'A4' | '16:9';

// ─── State Shape ─────────────────────────────────────────────────
export interface UIState {
  // ── Mode toggles ──
  isZenMode:           boolean;
  isVimMode:           boolean;
  isTraditionalMode:   boolean;
  isDarkMode:          boolean;

  // ── Panel visibility ──
  isOmniBoxOpen:       boolean;
  isBibSidebarOpen:    boolean;
  isFindBarOpen:       boolean;
  isTimeMachineOpen:   boolean;

  // ── Document settings ──
  documentFormat:      DocumentFormat;

  // ── Theme ──
  seedColor:           string;

  // ── Navigation / Editor ──
  activeNavItem:       string;
  activeDocumentId:    string;
  documentTitle:       string;
  isSyncing:           boolean;

  // ── Actions ──
  toggleZenMode:          () => void;
  toggleVimMode:          () => void;
  toggleTraditionalMode:  () => void;
  toggleDarkMode:         () => void;
  openOmniBox:            () => void;
  closeOmniBox:           () => void;
  toggleOmniBox:          () => void;
  toggleBibSidebar:       () => void;
  openFindBar:            () => void;
  closeFindBar:           () => void;
  toggleFindBar:          () => void;
  toggleTimeMachine:      () => void;
  setDocumentFormat:      (format: DocumentFormat) => void;
  setSeedColor:           (hex: string) => void;
  setActiveNavItem:       (id: string) => void;
  setActiveDocumentId:    (id: string) => void;
  setDocumentTitle:       (title: string) => void;
  setIsSyncing:           (syncing: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────────
export const useUIStore = create<UIState>()(
  persist(
    subscribeWithSelector((set) => ({
    // ── Initial state ──
    isZenMode:           false,
    isVimMode:           false,
    isTraditionalMode:   false,
    isDarkMode:          false,
    isOmniBoxOpen:       false,
    isBibSidebarOpen:    false,
    isFindBarOpen:       false,
    isTimeMachineOpen:   false,
    documentFormat:      'A4',
    seedColor:           '#A0C4FF',
    activeNavItem:       'home',
    activeDocumentId:    'lemma-default',
    documentTitle:       'Untitled Document',
    isSyncing:           false,

    // ── Actions ──
    toggleZenMode:          () => set((s) => ({ isZenMode: !s.isZenMode })),
    toggleVimMode:          () => set((s) => ({ isVimMode: !s.isVimMode })),
    toggleTraditionalMode:  () => set((s) => ({ isTraditionalMode: !s.isTraditionalMode })),
    toggleDarkMode:         () => set((s) => ({ isDarkMode: !s.isDarkMode })),
    openOmniBox:            () => set({ isOmniBoxOpen: true }),
    closeOmniBox:           () => set({ isOmniBoxOpen: false }),
    toggleOmniBox:          () => set((s) => ({ isOmniBoxOpen: !s.isOmniBoxOpen })),
    toggleBibSidebar:       () => set((s) => ({ isBibSidebarOpen: !s.isBibSidebarOpen })),
    openFindBar:            () => set({ isFindBarOpen: true }),
    closeFindBar:           () => set({ isFindBarOpen: false }),
    toggleFindBar:          () => set((s) => ({ isFindBarOpen: !s.isFindBarOpen })),
    toggleTimeMachine:      () => set((s) => ({ isTimeMachineOpen: !s.isTimeMachineOpen })),
    setDocumentFormat:      (format) => set({ documentFormat: format }),
    setSeedColor:           (hex) => set({ seedColor: hex }),
    setActiveNavItem:       (id) => set({ activeNavItem: id }),
    setActiveDocumentId:    (id) => set({ activeDocumentId: id }),
    setDocumentTitle:       (title) => set({ documentTitle: title }),
    setIsSyncing:           (syncing) => set({ isSyncing: syncing }),
  })),
    {
      name: 'lemma-ui-store',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        seedColor: state.seedColor,
        documentFormat: state.documentFormat,
        activeDocumentId: state.activeDocumentId,
      }),
    }
  )
);

// ─── Selectors (memoized for perf) ───────────────────────────────
export const selectIsZenMode          = (s: UIState) => s.isZenMode;
export const selectIsVimMode          = (s: UIState) => s.isVimMode;
export const selectIsTraditionalMode  = (s: UIState) => s.isTraditionalMode;
export const selectIsDarkMode         = (s: UIState) => s.isDarkMode;
export const selectIsOmniBoxOpen      = (s: UIState) => s.isOmniBoxOpen;
export const selectIsBibSidebarOpen   = (s: UIState) => s.isBibSidebarOpen;
export const selectIsFindBarOpen      = (s: UIState) => s.isFindBarOpen;
export const selectDocumentFormat     = (s: UIState) => s.documentFormat;
export const selectSeedColor          = (s: UIState) => s.seedColor;
export const selectActiveNavItem      = (s: UIState) => s.activeNavItem;
export const selectActiveDocumentId   = (s: UIState) => s.activeDocumentId;
export const selectIsTimeMachineOpen  = (s: UIState) => s.isTimeMachineOpen;
