import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ExcalidrawBlock as ExcalidrawBlockComponent } from '@/components/editor/ExcalidrawBlock';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    excalidrawBlock: {
      /**
       * Insert an Excalidraw diagram block at the current position.
       */
      insertExcalidrawBlock: (attrs?: { elements?: string; appState?: string }) => ReturnType;
    };
  }
}

/**
 * ExcalidrawBlock — Tiptap Node Extension
 *
 * An atomic block node that embeds an Excalidraw whiteboard.
 * Elements and appState are stored as JSON strings in node attributes.
 *
 * Key design decisions:
 * - `atom: true` — ProseMirror treats this as a single uneditable unit
 * - `draggable: true` — block can be reordered via drag handles
 * - Elements stored as JSON strings to keep ProseMirror schema simple
 */
export const ExcalidrawBlockExtension = Node.create({
  name: 'excalidrawBlock',

  group: 'block',

  atom: true,

  isolating: true,

  draggable: true,

  addAttributes() {
    return {
      elements: {
        default: '[]',
        parseHTML: (el) => el.getAttribute('data-elements') || '[]',
        renderHTML: (attrs) => ({ 'data-elements': attrs.elements }),
      },
      appState: {
        default: '{}',
        parseHTML: (el) => el.getAttribute('data-app-state') || '{}',
        renderHTML: (attrs) => ({ 'data-app-state': attrs.appState }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="excalidraw-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'excalidraw-block' })];
  },

  addCommands() {
    return {
      insertExcalidrawBlock:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                elements: attrs?.elements ?? '[]',
                appState: attrs?.appState ?? '{}',
              },
            })
            .run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawBlockComponent);
  },
});
