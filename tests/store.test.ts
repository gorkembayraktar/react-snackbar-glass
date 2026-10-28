import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSnackbarStore } from '../src/core/createSnackbarStore';

describe('createSnackbarStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a record with sensible defaults', () => {
    const store = createSnackbarStore();
    const id = store.show({ message: 'Saved' });
    const [record] = store.getSnapshot();

    expect(record?.id).toBe(id);
    expect(record).toMatchObject({
      message: 'Saved',
      variant: 'neutral',
      tone: 'glass',
      size: 'md',
      duration: 5000,
      position: 'bottom-right',
      dismissible: true,
      progress: true,
      phase: 'visible',
      paused: false,
    });
  });

  it('auto-dismisses after the duration and reports the reason', () => {
    const store = createSnackbarStore();
    const onClose = vi.fn();
    const id = store.show({ message: 'Saved', duration: 1000, onClose });

    store.notifyShown(id);
    vi.advanceTimersByTime(999);
    expect(store.getSnapshot()[0]?.phase).toBe('visible');

    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0]?.phase).toBe('exiting');
    expect(store.getSnapshot()[0]?.closeReason).toBe('timeout');
    expect(onClose).toHaveBeenCalledWith('timeout', id);

    store.notifyExited(id);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('never auto-dismisses persistent snackbars', () => {
    const store = createSnackbarStore();
    const id = store.show({ message: 'Sticky', duration: null });

    store.notifyShown(id);
    vi.advanceTimersByTime(60_000);
    expect(store.getSnapshot()[0]?.phase).toBe('visible');
    expect(store.getSnapshot()[0]?.duration).toBe(Infinity);
  });

  it('reference-counts pause reasons and resumes the remaining time', () => {
    const store = createSnackbarStore();
    const id = store.show({ message: 'Saved', duration: 1000 });

    store.notifyShown(id);
    vi.advanceTimersByTime(300);

    store.pause(id, 'hover');
    store.pause(id, 'focus');
    expect(store.getSnapshot()[0]?.paused).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(store.getSnapshot()[0]?.phase).toBe('visible');

    store.resume(id, 'hover');
    vi.advanceTimersByTime(5000);
    expect(store.getSnapshot()[0]?.phase).toBe('visible');

    store.resume(id, 'focus');
    expect(store.getSnapshot()[0]?.paused).toBe(false);
    vi.advanceTimersByTime(699);
    expect(store.getSnapshot()[0]?.phase).toBe('visible');
    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0]?.phase).toBe('exiting');
  });

  it('restarts the timer when the duration is updated', () => {
    const store = createSnackbarStore();
    const id = store.show({ message: 'Working', duration: 1000 });

    store.notifyShown(id);
    vi.advanceTimersByTime(600);
    store.update(id, { duration: 5000 });
    vi.advanceTimersByTime(4999);
    expect(store.getSnapshot()[0]?.phase).toBe('visible');

    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0]?.phase).toBe('exiting');
  });

  it('updates an existing snackbar instead of duplicating ids', () => {
    const store = createSnackbarStore();
    const first = store.show({ id: 'boot', message: 'Starting' });
    const createdAt = store.getSnapshot()[0]?.createdAt;
    const second = store.show({ id: 'boot', message: 'Started' });

    expect(second).toBe(first);
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0]?.message).toBe('Started');
    expect(store.getSnapshot()[0]?.createdAt).toBe(createdAt);
  });

  it('revives a snackbar that is already exiting', () => {
    const store = createSnackbarStore();
    const id = store.show({ message: 'Uploading', duration: null });
    store.notifyShown(id);
    store.dismiss(id, 'manual');
    expect(store.getSnapshot()[0]?.phase).toBe('exiting');

    store.show({ id, message: 'Upload resumed', duration: null });
    expect(store.getSnapshot()[0]).toMatchObject({
      phase: 'visible',
      message: 'Upload resumed',
      closeReason: undefined,
    });
  });

  it('dismisses queued snackbars without firing an exit phase', () => {
    const store = createSnackbarStore();
    const onClose = vi.fn();
    const id = store.show({ message: 'Queued', onClose });

    store.dismiss(id, 'manual');
    expect(store.getSnapshot()).toHaveLength(0);
    expect(onClose).toHaveBeenCalledWith('manual', id);
  });

  it('dismisses everything in a single notification pass', () => {
    const store = createSnackbarStore();
    const onClose = vi.fn();
    store.show({ message: 'One', onClose });
    store.show({ message: 'Two', onClose });

    store.dismissAll();
    const snapshot = store.getSnapshot();
    expect(snapshot.every((record) => record.phase === 'exiting')).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('transitions a promise from loading to success', async () => {
    const store = createSnackbarStore();
    let resolve!: (value: string) => void;
    const pending = new Promise<string>((done) => {
      resolve = done;
    });

    const result = store.promise(
      pending,
      {
        loading: 'Saving…',
        success: (value) => `Saved ${value}`,
        error: 'Could not save',
      },
      { id: 'promise', duration: 1200 },
    );

    expect(store.getSnapshot()[0]).toMatchObject({
      id: 'promise',
      message: 'Saving…',
      variant: 'loading',
      duration: Infinity,
      dismissible: false,
    });

    resolve('Ada');
    await expect(result).resolves.toBe('Ada');
    expect(store.getSnapshot()[0]).toMatchObject({
      message: 'Saved Ada',
      variant: 'success',
      duration: 1200,
    });
  });

  it('transitions a promise to an error and rethrows', async () => {
    const store = createSnackbarStore();
    const failure = new Error('Network down');

    await expect(
      store.promise(
        Promise.reject(failure),
        {
          success: 'Done',
          error: (error) => `Failed: ${(error as Error).message}`,
        },
        { id: 'promise-error' },
      ),
    ).rejects.toThrow('Network down');

    expect(store.getSnapshot()[0]).toMatchObject({
      id: 'promise-error',
      message: 'Failed: Network down',
      variant: 'error',
      duration: 4000,
    });
  });

  it('pauses timers while the page is hidden', () => {
    const store = createSnackbarStore();
    const id = store.show({ message: 'Saved', duration: 1000 });
    store.notifyShown(id);
    vi.advanceTimersByTime(400);

    store.setPageHidden(true);
    vi.advanceTimersByTime(5000);
    expect(store.getSnapshot()[0]?.paused).toBe(true);

    store.setPageHidden(false);
    vi.advanceTimersByTime(599);
    expect(store.getSnapshot()[0]?.phase).toBe('visible');
    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0]?.phase).toBe('exiting');
  });

  it('allows external config updates for future snackbars', () => {
    const store = createSnackbarStore();
    store.setConfig({
      position: 'top-center',
      duration: 2500,
      tone: 'solid',
      size: 'lg',
    });

    store.show({ message: 'Hi' });
    expect(store.getSnapshot()[0]).toMatchObject({
      position: 'top-center',
      duration: 2500,
      tone: 'solid',
      size: 'lg',
    });
  });

  it('supports per-snackbar sizes and size updates', () => {
    const store = createSnackbarStore();
    const id = store.show({ message: 'Compact', size: 'xs' });
    expect(store.getSnapshot()[0]?.size).toBe('xs');

    store.update(id, { size: 'lg' });
    expect(store.getSnapshot()[0]?.size).toBe('lg');
  });
});
