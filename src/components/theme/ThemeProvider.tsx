'use client';

import { useEffect, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { argbFromHex, themeFromSourceColor, hexFromArgb } from '@material/material-color-utilities';
import { useUIStore, selectSeedColor, selectIsDarkMode } from '@/store/ui-store';

// ─── M3 Token map ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTokens(scheme: any, palettes: any, dark: boolean): [string, number][] {
  return [
    ['--md-sys-color-primary',                     scheme.primary],
    ['--md-sys-color-on-primary',                  scheme.onPrimary],
    ['--md-sys-color-primary-container',           scheme.primaryContainer],
    ['--md-sys-color-on-primary-container',        scheme.onPrimaryContainer],
    ['--md-sys-color-secondary',                   scheme.secondary],
    ['--md-sys-color-on-secondary',                scheme.onSecondary],
    ['--md-sys-color-secondary-container',         scheme.secondaryContainer],
    ['--md-sys-color-on-secondary-container',      scheme.onSecondaryContainer],
    ['--md-sys-color-tertiary',                    scheme.tertiary],
    ['--md-sys-color-on-tertiary',                 scheme.onTertiary],
    ['--md-sys-color-tertiary-container',          scheme.tertiaryContainer],
    ['--md-sys-color-on-tertiary-container',       scheme.onTertiaryContainer],
    ['--md-sys-color-error',                       scheme.error],
    ['--md-sys-color-on-error',                    scheme.onError],
    ['--md-sys-color-error-container',             scheme.errorContainer],
    ['--md-sys-color-on-error-container',          scheme.onErrorContainer],
    ['--md-sys-color-outline',                     scheme.outline],
    ['--md-sys-color-outline-variant',             scheme.outlineVariant],
    ['--md-sys-color-background',                  scheme.background],
    ['--md-sys-color-on-background',               scheme.onBackground],
    ['--md-sys-color-surface',                     scheme.surface],
    ['--md-sys-color-on-surface',                  scheme.onSurface],
    ['--md-sys-color-surface-variant',             scheme.surfaceVariant],
    ['--md-sys-color-on-surface-variant',          scheme.onSurfaceVariant],
    ['--md-sys-color-surface-container-lowest',    scheme.surfaceContainerLowest ?? palettes.neutral.tone(dark ? 4 : 100)],
    ['--md-sys-color-surface-container-low',       scheme.surfaceContainerLow ?? palettes.neutral.tone(dark ? 10 : 96)],
    ['--md-sys-color-surface-container',           scheme.surfaceContainer ?? palettes.neutral.tone(dark ? 12 : 94)],
    ['--md-sys-color-surface-container-high',      scheme.surfaceContainerHigh ?? palettes.neutral.tone(dark ? 17 : 92)],
    ['--md-sys-color-surface-container-highest',   scheme.surfaceContainerHighest ?? palettes.neutral.tone(dark ? 22 : 90)],
    ['--md-sys-color-inverse-surface',             scheme.inverseSurface],
    ['--md-sys-color-inverse-on-surface',          scheme.inverseOnSurface],
    ['--md-sys-color-inverse-primary',             scheme.inversePrimary],
  ];
}

function applyM3Theme(seedHex: string, dark: boolean): void {
  const theme = themeFromSourceColor(argbFromHex(seedHex));
  const scheme = dark ? theme.schemes.dark : theme.schemes.light;
  const root = document.documentElement;
  getTokens(scheme, theme.palettes, dark).forEach(([token, argb]) => {
    root.style.setProperty(token, hexFromArgb(argb));
  });
}

// ─── Inner component — reads theme from next-themes ───────────────
function M3ThemeApplier() {
  const seedColor = useUIStore(selectSeedColor);
  const isDarkMode = useUIStore(selectIsDarkMode);
  const { setTheme, resolvedTheme } = useTheme();

  // Sync our Zustand dark state → next-themes
  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, setTheme]);

  // Apply M3 palette whenever seed or resolved theme changes
  useEffect(() => {
    const dark = resolvedTheme === 'dark';
    applyM3Theme(seedColor, dark);
  }, [seedColor, resolvedTheme]);

  return null;
}

// ─── Provider Component ───────────────────────────────────────────
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <>
      <M3ThemeApplier />
      {children}
    </>
  );
}
