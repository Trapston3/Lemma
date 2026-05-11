import type { JSONContent } from '@tiptap/react';

// ─── ProseMirror Node → Typst Source ─────────────────────────────



/**
 * Recursively converts inline content (text + marks) to Typst string.
 */
function inlineToTypst(nodes: JSONContent[] = []): string {
  return nodes.map((node) => {
    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasBold = node.marks.some((m: any) => m.type === "bold");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasItalic = node.marks.some((m: any) => m.type === "italic");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasCode = node.marks.some((m: any) => m.type === "code");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasStrike = node.marks.some((m: any) => m.type === "strike");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasUnderline = node.marks.some((m: any) => m.type === "underline");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const colorMark = node.marks.find((m: any) => m.type === "textStyle" && m.attrs?.color);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const highlightMark = node.marks.find((m: any) => m.type === "highlight");

        if (hasBold) text = `*${text}*`;
        if (hasItalic) text = `_${text}_`;
        if (hasCode) text = `\`${text}\``;
        if (hasStrike) text = `#strike[${text}]`;
        if (hasUnderline) text = `#underline[${text}]`;
        if (colorMark) text = `#text(fill: rgb("${colorMark.attrs.color}"))[${text}]`;
        if (highlightMark) text = `#highlight(fill: rgb("${highlightMark.attrs?.color || "#ffff00"}"))[${text}]`;
      }
      return text;
    }
    if (node.type === 'hardBreak') return '\\\n';
    return '';
  }).join('');
}

/**
 * Converts a list (bullet or ordered) recursively.
 */
async function listToTypst(node: JSONContent, ordered: boolean): Promise<string> {
  const items = await Promise.all((node.content ?? []).map(async (item) => {
    const content = (await Promise.all((item.content ?? []).map(nodeToTypst))).join('\n');
    return `${ordered ? '+' : '-'} ${content.trim()}`;
  }));
  return items.join('\n');
}

/**
 * Converts a single ProseMirror node to Typst syntax.
 */
async function nodeToTypst(node: JSONContent): Promise<string> {
  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level ?? 1;
      const marker = '='.repeat(level);
      const text = inlineToTypst(node.content);
      return `\n${marker} ${text}\n`;
    }

    case 'paragraph': {
      const text = inlineToTypst(node.content);
      return text ? `\n${text}\n` : '\n';
    }

    case 'latexBlock': {
      const latex = node.attrs?.latex ?? '';
      if (!latex.trim()) return '';
      // Typst display math uses $ ... $ on its own line
      return `\n$ ${latex} $\n`;
    }

    case 'excalidrawBlock': {
      try {
        const elements = JSON.parse(node.attrs?.elements || '[]');
        if (!elements || elements.length === 0) return '';
        
        const { exportToSvg } = await import('@excalidraw/excalidraw');
        const svg = await exportToSvg({
          elements,
          appState: { exportBackground: false, exportWithDarkMode: false },
        });
        
        const svgString = svg.outerHTML;
        const escapedSvg = svgString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, ' ');
        
        return `\n#align(center)[#image.decode("${escapedSvg}")]\n`;
      } catch (err) {
        console.error('Failed to export excalidraw to SVG:', err);
        return '\n#figure(\n  rect(width: 100%, height: 6cm, fill: luma(240)),\n  caption: [Diagram — Error exporting diagram]\n)\n';
      }
    }

    case 'bulletList':
      return `\n${await listToTypst(node, false)}\n`;

    case 'orderedList':
      return `\n${await listToTypst(node, true)}\n`;

    case 'listItem': {
      return (await Promise.all((node.content ?? []).map(nodeToTypst))).join('').trim();
    }

    case 'codeBlock': {
      const lang = node.attrs?.language ?? '';
      const code = inlineToTypst(node.content);
      return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }

    case 'blockquote': {
      const inner = (await Promise.all((node.content ?? []).map(nodeToTypst))).join('').trim();
      return `\n#quote[${inner}]\n`;
    }

    case 'horizontalRule':
      return '\n#line(length: 100%)\n';

    case 'doc': {
      return (await Promise.all((node.content ?? []).map(nodeToTypst))).join('');
    }

    default:
      // Unknown node — try to extract any text content
      return inlineToTypst(node.content);
  }
}

/**
 * prosemirrorToTypst — Phase 1 of the compiler.
 *
 * Traverses the Tiptap JSON AST and produces a valid Typst source string.
 */
export async function prosemirrorToTypst(doc: JSONContent, title?: string): Promise<string> {
  const body = await nodeToTypst(doc);

  // Typst document preamble
  const preamble = `#set page(paper: "a4", margin: (x: 2.5cm, y: 2.5cm))
#set text(font: "Linux Libertine", size: 11pt)
#set heading(numbering: "1.")
#set par(justify: true, leading: 0.65em)
${title ? `\n#align(center, text(size: 18pt, weight: "bold")[${title}])\n` : ''}
`;

  return preamble + body;
}

let compilerInitialized = false;

// ─── WASM Compiler ───────────────────────────────────────────────

export type CompileStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'compiling' }
  | { status: 'success'; blob: Blob }
  | { status: 'error'; message: string };

/**
 * compileToTypst — Phase 2 of the compiler.
 *
 * 1. Calls prosemirrorToTypst() to get source string
 * 2. Dynamically imports the Typst WASM compiler (lazy — doesn't bloat main bundle)
 * 3. Compiles Typst source → PDF ArrayBuffer
 * 4. Returns a Blob for download
 *
 * Throws on failure with a descriptive error message.
 */
export async function compileToTypst(
  doc: JSONContent,
  title?: string,
  onStatusChange?: (status: CompileStatus) => void
): Promise<Blob> {
  const emit = (s: CompileStatus) => onStatusChange?.(s);

  emit({ status: 'loading' });

  // Convert AST → Typst source
  const typstSource = await prosemirrorToTypst(doc, title);

  try {
    // Use the higher-level $typst helper which initializes the WASM
    const { $typst } = await import('@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs');

    if (!compilerInitialized) {
      // Force WASM fetching from CDN to fix Vercel serverless build limits
      $typst.setCompilerInitOptions({
        getModule: () => 'https://unpkg.com/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
      });
      compilerInitialized = true;
    }

    emit({ status: 'compiling' });

    // The high-level API compile takes the source and outputs PDF bytes directly
    const pdfBytes = await $typst.pdf({ mainContent: typstSource });
    if (!pdfBytes) throw new Error('No PDF output generated');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    emit({ status: 'success', blob });
    return blob;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    emit({ status: 'error', message: msg });
    throw err;
  }
}

/**
 * Triggers a browser download of a PDF blob.
 */
export function downloadBlob(blob: Blob, filename: string = 'lemma-export.pdf'): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // Clean up object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
