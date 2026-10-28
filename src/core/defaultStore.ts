import type { SnackbarStore } from '../types';
import { createSnackbarStore } from './createSnackbarStore';

let defaultStore: SnackbarStore | null = null;

/**
 * The store shared by the module-level `toast` API and any
 * `<SnackbarProvider>` that is not given an explicit `store`.
 *
 * Created lazily so importing the package on the server has no side effects.
 */
export function getDefaultStore(): SnackbarStore {
  if (!defaultStore) defaultStore = createSnackbarStore();
  return defaultStore;
}

/**
 * Swaps the global store. Useful for tests, isolating apps or wiring the
 * global `toast` API to a store you created yourself.
 * Pass `null` to go back to a fresh default store on next use.
 */
export function setDefaultStore(store: SnackbarStore | null): void {
  defaultStore = store;
}
