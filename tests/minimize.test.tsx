import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SnackbarProvider } from '../src/SnackbarProvider';
import { createSnackbarStore } from '../src/core/createSnackbarStore';
import { getDefaultStore, setDefaultStore } from '../src/core/defaultStore';
import { toast } from '../src/toast';

afterEach(() => {
  setDefaultStore(null);
});

describe('compact snackbars', () => {
  it('defaults to full cards and can be flipped globally', () => {
    const normal = createSnackbarStore();
    normal.show({ message: 'Full card' });
    expect(normal.getSnapshot()[0]?.compact).toBe(false);

    const compact = createSnackbarStore({ compact: true });
    compact.show({ message: 'Pill' });
    expect(compact.getSnapshot()[0]?.compact).toBe(true);

    // Per-toast overrides win over the store default.
    compact.show({ message: 'Full again', compact: false });
    expect(compact.getSnapshot()[1]?.compact).toBe(false);
  });

  it('renders a single-line pill and drops the countdown hairline', () => {
    const store = createSnackbarStore({ duration: 5000 });
    render(
      <SnackbarProvider store={store} theme="dark">
        <main>App</main>
      </SnackbarProvider>,
    );

    act(() => {
      store.show({ message: 'Draft saved', compact: true });
    });

    const item = document.querySelector('.prs-item');
    expect(item).toHaveAttribute('data-compact', 'true');
    expect(document.querySelector('.prs-progress')).toBeNull();
  });
});

describe('minimize API', () => {
  it('toggles the store flag and notifies subscribers', () => {
    const store = createSnackbarStore();
    let calls = 0;
    store.subscribe(() => {
      calls += 1;
    });

    expect(store.getMinimized()).toBe(false);
    store.setMinimized(true);
    expect(store.getMinimized()).toBe(true);
    expect(calls).toBe(1);

    store.setMinimized(true);
    expect(calls).toBe(1);
  });

  it('collapses the stack into one pill that expands on click', () => {
    const store = createSnackbarStore({ duration: null });
    render(
      <SnackbarProvider store={store} theme="dark">
        <main>App</main>
      </SnackbarProvider>,
    );

    act(() => {
      store.show({ message: 'First' });
      store.show({ message: 'Second' });
      store.setMinimized(true);
    });

    const pill = screen.getByRole('button', { name: /2 notifications/i });
    expect(pill).toBeInTheDocument();
    expect(screen.queryByText('First')).toBeNull();

    fireEvent.click(pill);

    expect(store.getMinimized()).toBe(false);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('is reachable from the global toast API', () => {
    setDefaultStore(createSnackbarStore({ duration: null }));

    toast.success('Saved');
    toast.minimize();

    expect(toast.isMinimized()).toBe(true);
    expect(getDefaultStore().getMinimized()).toBe(true);

    toast.expand();
    expect(toast.isMinimized()).toBe(false);
  });
});
