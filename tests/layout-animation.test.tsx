import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SnackbarProvider } from '../src/SnackbarProvider';
import { createSnackbarStore } from '../src/core/createSnackbarStore';
import { setDefaultStore } from '../src/core/defaultStore';
import { toast } from '../src/toast';

afterEach(() => {
  setDefaultStore(null);
});

function renderStore(store = createSnackbarStore()) {
  render(
    <SnackbarProvider store={store} theme="dark">
      <main>App</main>
    </SnackbarProvider>,
  );
  return store;
}

describe('inline layout', () => {
  it('defaults to the card layout and keeps compact as sugar', () => {
    const store = createSnackbarStore();
    store.show({ message: 'Card' });
    store.show({ message: 'Pill', compact: true });
    store.show({ message: 'Line', layout: 'inline' });
    store.show({ message: 'Explicit', compact: true, layout: 'inline' });

    const layouts = store.getSnapshot().map((record) => record.layout);
    expect(layouts).toEqual(['card', 'compact', 'inline', 'inline']);
    expect(store.getSnapshot()[1]?.compact).toBe(true);
  });

  it('renders a message-only status line without title, close or hairline', () => {
    const store = renderStore();

    act(() => {
      store.show({
        message: 'Position set to top-center',
        title: 'Ignored',
        layout: 'inline',
      });
    });

    const item = document.querySelector('.prs-item');
    expect(item).toHaveAttribute('data-layout', 'inline');
    expect(screen.getByText('Position set to top-center')).toBeInTheDocument();
    expect(screen.queryByText('Ignored')).toBeNull();
    expect(document.querySelector('.prs-close')).toBeNull();
    expect(document.querySelector('.prs-progress')).toBeNull();
  });

  it('keeps a way out when the status line never times out', () => {
    const store = renderStore(createSnackbarStore({ duration: null }));

    act(() => {
      store.show({ message: 'Reconnecting…', layout: 'inline' });
    });

    expect(document.querySelector('.prs-close')).not.toBeNull();
  });

  it('is reachable from toast.single()', () => {
    setDefaultStore(createSnackbarStore({ duration: null }));

    const id = toast.single('Position set to center', { variant: 'success' });
    const record = toast.store.getSnapshot().find((entry) => entry.id === id);

    expect(record?.layout).toBe('inline');
    expect(record?.variant).toBe('success');
  });

  it('applies store-wide and can be reverted', () => {
    const store = createSnackbarStore({ layout: 'inline' });
    store.show({ message: 'A' });
    expect(store.getSnapshot()[0]?.layout).toBe('inline');

    store.setConfig({ layout: 'card' });
    store.show({ message: 'B' });
    expect(store.getSnapshot()[1]?.layout).toBe('card');
  });
});

describe('animation presets', () => {
  it('defaults to slide for both phases', () => {
    const store = createSnackbarStore();
    store.show({ message: 'Hello' });
    const record = store.getSnapshot()[0];

    expect(record?.animation).toBe('slide');
    expect(record?.enterAnimation).toBe('slide');
    expect(record?.exitAnimation).toBe('slide');
  });

  it('lets a preset drive both phases and a phase win individually', () => {
    const store = createSnackbarStore();
    store.show({ message: 'Fade', animation: 'fade' });
    store.show({
      message: 'Mixed',
      animation: 'scale',
      exitAnimation: 'flip',
    });

    const [fade, mixed] = store.getSnapshot();
    expect(fade?.enterAnimation).toBe('fade');
    expect(fade?.exitAnimation).toBe('fade');
    expect(mixed?.enterAnimation).toBe('scale');
    expect(mixed?.exitAnimation).toBe('flip');
  });

  it('exposes the preset as data attributes and updates live', () => {
    const store = renderStore();

    let id = '';
    act(() => {
      id = store.show({ message: 'Bouncy', animation: 'pop' });
    });

    const item = document.querySelector('.prs-item');
    expect(item).toHaveAttribute('data-enter', 'pop');
    expect(item).toHaveAttribute('data-exit', 'pop');

    act(() => {
      store.update(id, { enterAnimation: 'fade', exitAnimation: 'none' });
    });

    expect(document.querySelector('.prs-item')).toHaveAttribute(
      'data-enter',
      'fade',
    );
    expect(document.querySelector('.prs-item')).toHaveAttribute(
      'data-exit',
      'none',
    );
  });

  it('follows the store default and the provider prop', () => {
    const store = createSnackbarStore({ animation: 'flip' });
    store.show({ message: 'Flipped' });
    expect(store.getSnapshot()[0]?.enterAnimation).toBe('flip');

    store.setConfig({ animation: 'fade' });
    store.show({ message: 'Faded' });
    expect(store.getSnapshot()[1]?.exitAnimation).toBe('fade');
  });
});
