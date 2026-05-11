import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { LaTeXBlock as LaTeXBlockComponent } from '@/components/editor/LaTeXBlock';

/**
 * LaTeX Block — Custom Tiptap Node Extension
 *
 * An atomic block node that stores a LaTeX string and renders it
 * via KaTeX. Uses a React NodeView for the editing/preview UI.
 *
 * Key design decisions:
 * - `atom: true` prevents ProseMirror from managing internal cursor
 * - `isolating: true` prevents backspace from merging with neighbors
 * - `draggable: true` prepares for future drag-and-drop block reordering
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    latexBlock: {
      /**
       * Insert a LaTeX block at the current position.
       */
      insertLatexBlock: (attrs?: { latex?: string }) => ReturnType;
    };
  }
}

export const LaTeXBlockExtension = Node.create({
  name: 'latexBlock',

  group: 'block',

  atom: true,

  isolating: true,

  draggable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="latex-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'latex-block' }),
    ];
  },

  addCommands() {
    return {
      insertLatexBlock:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                latex: attrs?.latex || '',
              },
            })
            .run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(LaTeXBlockComponent);
  },
});
