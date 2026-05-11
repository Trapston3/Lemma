import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeExpressive,
  MaterialDynamicColors,
  DynamicScheme,
} from '@material/material-color-utilities';

// ─── Default Seed ────────────────────────────────────────────────
export const DEFAULT_SEED_HEX = '#A0C4FF';

// ─── M3 Color Token Mapping ─────────────────────────────────────
// Maps CSS custom property names to MaterialDynamicColors accessors.
// Every key here becomes `--md-sys-color-<key>` on :root.

const COLOR_ROLES: { token: string; accessor: (s: DynamicScheme) => number }[] = [
  // Primary
  { token: 'primary',               accessor: (s) => MaterialDynamicColors.primary.getArgb(s) },
  { token: 'on-primary',            accessor: (s) => MaterialDynamicColors.onPrimary.getArgb(s) },
  { token: 'primary-container',     accessor: (s) => MaterialDynamicColors.primaryContainer.getArgb(s) },
  { token: 'on-primary-container',  accessor: (s) => MaterialDynamicColors.onPrimaryContainer.getArgb(s) },

  // Secondary
  { token: 'secondary',             accessor: (s) => MaterialDynamicColors.secondary.getArgb(s) },
  { token: 'on-secondary',          accessor: (s) => MaterialDynamicColors.onSecondary.getArgb(s) },
  { token: 'secondary-container',   accessor: (s) => MaterialDynamicColors.secondaryContainer.getArgb(s) },
  { token: 'on-secondary-container',accessor: (s) => MaterialDynamicColors.onSecondaryContainer.getArgb(s) },

  // Tertiary
  { token: 'tertiary',              accessor: (s) => MaterialDynamicColors.tertiary.getArgb(s) },
  { token: 'on-tertiary',           accessor: (s) => MaterialDynamicColors.onTertiary.getArgb(s) },
  { token: 'tertiary-container',    accessor: (s) => MaterialDynamicColors.tertiaryContainer.getArgb(s) },
  { token: 'on-tertiary-container', accessor: (s) => MaterialDynamicColors.onTertiaryContainer.getArgb(s) },

  // Error
  { token: 'error',                 accessor: (s) => MaterialDynamicColors.error.getArgb(s) },
  { token: 'on-error',              accessor: (s) => MaterialDynamicColors.onError.getArgb(s) },
  { token: 'error-container',       accessor: (s) => MaterialDynamicColors.errorContainer.getArgb(s) },
  { token: 'on-error-container',    accessor: (s) => MaterialDynamicColors.onErrorContainer.getArgb(s) },

  // Surface
  { token: 'surface',               accessor: (s) => MaterialDynamicColors.surface.getArgb(s) },
  { token: 'on-surface',            accessor: (s) => MaterialDynamicColors.onSurface.getArgb(s) },
  { token: 'surface-variant',       accessor: (s) => MaterialDynamicColors.surfaceVariant.getArgb(s) },
  { token: 'on-surface-variant',    accessor: (s) => MaterialDynamicColors.onSurfaceVariant.getArgb(s) },

  // Surface Containers
  { token: 'surface-dim',                accessor: (s) => MaterialDynamicColors.surfaceDim.getArgb(s) },
  { token: 'surface-bright',             accessor: (s) => MaterialDynamicColors.surfaceBright.getArgb(s) },
  { token: 'surface-container-lowest',   accessor: (s) => MaterialDynamicColors.surfaceContainerLowest.getArgb(s) },
  { token: 'surface-container-low',      accessor: (s) => MaterialDynamicColors.surfaceContainerLow.getArgb(s) },
  { token: 'surface-container',          accessor: (s) => MaterialDynamicColors.surfaceContainer.getArgb(s) },
  { token: 'surface-container-high',     accessor: (s) => MaterialDynamicColors.surfaceContainerHigh.getArgb(s) },
  { token: 'surface-container-highest',  accessor: (s) => MaterialDynamicColors.surfaceContainerHighest.getArgb(s) },

  // Outline
  { token: 'outline',               accessor: (s) => MaterialDynamicColors.outline.getArgb(s) },
  { token: 'outline-variant',       accessor: (s) => MaterialDynamicColors.outlineVariant.getArgb(s) },

  // Inverse
  { token: 'inverse-surface',       accessor: (s) => MaterialDynamicColors.inverseSurface.getArgb(s) },
  { token: 'inverse-on-surface',    accessor: (s) => MaterialDynamicColors.inverseOnSurface.getArgb(s) },
  { token: 'inverse-primary',       accessor: (s) => MaterialDynamicColors.inversePrimary.getArgb(s) },
];

// ─── Core API ────────────────────────────────────────────────────

/**
 * Generates a full M3 Expressive color scheme from a hex seed color.
 * Returns a Record<string, string> mapping CSS variable names to hex values.
 */
export function generateScheme(
  seedHex: string,
  isDark: boolean,
  contrastLevel = 0.0
): Record<string, string> {
  const sourceArgb = argbFromHex(seedHex);
  const sourceHct = Hct.fromInt(sourceArgb);
  const scheme = new SchemeExpressive(sourceHct, isDark, contrastLevel);

  const variables: Record<string, string> = {};

  for (const { token, accessor } of COLOR_ROLES) {
    const argb = accessor(scheme);
    variables[`--md-sys-color-${token}`] = hexFromArgb(argb);
  }

  return variables;
}

/**
 * Applies a generated scheme to the document root as CSS custom properties.
 */
export function applySchemeToRoot(variables: Record<string, string>): void {
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(variables)) {
    root.style.setProperty(prop, value);
  }
}

/**
 * Detects the system's current color scheme preference.
 */
export function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Subscribes to system color scheme changes.
 * Returns an unsubscribe function.
 */
export function onSystemSchemeChange(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * One-shot: generates + applies the M3 Expressive scheme from a seed color.
 * Automatically detects system dark/light mode.
 */
export function initializeTheme(seedHex: string = DEFAULT_SEED_HEX): void {
  const isDark = getSystemIsDark();
  const variables = generateScheme(seedHex, isDark);
  applySchemeToRoot(variables);
}
