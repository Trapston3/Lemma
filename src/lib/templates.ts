import type { JSONContent } from '@tiptap/react';

// ─── Template IDs ────────────────────────────────────────────────
export type TemplateId = 'blank' | 'ieee' | 'acm';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  content: JSONContent;
}

// ─── Blank Template ──────────────────────────────────────────────
const blank: Template = {
  id: 'blank',
  name: 'Blank Document',
  description: 'A clean slate — just a title and a paragraph.',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Untitled Document' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      },
    ],
  },
};

// ─── IEEE Conference Paper ────────────────────────────────────────
const ieee: Template = {
  id: 'ieee',
  name: 'IEEE Conference Paper',
  description: 'Standard IEEE double-column conference format.',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: '[Paper Title]' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          {
            type: 'text',
            text: '[Author Names], [Department], [University], [Location], [Emails]',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Abstract' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[A concise summary...]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: 'Index Terms—[Term 1, Term 2, Term 3]',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'I. INTRODUCTION' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'II. MAJOR CONTRIBUTIONS' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'III. LITERATURE SURVEY' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'IV. PROPOSED METHOD' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'V. RESULTS AND DISCUSSION' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'VI. CONCLUSION' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'REFERENCES' }],
      },
    ],
  },
};

// ─── ACM Article ──────────────────────────────────────────────────
const acm: Template = {
  id: 'acm',
  name: 'ACM Article',
  description: 'ACM SIG Proceedings format with CCS Concepts.',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Article Title' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: 'Author One, Institution One · Author Two, Institution Two',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Abstract' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'A concise summary of the paper in 150 words or fewer.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'CCS Concepts' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: '•Computing methodologies',
          },
          {
            type: 'text',
            text: ' → Machine learning; ',
          },
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: '•Human-centered computing',
          },
          {
            type: 'text',
            text: ' → User interfaces.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Keywords' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: 'keyword one, keyword two, keyword three',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1 Introduction' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Motivate the problem and outline the contributions of this work.' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2 Background' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Technical background and related work.' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3 System Design' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Describe the architecture and key design decisions.' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '4 Evaluation' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Experimental setup, benchmarks, and results.' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '5 Conclusion' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Summary of findings and future directions.' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'References' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Author, A. 2024. Title of the Work. In Proceedings of ACM Conference, Location. ACM, New York, NY.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

// ─── Public API ──────────────────────────────────────────────────
export const TEMPLATES: Template[] = [blank, ieee, acm];

export function getTemplate(id: TemplateId): Template {
  return TEMPLATES.find((t) => t.id === id) ?? blank;
}
