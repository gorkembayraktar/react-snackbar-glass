import { isValidElement } from 'react';
import type {
  ResolvedSnackbarStoreConfig,
  SnackbarCloseReason,
  SnackbarOptions,
  SnackbarPromiseContent,
  SnackbarPromiseOptions,
  SnackbarRecord,
  SnackbarStore,
  SnackbarStoreConfig,
} from '../types';

const EMPTY: readonly SnackbarRecord[] = Object.freeze([]);

const DEFAULT_CONFIG: ResolvedSnackbarStoreConfig = {
  position: 'bottom-right',
  duration: 5000,
  dismissible: true,
  progress: true,
  compact: false,
  tone: 'glass',
  size: 'md',
  maxVisible: 3,
};

interface TimerState {
  remaining: number;
  startedAt: number | null;
  handle: ReturnType<typeof setTimeout> | null;
}

let sequence = 0;

function createId(): string {
  sequence += 1;
  const random = Math.random().toString(36).slice(2, 7);
  return `prs-${Date.now().toString(36)}-${sequence.toString(36)}-${random}`;
}

/**
 * Turns user-facing duration input into milliseconds.
 * `null`, `0`, negative or non-finite values mean "persistent".
 */
function normalizeDuration(
  value: number | null | undefined,
  fallback: number,
): number {
  if (value === undefined) return fallback;
  if (value === null) return Infinity;
  if (!Number.isFinite(value) || value <= 0) return Infinity;
  return Math.max(1, Math.round(value));
}

function isPlainOptions(value: unknown): value is SnackbarOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value) &&
    !('$$typeof' in value)
  );
}

function contentToOptions(content: unknown): SnackbarOptions {
  if (isPlainOptions(content)) return content;
  return { message: content as SnackbarOptions['message'] };
}

function resolveContent<T>(
  content: SnackbarPromiseContent<T>,
  value: T,
): SnackbarOptions {
  const resolved = typeof content === 'function' ? content(value) : content;
  return contentToOptions(resolved);
}

