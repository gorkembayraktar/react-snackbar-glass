import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import type {
  SnackbarHostProps,
  SnackbarPosition,
  SnackbarRecord,
} from './types';
import { SnackbarItem } from './components/SnackbarItem';

const POSITIONS: readonly SnackbarPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

function defaultMinimizedLabel(count: number): string {
  return `${count} notification${count === 1 ? '' : 's'}`;
}

export function SnackbarHost({
  store,
  maxVisible = 3,
  offset = 20,
  gap = 12,
  width = 384,
  theme = 'auto',
  container,
  pauseOnHover = true,
  pauseOnFocus = true,
  pauseOnDocumentHidden = true,
  swipeToDismiss = true,
  swipeThreshold = 88,
  icons,
  closeIcon,
  closeLabel = 'Dismiss notification',
  regionLabel = 'Notifications',
  minimizedLabel = defaultMinimizedLabel,
  className,
  style,
  zIndex = 2147483000,
  dir,
}: SnackbarHostProps) {
  const records = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const minimized = useSyncExternalStore(
    store.subscribe,
    store.getMinimized,
    store.getServerMinimized,
  );
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const regionRefs = useRef(new Map<SnackbarPosition, HTMLElement>());
  const topsRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const target =
      typeof container === 'function'
        ? container()
        : container ?? document.body;
    setPortalNode(target);
    return () => setPortalNode(null);
  }, [container]);

  useEffect(() => {
    if (!pauseOnDocumentHidden || typeof document === 'undefined') return;

    const sync = () => store.setPageHidden(document.visibilityState === 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      store.setPageHidden(false);
    };
  }, [store, pauseOnDocumentHidden]);

  // FLIP: when the stack grows or collapses, existing cards glide into their
  // new slot instead of snapping. New cards are left to the CSS enter spring.
  useLayoutEffect(() => {
    if (!portalNode) {
      topsRef.current.clear();
      return;
    }
    if (typeof window === 'undefined') return;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const next = new Map<string, number>();

    for (const region of regionRefs.current.values()) {
      const regionTop = region.getBoundingClientRect().top;
      const nodes = region.querySelectorAll<HTMLElement>('[data-prs-id]');

      for (const node of nodes) {
        const id = node.dataset.prsId;
        if (!id) continue;

        const top = regionTop + node.offsetTop;
        next.set(id, top);

        const previous = topsRef.current.get(id);
        if (
          reduced ||
          previous === undefined ||
          node.dataset.state === 'exiting' ||
          typeof node.animate !== 'function'
        ) {
          continue;
        }

        const delta = previous - top;
        if (Math.abs(delta) < 0.5) continue;

        node.animate(
          [
            { transform: `translate3d(0, ${delta}px, 0)` },
            { transform: 'translate3d(0, 0, 0)' },
          ],
          {
            duration: 320,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          },
        );
      }
    }

    topsRef.current = next;
  });

  if (!portalNode) return null;

  const byPosition = new Map<SnackbarPosition, SnackbarRecord[]>();
  for (const record of records) {
    const bucket = byPosition.get(record.position);
    if (bucket) bucket.push(record);
    else byPosition.set(record.position, [record]);
  }

  const limit = Math.max(1, Math.floor(maxVisible));
  const minimizedPosition = records[0]?.position ?? null;

  const rootStyle = {
    '--prs-width': `${width}px`,
    '--prs-offset': `${offset}px`,
    '--prs-gap': `${gap}px`,
    '--prs-z-index': String(zIndex),
    ...style,
  } as CSSProperties;

  return createPortal(
    <div
      className={`prs-root${className ? ` ${className}` : ''}`}
      data-prs-theme={theme}
      dir={dir}
      style={rootStyle}
    >
      {POSITIONS.map((position) => {
        const items = byPosition.get(position);
        if (!items || items.length === 0) return null;

        if (minimized) {
          if (position !== minimizedPosition) return null;

          return (
            <section
              key={position}
              className="prs-region prs-region--minimized"
              data-position={position}
              aria-label={regionLabel}
            >
              <button
                type="button"
                className="prs-minimized"
                data-count={items.length}
                onClick={() => store.setMinimized(false)}
                title="Expand notifications"
              >
                <span className="prs-minimized__dot" aria-hidden="true" />
                <span className="prs-minimized__count">
                  {minimizedLabel(items.length)}
                </span>
              </button>
            </section>
          );
        }

        const visible = items.slice(0, limit);

        return (
          <section
            key={position}
            ref={(node) => {
              if (node) regionRefs.current.set(position, node);
              else regionRefs.current.delete(position);
            }}
            className="prs-region"
            data-position={position}
            aria-label={regionLabel}
          >
            {visible.map((record) => (
              <SnackbarItem
                key={record.id}
                record={record}
                store={store}
                icons={icons}
                closeIcon={closeIcon}
                closeLabel={closeLabel}
                pauseOnHover={pauseOnHover}
                pauseOnFocus={pauseOnFocus}
                swipeToDismiss={swipeToDismiss}
                swipeThreshold={swipeThreshold}
              />
            ))}
          </section>
        );
      })}
    </div>,
    portalNode,
  );
}
