import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import './globals.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { OmniBox } from '@/components/omnibox/OmniBox';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lemma — Zero-friction LaTeX editor',
  description: 'A local-first, block-based editor for LaTeX and Markdown with Material You theming, Yjs collaboration, and Typst PDF export.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-md-surface-container-low text-md-on-surface`}>
        {/* next-themes manages the .dark class on <html> for Tailwind darkMode: 'class' */}
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Our M3 ThemeProvider reads next-themes resolvedTheme and applies CSS vars */}
          <ThemeProvider>
            {/* OmniBox is a global overlay — present in DOM always */}
            <OmniBox />
            {children}
          </ThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
