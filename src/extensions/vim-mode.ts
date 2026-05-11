import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

/**
 * VimModeExtension — Custom Vim keybinding layer for Tiptap.
 *
 * Uses ONLY single-modifier + single-key combinations that ProseMirror
 * can actually parse. Multi-key sequences like "Alt-g Alt-g" and "Alt-d Alt-d"
 * are ILLEGAL in ProseMirror's keymap parser and will crash the runtime
 * with "Unrecognized modifier name".
 *
 * All bindings use Ctrl-Shift as the modifier prefix to avoid colliding
 * with normal typing and standard browser shortcuts.
 */
export const VimModeExtension = Extension.create({
  name: 'vimMode',

  addKeyboardShortcuts() {
    const editor: Editor = this.editor;

    return {
      // ─── Movement (hjkl) ────────────────────────────────────────
      'Alt-h': () => {
        editor.commands.setTextSelection(
          Math.max(0, editor.state.selection.anchor - 1)
        );
        return true;
      },
      'Alt-l': () => {
        editor.commands.setTextSelection(
          Math.min(editor.state.doc.content.size, editor.state.selection.anchor + 1)
        );
        return true;
      },
      'Alt-j': () => {
        const { $anchor } = editor.state.selection;
        const docEnd = editor.state.doc.content.size;
        try {
          const nextBlockStart = $anchor.after();
          if (nextBlockStart <= docEnd) {
            editor.commands.setTextSelection(nextBlockStart);
          }
        } catch {
          // $anchor.after() throws if at doc root — just ignore
        }
        return true;
      },
      'Alt-k': () => {
        const { $anchor } = editor.state.selection;
        try {
          const prevBlockEnd = $anchor.before();
          if (prevBlockEnd > 0) {
            editor.commands.setTextSelection(prevBlockEnd - 1);
          }
        } catch {
          // $anchor.before() throws if at doc root — just ignore
        }
        return true;
      },

      // ─── Word movement ──────────────────────────────────────────
      'Alt-w': () => {
        const { doc } = editor.state;
        const docSize = doc.content.size;
        let pos = editor.state.selection.anchor;
        // Skip word characters
        while (pos < docSize && !/\s/.test(doc.textBetween(pos, pos + 1))) pos++;
        // Skip whitespace
        while (pos < docSize && /\s/.test(doc.textBetween(pos, pos + 1))) pos++;
        editor.commands.setTextSelection(pos);
        return true;
      },
      'Alt-b': () => {
        const { doc } = editor.state;
        let pos = editor.state.selection.anchor;
        if (pos <= 0) return true;
        pos--;
        while (pos > 0 && /\s/.test(doc.textBetween(pos - 1, pos))) pos--;
        while (pos > 0 && !/\s/.test(doc.textBetween(pos - 1, pos))) pos--;
        editor.commands.setTextSelection(pos);
        return true;
      },

      // ─── Line boundaries ────────────────────────────────────────
      'Alt-0': () => {
        const { $anchor } = editor.state.selection;
        editor.commands.setTextSelection($anchor.start());
        return true;
      },
      'Alt-4': () => {
        const { $anchor } = editor.state.selection;
        editor.commands.setTextSelection($anchor.end());
        return true;
      },

      // ─── Document boundaries (single-key, no sequence) ──────────
      'Ctrl-Shift-Home': () => {
        editor.commands.setTextSelection(0);
        return true;
      },
      'Ctrl-Shift-End': () => {
        editor.commands.setTextSelection(editor.state.doc.content.size);
        return true;
      },

      // ─── Undo / Redo ────────────────────────────────────────────
      'Alt-u': () => {
        editor.commands.undo();
        return true;
      },
      'Alt-r': () => {
        editor.commands.redo();
        return true;
      },

      // ─── Delete current block (single binding replaces "dd") ────
      'Ctrl-Shift-d': () => {
        const { $anchor } = editor.state.selection;
        try {
          const start = $anchor.before();
          const end = $anchor.after();
          editor.chain().setTextSelection({ from: start, to: end }).deleteSelection().run();
        } catch {
          // Ignore if at doc root
        }
        return true;
      },

      // ─── Duplicate block (single binding replaces "yy+p") ───────
      'Ctrl-Shift-y': () => {
        const { $anchor } = editor.state.selection;
        try {
          const blockStart = $anchor.before();
          const blockEnd = $anchor.after();
          const nodeJSON = editor.state.doc.cut(blockStart, blockEnd).toJSON();
          if (nodeJSON?.content?.[0]) {
            editor.chain().setTextSelection(blockEnd).insertContent(nodeJSON.content[0]).run();
          }
        } catch {
          // Ignore if at doc root
        }
        return true;
      },

      // ─── Escape: blur editor ────────────────────────────────────
      'Escape': () => {
        editor.commands.blur();
        return false; // Don't consume — let browser handle too
      },
    };
  },
});
