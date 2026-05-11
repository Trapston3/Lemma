import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import InlineMathNode from '@/components/editor/InlineMathNode';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      setInlineMath: (latex: string) => ReturnType;
    };
  }
}

// Regex to match $equation$ 
const inlineMathInputRegex = /(?:^|\s)\$([^$]+)\$$/;

export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-type="inline-math"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathNode);
  },

  addInputRules() {
    return [
      new InputRule({
        find: inlineMathInputRegex,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;
          const latex = match[1];

          if (latex) {
            tr.replaceWith(start, end, this.type.create({ latex }));
          }
        },
      }),
    ];
  },

  addCommands() {
    return {
      setInlineMath: (latex) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { latex },
        });
      },
    };
  },
});
