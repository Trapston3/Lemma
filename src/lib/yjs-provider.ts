import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// ─── Types ───────────────────────────────────────────────────────
export interface YjsProviderResult {
  ydoc: Y.Doc;
  persistence: IndexeddbPersistence;
  // PartyKit provider is typed loosely because it's conditionally loaded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partyProvider: any | null;
}

// ─── Singleton cache — one Ydoc per document ID ──────────────────
const providerCache = new Map<string, YjsProviderResult>();

/**
 * getYjsProvider — Singleton factory for Yjs document providers.
 *
 * Architecture:
 * 1. Always creates a Y.Doc with a stable ID
 * 2. Always attaches y-indexeddb for instant, offline-first local saves
 * 3. If NEXT_PUBLIC_PARTYKIT_HOST is set, additionally attaches
 *    YPartyKitProvider for real-time multiplayer sync
 *
 * Returns cached instance if called multiple times with the same docId.
 */
export async function getYjsProvider(
  docId: string = 'lemma-default'
): Promise<YjsProviderResult> {
  // Return cached instance to avoid duplicate providers
  const cached = providerCache.get(docId);
  if (cached) return cached;

  // ── Create the Y.Doc ──
  const ydoc = new Y.Doc();

  // ── Always: IndexedDB for offline-first persistence ──
  const persistence = new IndexeddbPersistence(docId, ydoc);

  // ── Optional: PartyKit for real-time multiplayer ──
  let partyProvider: YjsProviderResult['partyProvider'] = null;

  const partyKitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
  if (partyKitHost) {
    try {
      // Dynamic import so PartyKit bundle doesn't land in the main chunk
      const { default: YPartyKitProvider } = await import('y-partykit/provider');
      partyProvider = new YPartyKitProvider(partyKitHost, docId, ydoc, {
        connect: true,
      });
      console.info(`[Lemma] Multiplayer enabled via PartyKit @ ${partyKitHost}`);
    } catch (err) {
      console.warn('[Lemma] PartyKit provider failed to initialize:', err);
    }
  } else {
    console.info('[Lemma] Running in local-first mode (IndexedDB only).');
  }

  const result: YjsProviderResult = { ydoc, persistence, partyProvider };
  providerCache.set(docId, result);

  return result;
}

/**
 * Destroys a Yjs provider (for cleanup / document switching).
 */
export function destroyYjsProvider(docId: string): void {
  const cached = providerCache.get(docId);
  if (!cached) return;

  cached.persistence.destroy();
  cached.partyProvider?.destroy?.();
  cached.ydoc.destroy();
  providerCache.delete(docId);
}
