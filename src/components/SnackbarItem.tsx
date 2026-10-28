import {
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type {
  SnackbarRecord,
  SnackbarStore,
  SnackbarVariant,
} from '../types';
import { DefaultCloseIcon, defaultIcons } from './icons';

interface SnackbarItemProps {
  record: SnackbarRecord;
  store: SnackbarStore;
  icons?: Partial<Record<SnackbarVariant, ReactNode>> | undefined;
  closeIcon?: ReactNode | undefined;
  closeLabel: string;
  pauseOnHover: boolean;
  pauseOnFocus: boolean;
  swipeToDismiss: boolean;
  swipeThreshold: number;
}

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  axis: 'pending' | 'x';
}

export function SnackbarItem({
  record,
  store,
  icons,
  closeIcon,
  closeLabel,
  pauseOnHover,
  pauseOnFocus,
  swipeToDismiss,
  swipeThreshold,
}: SnackbarItemProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const dragXRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClick = useRef(false);
  const surfaceRef = useRef<HTMLDivElement>(null);

  const { id, phase, action, title, message, variant, duration } = record;

  useEffect(() => {
    store.notifyShown(id);
  }, [store, id]);

  useEffect(() => {
    if (phase !== 'exiting') return;
    const timeout = setTimeout(() => store.notifyExited(id), 400);
    return () => clearTimeout(timeout);
  }, [phase, store, id]);

  const resetDrag = () => {
    dragXRef.current = 0;
    draggingRef.current = false;
    setDragX(0);
    setDragging(false);
  };

  const pauseForDrag = () => {
    store.pause(id, 'drag');
  };

  const resumeForDrag = () => {
    store.resume(id, 'drag');
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    suppressClick.current = false;
    if (!swipeToDismiss || phase === 'exiting') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (
      target.closest(
        'button, a, input, textarea, select, [role="button"], [data-prs-no-swipe]',
      )
    ) {
      return;
    }

    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: 'pending',
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current) return;

    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;

    if (current.axis === 'pending') {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical intent: let the page scroll.
        gesture.current = null;
        return;
      }
      current.axis = 'x';
      draggingRef.current = true;
      setDragging(true);
      pauseForDrag();
      surfaceRef.current?.setPointerCapture?.(event.pointerId);
    }

    if (event.cancelable) event.preventDefault();
    const absolute = Math.abs(dx);
    const damped = absolute > 96 ? 96 + (absolute - 96) * 0.32 : absolute;
    const next = Math.sign(dx) * damped;
    dragXRef.current = next;
    setDragX(next);
    if (absolute > 8) suppressClick.current = true;
  };

  const finishGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current) return;

    if (draggingRef.current) {
      const shouldDismiss = Math.abs(dragXRef.current) >= swipeThreshold;
      resetDrag();
      resumeForDrag();
      if (surfaceRef.current?.hasPointerCapture?.(current.pointerId)) {
        surfaceRef.current.releasePointerCapture(current.pointerId);
      }
      if (shouldDismiss) {
        suppressClick.current = true;
        store.dismiss(id, 'swipe');
      }
    } else {
      resetDrag();
    }

    gesture.current = null;
    if (event.type === 'pointercancel') resumeForDrag();
  };

  const handleLostPointerCapture = () => {
    if (!draggingRef.current) return;
    resetDrag();
    resumeForDrag();
    gesture.current = null;
  };

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (phase === 'exiting') store.notifyExited(id);
  };

  const handleAction = async () => {
    if (!action || actionPending) return;

    const result = action.onClick?.(id);
    if (result && typeof result.then === 'function') {
      setActionPending(true);
      try {
        await result;
      } finally {
        setActionPending(false);
      }
    }

    if (action.closeOnClick !== false) store.dismiss(id, 'action');
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!pauseOnFocus) return;
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      store.resume(id, 'focus');
    }
  };

  const resolvedIcon =
    record.icon === undefined
      ? (icons?.[variant] ?? defaultIcons[variant])
      : record.icon;
  const showIcon = record.icon !== false;
  const showProgress =
    record.progress && Number.isFinite(duration) && duration > 0;

  const style = {
    ...record.style,
    '--prs-drag-x': `${dragX}px`,
    '--prs-drag-opacity': String(
      1 - Math.min(Math.abs(dragX) / 300, 0.55),
    ),
  } as CSSProperties;

  return (
    <div
      className={`prs-item${record.className ? ` ${record.className}` : ''}`}
      data-variant={variant}
      data-tone={record.tone}
      data-size={record.size}
      data-state={phase}
      data-paused={record.paused ? 'true' : 'false'}
      data-dragging={dragging ? 'true' : 'false'}
      data-has-icon={showIcon ? 'true' : 'false'}
      data-dismissible={record.dismissible ? 'true' : 'false'}
      data-prs-id={record.id}
      data-position={record.position}
      style={style}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-busy={actionPending || variant === 'loading' ? true : undefined}
      onPointerEnter={() => {
        if (pauseOnHover) store.pause(id, 'hover');
      }}
      onPointerLeave={() => {
        if (pauseOnHover) store.resume(id, 'hover');
      }}
      onFocus={() => {
        if (pauseOnFocus) store.pause(id, 'focus');
      }}
      onBlur={handleBlur}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && record.dismissible) {
          event.stopPropagation();
          store.dismiss(id, 'escape');
        }
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        ref={surfaceRef}
        className="prs-item__surface"
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
        onLostPointerCapture={handleLostPointerCapture}
      >
        {showIcon ? (
          <span className="prs-item__icon" aria-hidden="true">
            {resolvedIcon}
          </span>
        ) : null}

        <div
          className="prs-item__content"
          data-has-title={title !== undefined && title !== null ? 'true' : 'false'}
        >
          {title !== undefined && title !== null ? (
            <div className="prs-item__title">{title}</div>
          ) : null}
          {message !== undefined && message !== null ? (
            <div className="prs-item__message">{message}</div>
          ) : null}
          {action ? (
            <div className="prs-item__actions">
              <button
                type="button"
                className="prs-action"
                onClick={handleAction}
                disabled={actionPending}
                aria-busy={actionPending || undefined}
              >
                {actionPending ? (
                  <span className="prs-action__spinner" aria-hidden="true" />
                ) : null}
                <span>{action.label}</span>
              </button>
            </div>
          ) : null}
        </div>

        {record.dismissible ? (
          <button
            type="button"
            className="prs-close"
            aria-label={closeLabel}
            onClick={() => store.dismiss(id, 'manual')}
          >
            {closeIcon ?? DefaultCloseIcon}
          </button>
        ) : null}

        {showProgress ? (
          <div className="prs-progress" aria-hidden="true">
            <span
              key={duration}
              className="prs-progress__bar"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
