'use client';

import dynamic from 'next/dynamic';
import { useUIStore, selectActiveNavItem } from '@/store/ui-store';
import { NavigationRail } from '@/components/layout/NavigationRail';
import { EditorCanvas } from '@/components/layout/EditorCanvas';
import { BibTeXSidebar } from '@/components/layout/BibTeXSidebar';
import { FindBar } from '@/components/layout/FindBar';
import { TemplatesView } from '@/components/views/TemplatesView';
import { DocumentsView } from '@/components/views/DocumentsView';
import { SettingsView } from '@/components/views/SettingsView';
import { TimeMachinePanel } from '@/components/layout/TimeMachinePanel';
import { useState } from 'react';

// Dynamic import for editor — prevents SSR hydration mismatch
const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor').then((m) => ({ default: m.TiptapEditor })),
  { ssr: false }
);

// ─── Main Page ───────────────────────────────────────────────────
export default function Home() {
  const activeNavItem = useUIStore(selectActiveNavItem);
  const [rawSource, setRawSource] = useState('// Raw Typst source appears here…');

  const showEditor    = activeNavItem === 'home';
  const showFiles     = activeNavItem === 'files';
  const showTemplates = activeNavItem === 'templates';
  const showSettings  = activeNavItem === 'settings';

  return (
    <div className="flex min-h-screen bg-md-surface-container-low">
      {/* Fixed left navigation rail */}
      <NavigationRail />

      {/* Global find bar */}
      <FindBar />
      
      {/* Time Machine Slide-up */}
      <TimeMachinePanel />

      {/* Conditionally render main view */}
      {showFiles ? (
        <DocumentsView />
      ) : showTemplates ? (
        <TemplatesView />
      ) : showSettings ? (
        <SettingsView />
      ) : (
        <>
          {/* Central editor canvas */}
          <EditorCanvas rawSource={rawSource} onRawSourceChange={setRawSource}>
            <TiptapEditor />
          </EditorCanvas>

          {/* Right sidebar — animates in/out via Zustand */}
          <BibTeXSidebar />
        </>
      )}
    </div>
  );
}
