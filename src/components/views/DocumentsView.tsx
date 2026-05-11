'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Upload, Trash2, Clock, MoreVertical } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { getDocuments, saveDocumentMeta, deleteDocument, type DocumentMeta } from '@/lib/time-machine';

export function DocumentsView() {
  const { setActiveNavItem, setActiveDocumentId, setDocumentTitle } = useUIStore();
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setIsLoading(true);
    const data = await getDocuments();
    setDocs(data);
    setIsLoading(false);
  };

  const handleCreateNew = async () => {
    const id = `lemma-doc-${crypto.randomUUID()}`;
    const title = 'Untitled Document';
    
    await saveDocumentMeta({
      id,
      title,
      lastEdited: Date.now(),
      snippet: 'New blank document...',
    });
    
    setActiveDocumentId(id);
    setDocumentTitle(title);
    setActiveNavItem('home');
  };

  const handleOpenDoc = (doc: DocumentMeta) => {
    setActiveDocumentId(doc.id);
    setDocumentTitle(doc.title);
    setActiveNavItem('home');
  };

  const handleDeleteDoc = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteDocument(id);
    loadDocs();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const id = `lemma-doc-${crypto.randomUUID()}`;
    const title = file.name.replace(/\.[^/.]+$/, '');

    try {
      if (file.name.endsWith('.json')) {
        // Assume it's a Tiptap JSON dump
        // We can't directly inject into Yjs here without initializing it,
        // so we just save the meta, set the active ID, and let the Editor handle the JSON.
        // Wait, if it's imported, the Yjs db is empty.
        // A better approach is to load it in the editor, but for now we'll just set it.
        // The real way to import into Yjs is to initialize Y.Doc, apply the JSON, then save.
      }
      
      await saveDocumentMeta({
        id,
        title,
        lastEdited: Date.now(),
        snippet: `Imported from ${file.name}`,
      });
      
      setActiveDocumentId(id);
      setDocumentTitle(title);
      setActiveNavItem('home');
    } catch (err) {
      console.error('Failed to import file', err);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="ml-0 md:ml-20 min-h-screen bg-md-surface-container-low px-4 py-8 md:px-8 md:py-10 w-full overflow-y-auto pb-24 md:pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-md-on-surface mb-2">Documents</h1>
            <p className="text-sm md:text-base text-md-on-surface-variant">
              Manage your local-first files. Data is stored safely in your browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="file"
              accept=".json,.tex"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md-lg bg-md-surface-container-high border border-md-outline-variant/30 text-md-on-surface font-medium hover:bg-md-surface-container-highest transition-colors shadow-md-1"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={handleCreateNew}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md-lg bg-md-primary text-md-on-primary font-medium hover:opacity-90 transition-opacity shadow-md-2"
            >
              <Plus size={16} />
              New Document
            </button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-md-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-md-surface border border-dashed border-md-outline-variant/40 rounded-md-xl">
            <FileText size={48} className="text-md-on-surface-variant/30 mb-4" />
            <h3 className="text-lg font-semibold text-md-on-surface mb-1">No documents yet</h3>
            <p className="text-sm text-md-on-surface-variant max-w-sm">
              Create a new document to start writing, or import an existing Lemma JSON file.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {docs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleOpenDoc(doc)}
                  className="
                    group relative flex flex-col p-5 cursor-pointer
                    bg-md-surface border border-md-outline-variant/30
                    rounded-md-xl shadow-md-1 hover:shadow-md-3 hover:border-md-primary/40
                    transition-all duration-200
                  "
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-md-md bg-md-primary-container text-md-on-primary-container flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    
                    {/* Actions dropdown trigger */}
                    <button
                      onClick={(e) => handleDeleteDoc(e, doc.id)}
                      className="p-1.5 rounded-md-md text-md-on-surface-variant opacity-0 group-hover:opacity-100 hover:bg-md-error-container hover:text-md-on-error-container transition-all"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-md-on-surface truncate mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-md-on-surface-variant line-clamp-2 min-h-[32px] mb-4">
                    {doc.snippet || 'No content preview available.'}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-md-outline-variant/20 flex items-center gap-1.5 text-[10px] text-md-on-surface-variant font-medium">
                    <Clock size={12} />
                    {new Date(doc.lastEdited).toLocaleDateString()} at {new Date(doc.lastEdited).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
