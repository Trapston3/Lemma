import localforage from 'localforage';
import type { JSONContent } from '@tiptap/react';

// ─── Interfaces ──────────────────────────────────────────────────
export interface Milestone {
  id: string;
  documentId: string;
  timestamp: number;
  label: string;
  ast: JSONContent;
}

export interface DocumentMeta {
  id: string;
  title: string;
  lastEdited: number;
  snippet: string;
}

// ─── Setup Instances ─────────────────────────────────────────────
const milestoneDB = localforage.createInstance({
  name: 'lemma',
  storeName: 'milestones',
});

const documentDB = localforage.createInstance({
  name: 'lemma',
  storeName: 'documents',
});

// ─── Milestone API (Time Machine) ────────────────────────────────
export async function saveMilestone(documentId: string, ast: JSONContent, label: string = 'Manual Save') {
  const milestone: Milestone = {
    id: crypto.randomUUID(),
    documentId,
    timestamp: Date.now(),
    label,
    ast,
  };
  
  const existing = (await milestoneDB.getItem<Milestone[]>(documentId)) || [];
  
  // Keep last 50 milestones per document to prevent bloat
  const updated = [milestone, ...existing].slice(0, 50);
  await milestoneDB.setItem(documentId, updated);
  
  return milestone;
}

export async function getMilestones(documentId: string): Promise<Milestone[]> {
  const milestones = await milestoneDB.getItem<Milestone[]>(documentId);
  return milestones || [];
}

export async function clearMilestones(documentId: string) {
  await milestoneDB.removeItem(documentId);
}

// ─── Document API (Manager) ──────────────────────────────────────
export async function saveDocumentMeta(doc: DocumentMeta) {
  const existing = (await documentDB.getItem<DocumentMeta[]>('list')) || [];
  const index = existing.findIndex((d) => d.id === doc.id);
  
  if (index >= 0) {
    existing[index] = doc;
  } else {
    existing.unshift(doc);
  }
  
  await documentDB.setItem('list', existing);
}

export async function getDocuments(): Promise<DocumentMeta[]> {
  const docs = await documentDB.getItem<DocumentMeta[]>('list');
  return docs || [];
}

export async function deleteDocument(id: string) {
  const existing = (await documentDB.getItem<DocumentMeta[]>('list')) || [];
  const updated = existing.filter((d) => d.id !== id);
  await documentDB.setItem('list', updated);
  
  // Clear related milestones
  await clearMilestones(id);
  
  // Actually, we should also clear the Yjs IndexedDB for this document.
  // Yjs provider stores its data in a different database, but the user won't
  // easily access it. A full deletion would involve wiping the y-indexeddb store.
  const yjsDbName = id;
  try {
    indexedDB.deleteDatabase(yjsDbName);
  } catch (e) {
    console.error('Failed to delete Yjs database:', e);
  }
}
