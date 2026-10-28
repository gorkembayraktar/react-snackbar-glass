import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SnackbarProvider } from '../src/SnackbarProvider';
import { createSnackbarStore } from '../src/core/createSnackbarStore';

function setup(options?: { maxVisible?: number }) {
  const store = createSnackbarStore({ duration: null });
  const view = render(
    <SnackbarProvider
      store={store}
      maxVisible={options?.maxVisible}
      theme="dark"
    >
      <main>App</main>
    </SnackbarProvider>,
  );
  return { store, ...view };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('<SnackbarProvider />', () => {
  it('renders snackbars in a portal with accessible roles', () => {
    const { store } = setup();
    act(() => {
      store.show({ message: 'Profile saved', variant: 'success' });
    });

    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Profile saved');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(document.querySelector('.prs-root')).toHaveAttribute(
      'data-prs-theme',
      'dark',
    );
  });

  it('uses the alert role for errors', () => {
    const { store } = setup();
    act(() => {
      store.show({ message: 'Payment failed', variant: 'error' });
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
  });

  it('shows title, message, action and progress', () => {
    const { store } = setup();
    act(() => {
      store.show({
        title: 'Build finished',
        message: 'Deployed to production',
        action: { label: 'View' },
        duration: 8000,
      });
    });

    expect(screen.getByText('Build finished')).toBeInTheDocument();
    expect(screen.getByText('Deployed to production')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    const bar = document.querySelector<HTMLElement>('.prs-progress__bar');
    expect(bar?.style.animationDuration).toBe('8000ms');
  });

  it('dismisses with the close button and reports the reason', () => {
    const { store } = setup();
    const onClose = vi.fn();
    let id = '';

    act(() => {
      id = store.show({ message: 'Draft saved', onClose });
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );

    expect(onClose).toHaveBeenCalledWith('manual', id);
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'exiting');
  });

  it('runs the action and dismisses with the action reason', () => {
    const { store } = setup();
    const onClick = vi.fn();
    const onClose = vi.fn();
    let id = '';

    act(() => {
      id = store.show({
        message: 'Message archived',
        action: { label: 'Undo', onClick },
        onClose,
      });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onClick).toHaveBeenCalledWith(id);
    expect(onClose).toHaveBeenCalledWith('action', id);
  });

  it('dismisses with Escape', () => {
    const { store } = setup();
    const onClose = vi.fn();

    act(() => {
      store.show({ message: 'Press escape', onClose });
    });
    fireEvent.keyDown(screen.getByRole('status'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledWith('escape', expect.any(String));
  });

  it('caps visible snackbars and promotes the queue after exit', () => {
    vi.useFakeTimers();
    const { store, unmount } = setup({ maxVisible: 1 });

    act(() => {
      store.show({ message: 'First' });
      store.show({ message: 'Second' });
    });

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.queryByText('Second')).not.toBeInTheDocument();

    act(() => {
      store.dismiss(store.getSnapshot()[0]?.id, 'manual');
    });
    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();

    unmount();
  });

  it('updates content without remounting the card', () => {
    const { store } = setup();
    let id = '';

    act(() => {
      id = store.show({ message: 'Loading', variant: 'loading' });
    });
    const toast = screen.getByRole('status');

    act(() => {
      store.update(id, {
        message: 'Ready',
        variant: 'success',
        duration: 1000,
      });
    });

    expect(screen.getByRole('status')).toBe(toast);
    expect(toast).toHaveTextContent('Ready');
    expect(toast).toHaveAttribute('data-variant', 'success');
    expect(toast).toHaveAttribute('data-size', 'md');
  });

  it('supports per-snackbar positions', () => {
    const { store } = setup();
    act(() => {
      store.show({ message: 'Top left', position: 'top-left' });
    });

    expect(
      document.querySelector('.prs-region[data-position="top-left"]'),
    ).toBeInTheDocument();
  });

  it('honours custom icons and hides the default one', () => {
    const { store } = setup();
    act(() => {
      store.show({ message: 'Custom', icon: <span>★</span> });
      store.show({ message: 'No icon', icon: false });
    });

    expect(screen.getByText('★')).toBeInTheDocument();
    const noIcon = screen
      .getAllByRole('status')
      .find((element) => element.textContent?.includes('No icon'));
    expect(noIcon).toHaveAttribute('data-has-icon', 'false');
  });
});
