import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { type Editor, type Range } from '@tiptap/core';

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SlashCommandItem;
        }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions<SlashCommandItem>>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

/**
 * All slash command items.
 * Phase 1: Math Block
 * Phase 2: Diagram (Excalidraw), Heading, Bullet List, Code Block
 */
export function getSlashCommandItems(): SlashCommandItem[] {
  return [
    {
      title: 'Math Block',
      description: 'Insert a LaTeX equation (KaTeX)',
      icon: 'sigma',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertLatexBlock().run();
      },
    },
    {
      title: 'Diagram',
      description: 'Insert an Excalidraw whiteboard',
      icon: 'pencil-ruler',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertExcalidrawBlock().run();
      },
    },
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: 'heading-1',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium subsection heading',
      icon: 'heading-2',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create an unordered list',
      icon: 'list',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Code Block',
      description: 'Insert a syntax-highlighted code block',
      icon: 'code',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
  ];
}
