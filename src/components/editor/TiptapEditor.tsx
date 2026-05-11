'use client';

import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import UnderlineExt from '@tiptap/extension-underline';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import localforage from 'localforage';

import { LaTeXBlockExtension } from '@/extensions/latex-block';
import { ExcalidrawBlockExtension } from '@/extensions/excalidraw-block';
import { InlineMath } from '@/extensions/inline-math';
import { SlashCommands, getSlashCommandItems } from '@/extensions/slash-commands';
import { VimModeExtension } from '@/extensions/vim-mode';
import { SlashCommandMenu, type SlashCommandMenuRef } from '@/components/editor/SlashCommandMenu';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { getYjsProvider } from '@/lib/yjs-provider';
import { useUIStore, selectIsVimMode, selectActiveDocumentId } from '@/store/ui-store';
import { saveMilestone } from '@/lib/time-machine';

/**
 * TiptapEditor — Full-featured CRDT editor component.
 */
export function TiptapEditor() {
  const isVimMode = useUIStore(selectIsVimMode);
  const activeDocumentId = useUIStore(selectActiveDocumentId);
  
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const editorExposedRef = useRef(false);

  // ── Initialize Yjs provider on mount & document change ────────────
  useEffect(() => {
    let cancelled = false;
    setIsMounted(false);
    setYdoc(null);

    getYjsProvider(activeDocumentId).then(({ ydoc: doc }) => {
      if (!cancelled) {
        setYdoc(doc);
        setIsMounted(true);
      }
    });

    return () => { cancelled = true; };
  }, [activeDocumentId]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({
          placeholder: 'Start writing, or press / for commands…',
        }),

        // ── Word-style formatting extensions ────────────────────────
        TextStyle,
        FontFamily,
        Color,
        Highlight.configure({ multicolor: true }),
        UnderlineExt,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),

        // ── CRDT ──────────────────────────────────────────────────
        ...(ydoc
          ? [
              Collaboration.configure({
                document: ydoc,
                field: 'content',
              }),
            ]
          : []),

        // ── Custom Node Extensions ─────────────────────────────────
        LaTeXBlockExtension,
        ExcalidrawBlockExtension,
        InlineMath,

        // ── Slash Commands ─────────────────────────────────────────
        SlashCommands.configure({
          suggestion: {
            items: ({ query }: { query: string }) =>
              getSlashCommandItems().filter((item) =>
                item.title.toLowerCase().includes(query.toLowerCase())
              ),
            render: () => {
              let component: ReactRenderer<SlashCommandMenuRef> | null = null;
              let popup: TippyInstance[] | null = null;

              return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onStart: (props: Record<string, any>) => {
                  component = new ReactRenderer(SlashCommandMenu, {
                    props,
                    editor: props.editor,
                  });
                  if (!props.clientRect) return;
                  popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                    offset: [0, 8],
                    animation: false,
                    popperOptions: {
                      modifiers: [
                        { name: 'flip', options: { fallbackPlacements: ['top-start'] } },
                      ],
                    },
                  });
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onUpdate: (props: Record<string, any>) => {
                  component?.updateProps(props);
                  if (popup?.[0] && props.clientRect) {
                    popup[0].setProps({ getReferenceClientRect: props.clientRect });
                  }
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onKeyDown: (props: Record<string, any>) => {
                  if (props.event.key === 'Escape') {
                    popup?.[0]?.hide();
                    return true;
                  }
                  return component?.ref?.onKeyDown({ event: props.event }) ?? false;
                },
                onExit: () => {
                  popup?.[0]?.destroy();
                  component?.destroy();
                },
              };
            },
          },
        }),

        // ── Vim Mode (conditional) ─────────────────────────────────
        ...(isVimMode ? [VimModeExtension] : []),
      ],
      editorProps: {
        attributes: {
          class: 'tiptap focus:outline-none',
          'data-vim-mode': isVimMode ? 'true' : 'false',
        },
      },
      immediatelyRender: false,
      onUpdate: async ({ editor }) => {
        // 1. Extract plain text
        const text = editor.getText();
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        const title = lines.length > 0 ? lines[0].substring(0, 40) : "Untitled Document";
        const snippet = lines.length > 1 ? lines.slice(1).join(' ').substring(0, 100) + '...' : "No content yet...";

        // 2. Update LocalForage Metadata
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const docs: any[] = (await localforage.getItem('lemma-documents')) || [];
          const updatedDocs = docs.map(doc => 
            doc.id === activeDocumentId 
              ? { ...doc, title, snippet, lastEdited: Date.now() } 
              : doc
          );
          await localforage.setItem('lemma-documents', updatedDocs);
        } catch (error) {
          console.error("Failed to update document metadata:", error);
        }
      }
    },
    [ydoc, isVimMode, activeDocumentId]
  );

  // ── Expose editor to global for OmniBox ───────────────────────
  useEffect(() => {
    if (editor && !editorExposedRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__lemmaEditor = editor;
      editorExposedRef.current = true;
    }
    return () => {
      if (editorExposedRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__lemmaEditor;
        editorExposedRef.current = false;
      }
    };
  }, [editor]);

  // ── Auto-Save Milestones (Every 5 mins) ───────────────────────
  useEffect(() => {
    if (!editor || !activeDocumentId) return;
    
    const interval = setInterval(async () => {
      const ast = editor.getJSON();
      const text = editor.getText();
      // Only save milestone if there is actual content
      if (text.trim().length > 0) {
        await saveMilestone(activeDocumentId, ast, 'Auto-save');
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [editor, activeDocumentId]);

  // ── Loading state ─────────────────────────────────────────────
  if (!isMounted || !editor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-6 h-6 border-2 border-md-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-md-on-surface-variant">
          {!isMounted ? 'Initializing local database…' : 'Loading editor…'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      {/* ── MS Word-style toolbar ── */}
      <EditorToolbar editor={editor} />

      {/* ── Vim Mode badge ── */}
      {isVimMode && (
        <div className="absolute top-14 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md-full bg-md-secondary-container text-md-on-secondary-container text-xs font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-md-secondary animate-pulse" />
          VIM
        </div>
      )}

      {/* ── Editor content area ── */}
      <div className="px-2 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