export function createSnackbarStore(
  initialConfig: SnackbarStoreConfig = {},
): SnackbarStore {
  let config: ResolvedSnackbarStoreConfig = {
    ...DEFAULT_CONFIG,
    ...(initialConfig.position !== undefined
      ? { position: initialConfig.position }
      : null),
    ...(initialConfig.duration !== undefined
      ? {
          duration: normalizeDuration(
            initialConfig.duration,
            DEFAULT_CONFIG.duration,
          ),
        }
      : null),
    ...(initialConfig.dismissible !== undefined
      ? { dismissible: initialConfig.dismissible }
      : null),
    ...(initialConfig.progress !== undefined
      ? { progress: initialConfig.progress }
      : null),
    ...(initialConfig.compact !== undefined
      ? { compact: initialConfig.compact }
      : null),
    ...(initialConfig.tone !== undefined ? { tone: initialConfig.tone } : null),
    ...(initialConfig.size !== undefined ? { size: initialConfig.size } : null),
    ...(initialConfig.maxVisible !== undefined
      ? { maxVisible: Math.max(1, Math.floor(initialConfig.maxVisible)) }
      : null),
  };

  let records: readonly SnackbarRecord[] = EMPTY;
  const listeners = new Set<() => void>();
  const timers = new Map<string, TimerState>();
  const shown = new Set<string>();
  const pauseReasons = new Map<string, Set<string>>();
  let pageHidden = false;
  let minimized = false;

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const find = (id: string) => records.find((record) => record.id === id);

  const replace = (id: string, record: SnackbarRecord) => {
    records = records.map((current) => (current.id === id ? record : current));
  };

  const cleanup = (id: string) => {
    timers.delete(id);
    shown.delete(id);
    pauseReasons.delete(id);
  };

  const stopTimer = (timer: TimerState) => {
    if (timer.handle !== null) {
      clearTimeout(timer.handle);
      timer.handle = null;
    }
    if (timer.startedAt !== null) {
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
      timer.startedAt = null;
    }
  };

  const schedule = (id: string, timer: TimerState) => {
    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => {
      timer.handle = null;
      timer.startedAt = null;
      timer.remaining = 0;
      dismiss(id, 'timeout');
    }, Math.max(0, timer.remaining));
  };

  const startTimer = (id: string) => {
    const record = find(id);
    if (
      !record ||
      record.phase !== 'visible' ||
      !shown.has(id) ||
      record.duration === Infinity ||
      pageHidden ||
      (pauseReasons.get(id)?.size ?? 0) > 0
    ) {
      return;
    }

    const existing = timers.get(id);
    if (existing) {
      // Pause stops the handle but keeps the remaining time on the entry.
      if (existing.handle === null && existing.startedAt === null) {
        schedule(id, existing);
      }
      return;
    }

    const timer: TimerState = {
      remaining: record.duration,
      startedAt: null,
      handle: null,
    };
    timers.set(id, timer);
    schedule(id, timer);
  };

  const resetTimer = (id: string) => {
    const timer = timers.get(id);
    if (timer) {
      if (timer.handle !== null) clearTimeout(timer.handle);
      timers.delete(id);
    }
    startTimer(id);
  };

  const setPaused = (id: string, paused: boolean) => {
    const record = find(id);
    if (!record || record.paused === paused) return;
    replace(id, { ...record, paused });
    emit();
  };

  const pause = (id: string, reason = 'manual') => {
    const record = find(id);
    if (!record || record.phase !== 'visible') return;

    let reasons = pauseReasons.get(id);
    if (!reasons) {
      reasons = new Set();
      pauseReasons.set(id, reasons);
    }
    if (reasons.has(reason)) return;
    reasons.add(reason);

    const timer = timers.get(id);
    if (timer) stopTimer(timer);
    setPaused(id, true);
  };

  const resume = (id: string, reason = 'manual') => {
    const reasons = pauseReasons.get(id);
    if (!reasons || !reasons.has(reason)) return;
    reasons.delete(reason);
    if (reasons.size > 0) return;

    pauseReasons.delete(id);
    setPaused(id, false);
    startTimer(id);
  };

  const dismiss = (id: string, reason: SnackbarCloseReason = 'manual') => {
    const record = find(id);
    if (!record || record.phase === 'exiting') return;

    const timer = timers.get(id);
    if (timer) {
      stopTimer(timer);
      timers.delete(id);
    }

    // A queued snackbar has never been painted, so it can be removed at once.
    if (!shown.has(id)) {
      records = records.filter((current) => current.id !== id);
      cleanup(id);
      emit();
      record.onClose?.(reason, id);
      return;
    }

    pauseReasons.delete(id);
    replace(id, {
      ...record,
      phase: 'exiting',
      closeReason: reason,
      paused: false,
    });
    emit();
    record.onClose?.(reason, id);
  };

  const dismissAll = (reason: SnackbarCloseReason = 'dismissAll') => {
    const callbacks: Array<() => void> = [];
    const remaining: SnackbarRecord[] = [];

    for (const record of records) {
      if (record.phase === 'exiting') {
        remaining.push(record);
        continue;
      }

      const timer = timers.get(record.id);
      if (timer) {
        stopTimer(timer);
        timers.delete(record.id);
      }

      if (!shown.has(record.id)) {
        cleanup(record.id);
        callbacks.push(() => record.onClose?.(reason, record.id));
        continue;
      }

      pauseReasons.delete(record.id);
      remaining.push({
        ...record,
        phase: 'exiting',
        closeReason: reason,
        paused: false,
      });
      callbacks.push(() => record.onClose?.(reason, record.id));
    }

    records = remaining;
    emit();
    for (const callback of callbacks) callback();
  };

  const show = (options: SnackbarOptions): string => {
    const id = options.id ?? createId();
    const existing = find(id);

    if (existing) {
      update(id, options);
      const current = find(id);
      if (current && current.phase === 'exiting') {
        records = records.map((record) =>
          record.id === id
            ? { ...record, phase: 'visible', closeReason: undefined, paused: false }
            : record,
        );
        pauseReasons.delete(id);
        emit();
        startTimer(id);
      }
      return id;
    }

    const record: SnackbarRecord = {
      id,
      title: options.title,
      message: options.message,
      variant: options.variant ?? 'neutral',
      tone: options.tone ?? config.tone,
      size: options.size ?? config.size,
      duration: normalizeDuration(options.duration, config.duration),
      position: options.position ?? config.position,
      icon: options.icon,
      action: options.action ?? null,
      dismissible: options.dismissible ?? config.dismissible,
      progress: options.progress ?? config.progress,
      compact: options.compact ?? config.compact,
      className: options.className,
      style: options.style,
      createdAt: Date.now(),
      phase: 'visible',
      paused: false,
      closeReason: undefined,
      onOpen: options.onOpen,
      onClose: options.onClose,
    };

    records = [...records, record];
    emit();
    return id;
  };

  const update = (id: string, options: Partial<SnackbarOptions>): void => {
    const record = find(id);
    if (!record) return;

    const next: SnackbarRecord = {
      ...record,
      ...(options.title !== undefined ? { title: options.title } : null),
      ...(options.message !== undefined ? { message: options.message } : null),
      ...(options.variant !== undefined ? { variant: options.variant } : null),
      ...(options.tone !== undefined ? { tone: options.tone } : null),
      ...(options.size !== undefined ? { size: options.size } : null),
      ...(options.position !== undefined ? { position: options.position } : null),
      ...(options.icon !== undefined ? { icon: options.icon } : null),
      ...(options.action !== undefined ? { action: options.action } : null),
      ...(options.dismissible !== undefined
        ? { dismissible: options.dismissible }
        : null),
      ...(options.progress !== undefined ? { progress: options.progress } : null),
      ...(options.compact !== undefined ? { compact: options.compact } : null),
      ...(options.className !== undefined ? { className: options.className } : null),
      ...(options.style !== undefined ? { style: options.style } : null),
      ...(options.onOpen !== undefined ? { onOpen: options.onOpen } : null),
      ...(options.onClose !== undefined ? { onClose: options.onClose } : null),
      ...(options.duration !== undefined
        ? { duration: normalizeDuration(options.duration, record.duration) }
        : null),
    };

    const durationChanged = next.duration !== record.duration;
    replace(id, next);
    emit();

    if (
      durationChanged &&
      next.phase === 'visible' &&
      shown.has(id)
    ) {
      if (next.duration === Infinity) {
        const timer = timers.get(id);
        if (timer) {
          stopTimer(timer);
          timers.delete(id);
        }
      } else {
        resetTimer(id);
      }
    }
  };

  const notifyShown = (id: string) => {
    if (shown.has(id)) return;
    const record = find(id);
    if (!record || record.phase !== 'visible') return;
    shown.add(id);
    record.onOpen?.(id);
    startTimer(id);
  };

  const notifyExited = (id: string) => {
    const record = find(id);
    if (!record || record.phase !== 'exiting') return;
    cleanup(id);
    records = records.filter((current) => current.id !== id);
    emit();
  };

  const setPageHidden = (hidden: boolean) => {
    if (pageHidden === hidden) return;
    pageHidden = hidden;
    for (const record of records) {
      if (hidden) {
        pause(record.id, 'page');
      } else {
        resume(record.id, 'page');
        startTimer(record.id);
      }
    }
  };

  const setConfig = (patch: SnackbarStoreConfig) => {
    config = {
      ...config,
      ...(patch.position !== undefined ? { position: patch.position } : null),
      ...(patch.duration !== undefined
        ? {
            duration: normalizeDuration(patch.duration, config.duration),
          }
        : null),
      ...(patch.dismissible !== undefined
        ? { dismissible: patch.dismissible }
        : null),
      ...(patch.progress !== undefined ? { progress: patch.progress } : null),
      ...(patch.compact !== undefined ? { compact: patch.compact } : null),
      ...(patch.tone !== undefined ? { tone: patch.tone } : null),
      ...(patch.size !== undefined ? { size: patch.size } : null),
      ...(patch.maxVisible !== undefined
        ? { maxVisible: Math.max(1, Math.floor(patch.maxVisible)) }
        : null),
    };
  };

  const promise = <T,>(
    input: Promise<T>,
    messages: SnackbarPromiseOptions<T>,
    options: SnackbarOptions = {},
  ): Promise<T> => {
    const loadingOptions = contentToOptions(messages.loading ?? 'Loading…');
    const id = options.id ?? createId();

    show({
      dismissible: false,
      ...options,
      ...loadingOptions,
      id,
      duration:
        loadingOptions.duration !== undefined ? loadingOptions.duration : null,
      variant: loadingOptions.variant ?? 'loading',
      progress: loadingOptions.progress ?? false,
    });

    const settle = <Value,>(
      content: SnackbarPromiseContent<Value>,
      value: Value,
      variant: 'success' | 'error',
    ) => {
      const next = resolveContent(content, value);
      update(id, {
        ...next,
        variant: next.variant ?? variant,
        duration:
          next.duration !== undefined
            ? next.duration
            : options.duration !== undefined
              ? options.duration
              : 4000,
      });
    };

    return input.then(
      (value) => {
        settle(messages.success, value, 'success');
        return value;
      },
      (error: unknown) => {
        settle(messages.error, error, 'error');
        throw error;
      },
    );
  };

  return {
    show,
    update,
    dismiss,
    dismissAll,
    promise,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => records,
    getServerSnapshot: () => EMPTY,
    getConfig: () => ({ ...config }),
    setConfig,
    pause,
    resume,
    notifyShown,
    notifyExited,
    setPageHidden,
    getMinimized: () => minimized,
    getServerMinimized: () => false,
    setMinimized(next: boolean) {
      if (minimized === next) return;
      minimized = next;
      emit();
    },
  };
}

