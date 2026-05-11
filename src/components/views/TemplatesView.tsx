'use client';

import { motion } from 'framer-motion';
import { FileText, Sigma, PencilRuler } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { useUIStore } from '@/store/ui-store';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  ieee: Sigma,
  acm: FileText,
  blank: PencilRuler,
};

const CATEGORY_COLORS: Record<string, string> = {
  ieee: 'from-blue-500/20 to-indigo-500/10',
  acm: 'from-red-500/20 to-rose-500/10',
  blank: 'from-emerald-500/20 to-teal-500/10',
};

export function TemplatesView() {
  const { setActiveNavItem } = useUIStore();

  const handleLoadTemplate = (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).__lemmaEditor;
    const tmpl = TEMPLATES.find((t) => t.id === id);
    if (editor && tmpl) {
      editor.commands.setContent(tmpl.content);
    }
    // Navigate back to the editor
    setActiveNavItem('home');
  };

  return (
    <main className="ml-20 min-h-screen bg-md-surface-container-low px-8 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-md-on-surface mb-2">Templates</h1>
          <p className="text-md-on-surface-variant">
            Start from a professionally structured template. Click to load into the editor.
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map((template, i) => {
            const Icon = CATEGORY_ICONS[template.id] ?? FileText;
            const gradient = CATEGORY_COLORS[template.id] ?? 'from-md-primary/10 to-md-secondary/10';

            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLoadTemplate(template.id)}
                className="
                  group text-left
                  flex flex-col gap-4 p-6
                  rounded-md-xl border border-md-outline-variant/40
                  bg-md-surface hover:bg-md-surface-container
                  shadow-md-1 hover:shadow-md-3
                  transition-all duration-200
                "
              >
                {/* Preview thumbnail */}
                <div className={`
                  w-full h-32 rounded-md-lg
                  bg-gradient-to-br ${gradient}
                  flex items-center justify-center
                  border border-md-outline-variant/20
                  group-hover:border-md-primary/30
                  transition-colors duration-200
                `}>
                  <Icon size={36} strokeWidth={1.5} className="text-md-on-surface/30 group-hover:text-md-primary/60 transition-colors" />
                </div>

                {/* Info */}
                <div>
                  <p className="font-semibold text-md-on-surface mb-1">{template.name}</p>
                  <p className="text-xs text-md-on-surface-variant leading-relaxed">{template.description}</p>
                </div>

                {/* CTA */}
                <div className="
                  mt-auto pt-2 border-t border-md-outline-variant/20
                  text-xs font-medium text-md-primary
                  group-hover:text-md-on-primary-container
                  transition-colors
                ">
                  Use this template →
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
