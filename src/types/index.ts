/**
 * Lemma — Shared TypeScript Types
 *
 * Central type definitions used across the application.
 * Phase 1 types are minimal; this file will grow as
 * features like collaboration, templates, and history are added.
 */

// ─── Theme ───────────────────────────────────────────────────────

/** A Material You color scheme as CSS variable name → hex value pairs. */
export type M3ColorScheme = Record<string, string>;

/** User-configurable theme preferences. */
export interface ThemePreferences {
  seedColor: string;
  mode: 'system' | 'light' | 'dark';
  contrastLevel: number;
}

// ─── Editor ──────────────────────────────────────────────────────

/** Metadata for a document block. */
export interface BlockMeta {
  id: string;
  type: string;
  createdAt: number;
  updatedAt: number;
}

/** LaTeX block attributes stored in the Tiptap node. */
export interface LaTeXBlockAttrs {
  latex: string;
}

// ─── Navigation ──────────────────────────────────────────────────

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}
