import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { getDefaultStore } from './core/defaultStore';
import { SnackbarHost } from './SnackbarHost';
import type {
  SnackbarApi,
  SnackbarOptions,
  SnackbarProviderProps,
  SnackbarStore,
  SnackbarVariant,
} from './types';

interface SnackbarContextValue {
  store: SnackbarStore;
  api: SnackbarApi;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

type PresetOptions = Omit<SnackbarOptions, 'message' | 'variant'>;

export function SnackbarProvider({
  children,
  store: providedStore,
  position,
  duration,
  dismissible,
  progress,
  compact,
  tone,
  size,
  maxVisible,
  ...hostProps
}: SnackbarProviderProps) {
  const store = useMemo(
    () =>
      // Falling back to the shared default store is what makes the
      // module-level `toast` API render without extra wiring.
      providedStore ?? getDefaultStore(),
    // The store is intentionally created once per provider instance.
    // Subsequent config changes are pushed below.
    [providedStore],
  );

  useEffect(() => {
    store.setConfig({
      position,
      duration,
      dismissible,
      progress,
      compact,
      tone,
      size,
      maxVisible,
    });
  }, [
    store,
    position,
    duration,
    dismissible,
    progress,
    compact,
    tone,
    size,
    maxVisible,
  ]);

  const api = useMemo<SnackbarApi>(() => {
    const preset =
      (variant: SnackbarVariant) =>
      (message: ReactNode, options: PresetOptions = {}) =>
        store.show({ ...options, message, variant });

    return {
      show: store.show,
      update: store.update,
      dismiss: store.dismiss,
      dismissAll: store.dismissAll,
      promise: store.promise,
      success: preset('success'),
      error: preset('error'),
      warning: preset('warning'),
      info: preset('info'),
      neutral: preset('neutral'),
      custom: preset('custom'),
      loading: (message, options = {}) =>
        store.show({
          ...options,
          message,
          variant: 'loading',
          duration:
            options.duration !== undefined ? options.duration : null,
        }),
      minimize: () => store.setMinimized(true),
      expand: () => store.setMinimized(false),
      isMinimized: () => store.getMinimized(),
      store,
    };
  }, [store]);

  const value = useMemo(() => ({ store, api }), [store, api]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <SnackbarHost
        store={store}
        maxVisible={maxVisible ?? store.getConfig().maxVisible}
        {...hostProps}
      />
    </SnackbarContext.Provider>
  );
}

function useSnackbarContext(): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error(
      'useSnackbar must be used inside a <SnackbarProvider>. ' +
        'Render the provider above the component that displays snackbars.',
    );
  }
  return context;
}

/** Imperative API for showing and managing snackbars. */
export function useSnackbar(): SnackbarApi {
  return useSnackbarContext().api;
}

/** Low-level store access for subscriptions and advanced integrations. */
export function useSnackbarStore(): SnackbarStore {
  return useSnackbarContext().store;
}
