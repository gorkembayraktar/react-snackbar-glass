import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SnackbarProvider } from '../src/SnackbarProvider';
import { createSnackbarStore } from '../src/core/createSnackbarStore';
import { getDefaultStore, setDefaultStore } from '../src/core/defaultStore';
import { toast } from '../src/toast';

describe('toast', () => {
  beforeEach(() => {
    setDefaultStore(createSnackbarStore({ duration: null }));
  });

  afterEach(() => {
    setDefaultStore(null);
  });

  it('queues a toast on the global store', () => {
    const id = toast('Saved');

    const [record] = getDefaultStore().getSnapshot();
    expect(record?.id).toBe(id);
    expect(record).toMatchObject({ message: 'Saved', variant: 'neutral' });
  });

  it('accepts a full options object as the only argument', () => {
    toast({ message: 'Queued', variant: 'info', title: 'Sync' });

    expect(getDefaultStore().getSnapshot()[0]).toMatchObject({
      message: 'Queued',
      variant: 'info',
      title: 'Sync',
    });
  });

  it('exposes variant presets', () => {
    toast.success('Done', { title: 'Deploy' });
    toast.error('Boom');
    toast.warning('Careful');
    toast.info('FYI');
    toast.neutral('Plain');
    toast.custom('Bespoke');

    expect(getDefaultStore().getSnapshot().map((record) => record.variant)).toEqual([
      'success',
      'error',
      'warning',
      'info',
      'neutral',
      'custom',
    ]);
    expect(getDefaultStore().getSnapshot()[0]?.title).toBe('Deploy');
  });

  it('makes loading toasts persistent by default', () => {
    toast.loading('Saving…');

    expect(getDefaultStore().getSnapshot()[0]?.duration).toBe(Infinity);
  });

  it('updates and dismisses by id', () => {
    const id = toast.loading('Saving…');
    act(() => {
      toast.update(id, { message: 'Saved', variant: 'success', duration: 3000 });
    });

    expect(getDefaultStore().getSnapshot()[0]).toMatchObject({
      message: 'Saved',
      variant: 'success',
      duration: 3000,
    });

    act(() => {
      toast.dismiss(id);
    });
    expect(getDefaultStore().getSnapshot()).toHaveLength(0);
  });

  it('resolves promises through the global store', async () => {
    const result = await toast.promise(Promise.resolve('ok'), {
      loading: 'Loading…',
      success: (value) => `Resolved ${value}`,
      error: 'Failed',
    });

    expect(result).toBe('ok');
    await act(async () => {});
    expect(getDefaultStore().getSnapshot()[0]).toMatchObject({
      message: 'Resolved ok',
      variant: 'success',
    });
  });

  it('exposes the store it writes to', () => {
    expect(toast.store).toBe(getDefaultStore());
  });

  it('renders through a provider without an explicit store', () => {
    render(
      <SnackbarProvider theme="dark">
        <main>App</main>
      </SnackbarProvider>,
    );

    act(() => {
      toast.success('Global toast');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Global toast');
  });
});
