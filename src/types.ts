import type { CSSProperties, ReactNode } from 'react';

/**
 * Visual intent of a snackbar. Each variant ships with a tuned accent,
 * icon and accessible live-region behaviour.
 */
export type SnackbarVariant =
  | 'neutral'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'custom';

/** `glass` is the frosted default; `solid` paints the accent as the surface. */
export type SnackbarTone = 'glass' | 'solid';

/**
 * Density and width of a snackbar. `md` is the default; `xs` is a compact
 * mini style, `lg` is an editorial width for richer content.
 */
export type SnackbarSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * How much room a snackbar takes.
 *
 * - `card` — full card: title, message, action, countdown hairline.
 * - `compact` — fully rounded single-line pill.
 * - `inline` — message-only status line: content width, ~38px tall, never
 *   wraps and never shows a title or countdown.
 */
export type SnackbarLayout = 'card' | 'compact' | 'inline';

/**
 * Enter/exit animation preset.
 *
 * - `slide` — spring slide from the edge with a soft blur (default).
 * - `fade` — pure opacity cross-fade.
 * - `scale` — zoom in/out from the center.
 * - `pop` — bouncy overshoot.
 * - `flip` — 3D flip on the X axis.
 * - `none` — appears and disappears instantly.
 */
export type SnackbarAnimation =
  | 'slide'
  | 'fade'
  | 'scale'
  | 'pop'
  | 'flip'
  | 'none';

export type SnackbarPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type SnackbarTheme = 'light' | 'dark' | 'auto';

export type SnackbarPhase = 'visible' | 'exiting';

export type SnackbarCloseReason =
  | 'timeout'
  | 'manual'
  | 'action'
  | 'swipe'
  | 'escape'
  | 'dismissAll';

export interface SnackbarAction {
  /** Button text. Keep it to one or two words. */
  label: string;
  /**
   * Runs when the action is pressed. Returning a promise shows a built-in
   * pending state on the button and keeps keyboard focus stable.
   */
  onClick?: (id: string) => void | Promise<void>;
  /** Dismiss the snackbar after the handler settles. @default true */
  closeOnClick?: boolean;
}

export interface SnackbarOptions {
  /**
   * Stable identifier. Reusing an id updates (or revives) the existing
   * snackbar instead of stacking a duplicate.
   */
  id?: string;
  /** Small, strong headline rendered above the message. */
  title?: ReactNode;
  /** Main content of the snackbar. */
  message?: ReactNode;
  /** @default 'neutral' */
  variant?: SnackbarVariant;
  /**
   * Auto-dismiss delay in milliseconds. Use `null`, `0` or `Infinity`
   * for a persistent snackbar.
   * @default 5000
   */
  duration?: number | null;
  /** @default 'bottom-right' */
  position?: SnackbarPosition;
  /**
   * Replaces the built-in variant icon. Pass `false` to hide the icon
   * and reclaim the horizontal space.
   */
  icon?: ReactNode | false;
  /** Optional single call-to-action, e.g. "Undo". */
  action?: SnackbarAction | null;
  /** Show the close button. @default true */
  dismissible?: boolean;
  /** Show the countdown hairline. @default true */
  progress?: boolean;
  /**
   * Single-line pill: no title, no countdown hairline and tighter padding.
   * Ideal for high-frequency, low-stakes messages.
   *
   * Sugar for `layout: 'compact'`.
   * @default false
   */
  compact?: boolean;
  /**
   * How much room the snackbar takes. `compact: true` is sugar for
   * `layout: 'compact'`; `toast.single()` uses `'inline'`.
   * @default 'card'
   */
  layout?: SnackbarLayout;
  /**
   * Enter/exit animation preset. Applies to both phases unless
   * `enterAnimation` / `exitAnimation` override it.
   * @default 'slide'
   */
  animation?: SnackbarAnimation;
  /** Enter animation for this snackbar only. */
  enterAnimation?: SnackbarAnimation;
  /** Exit animation for this snackbar only. */
  exitAnimation?: SnackbarAnimation;
  /** @default 'glass' */
  tone?: SnackbarTone;
  /** @default 'md' */
  size?: SnackbarSize;
  className?: string;
  style?: CSSProperties;
  /** Called once the snackbar is actually mounted in a visible slot. */
  onOpen?: (id: string) => void;
  /** Called when dismissal starts, before the exit animation finishes. */
  onClose?: (reason: SnackbarCloseReason, id: string) => void;
}

export interface SnackbarRecord {
  readonly id: string;
  readonly title: ReactNode;
  readonly message: ReactNode;
  readonly variant: SnackbarVariant;
  readonly tone: SnackbarTone;
  readonly size: SnackbarSize;
  /** Resolved in milliseconds; `Infinity` means persistent. */
  readonly duration: number;
  readonly position: SnackbarPosition;
  readonly icon: ReactNode | false | undefined;
  readonly action: SnackbarAction | null;
  readonly dismissible: boolean;
  readonly progress: boolean;
  readonly compact: boolean;
  readonly layout: SnackbarLayout;
  readonly animation: SnackbarAnimation;
  readonly enterAnimation: SnackbarAnimation;
  readonly exitAnimation: SnackbarAnimation;
  readonly className: string | undefined;
  readonly style: CSSProperties | undefined;
  readonly createdAt: number;
  readonly phase: SnackbarPhase;
  readonly paused: boolean;
  readonly closeReason: SnackbarCloseReason | undefined;
  readonly onOpen: ((id: string) => void) | undefined;
  readonly onClose: ((reason: SnackbarCloseReason, id: string) => void) | undefined;
}

export interface SnackbarStoreConfig {
  /** @default 'bottom-right' */
  position?: SnackbarPosition;
  /** @default 5000 */
  duration?: number | null;
  /** @default true */
  dismissible?: boolean;
  /** @default true */
  progress?: boolean;
  /** Default `compact` value for new snackbars. @default false */
  compact?: boolean;
  /** Default layout for new snackbars. @default 'card' */
  layout?: SnackbarLayout;
  /** Default enter/exit animation. @default 'slide' */
  animation?: SnackbarAnimation;
  /** Default enter animation; falls back to `animation`. */
  enterAnimation?: SnackbarAnimation;
  /** Default exit animation; falls back to `animation`. */
  exitAnimation?: SnackbarAnimation;
  /** @default 'glass' */
  tone?: SnackbarTone;
  /** Default size for new snackbars. @default 'md' */
  size?: SnackbarSize;
  /** Maximum simultaneously visible snackbars per screen corner. @default 3 */
  maxVisible?: number;
}

export interface ResolvedSnackbarStoreConfig {
  position: SnackbarPosition;
  duration: number;
  dismissible: boolean;
  progress: boolean;
  compact: boolean;
  layout: SnackbarLayout;
  animation: SnackbarAnimation;
  enterAnimation: SnackbarAnimation;
  exitAnimation: SnackbarAnimation;
  tone: SnackbarTone;
  size: SnackbarSize;
  maxVisible: number;
}

/** A promise slot accepts plain content, full options, or a lazy mapper. */
export type SnackbarPromiseContent<T = unknown> =
  | ReactNode
  | SnackbarOptions
  | ((value: T) => ReactNode | SnackbarOptions);

export interface SnackbarPromiseOptions<T> {
  /** Content shown while the promise is pending. @default 'Loading…' */
  loading?: SnackbarPromiseContent;
  success: SnackbarPromiseContent<T>;
  error: SnackbarPromiseContent<unknown>;
}

export interface SnackbarStore {
  show(options: SnackbarOptions): string;
  update(id: string, options: Partial<SnackbarOptions>): void;
  dismiss(id?: string, reason?: SnackbarCloseReason): void;
  dismissAll(reason?: SnackbarCloseReason): void;
  promise<T>(
    promise: Promise<T>,
    messages: SnackbarPromiseOptions<T>,
    options?: SnackbarOptions,
  ): Promise<T>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly SnackbarRecord[];
  getServerSnapshot(): readonly SnackbarRecord[];
  getConfig(): ResolvedSnackbarStoreConfig;
  setConfig(config: SnackbarStoreConfig): void;
  /** Pauses the auto-dismiss timer. Reasons are reference-counted. */
  pause(id: string, reason?: string): void;
  resume(id: string, reason?: string): void;
  /** Internal-ish lifecycle hook, called by the viewport. */
  notifyShown(id: string): void;
  /** Internal-ish lifecycle hook, called by the viewport after the exit animation. */
  notifyExited(id: string): void;
  setPageHidden(hidden: boolean): void;
  /** Whether the stack is collapsed into a single summary pill. */
  getMinimized(): boolean;
  getServerMinimized(): boolean;
  /** Collapse (`true`) or expand (`false`) the visible stack. */
  setMinimized(minimized: boolean): void;
}

type SnackbarPresetOptions = Omit<SnackbarOptions, 'message' | 'variant'>;

/** `toast.single()` options: everything except the forced inline layout. */
export type ToastSingleOptions = Omit<SnackbarOptions, 'message' | 'layout'>;

export interface SnackbarApi {
  /** Queue a fully customised snackbar and return its id. */
  show(options: SnackbarOptions): string;
  update(id: string, options: Partial<SnackbarOptions>): void;
  dismiss(id?: string, reason?: SnackbarCloseReason): void;
  dismissAll(reason?: SnackbarCloseReason): void;
  success(message: ReactNode, options?: SnackbarPresetOptions): string;
  error(message: ReactNode, options?: SnackbarPresetOptions): string;
  warning(message: ReactNode, options?: SnackbarPresetOptions): string;
  info(message: ReactNode, options?: SnackbarPresetOptions): string;
  neutral(message: ReactNode, options?: SnackbarPresetOptions): string;
  loading(message: ReactNode, options?: SnackbarPresetOptions): string;
  custom(message: ReactNode, options?: SnackbarPresetOptions): string;
  /**
   * Message-only status line (`layout: 'inline'`): content width, one line,
   * no title and no countdown. Ideal for instant feedback such as
   * “Position set to top-center”.
   */
  single(message: ReactNode, options?: ToastSingleOptions): string;
  promise<T>(
    promise: Promise<T>,
    messages: SnackbarPromiseOptions<T>,
    options?: SnackbarOptions,
  ): Promise<T>;
  /** Collapse the visible stack into one summary pill. */
  minimize(): void;
  /** Restore the full stack after `minimize()`. */
  expand(): void;
  isMinimized(): boolean;
  /** Escape hatch for scheduling, subscribing or advanced updates. */
  store: SnackbarStore;
}

/** Options accepted by the preset helpers (`toast.success`, `toast.error`, …). */
export type ToastPresetOptions = Omit<SnackbarOptions, 'message' | 'variant'>;

/**
 * Module-level toast API. It mirrors {@link SnackbarApi} but talks to the
 * global store, so it can be called from anywhere — no hook, no provider
 * argument, no render phase.
 */
export interface ToastApi {
  /** `toast('Saved')` or `toast({ message: 'Saved', variant: 'success' })`. */
  (message: ReactNode, options?: ToastPresetOptions): string;
  (options: SnackbarOptions): string;
  /** Queue a fully customised toast and return its id. */
  show(options: SnackbarOptions): string;
  update(id: string, options: Partial<SnackbarOptions>): void;
  dismiss(id?: string, reason?: SnackbarCloseReason): void;
  dismissAll(reason?: SnackbarCloseReason): void;
  success(message: ReactNode, options?: ToastPresetOptions): string;
  error(message: ReactNode, options?: ToastPresetOptions): string;
  warning(message: ReactNode, options?: ToastPresetOptions): string;
  info(message: ReactNode, options?: ToastPresetOptions): string;
  neutral(message: ReactNode, options?: ToastPresetOptions): string;
  loading(message: ReactNode, options?: ToastPresetOptions): string;
  custom(message: ReactNode, options?: ToastPresetOptions): string;
  /**
   * Message-only status line (`layout: 'inline'`): content width, one line,
   * no title and no countdown. Ideal for instant feedback such as
   * “Position set to top-center”.
   */
  single(message: ReactNode, options?: ToastSingleOptions): string;
  promise<T>(
    promise: Promise<T>,
    messages: SnackbarPromiseOptions<T>,
    options?: SnackbarOptions,
  ): Promise<T>;
  /** Collapse the visible stack into one summary pill. */
  minimize(): void;
  /** Restore the full stack after `minimize()`. */
  expand(): void;
  isMinimized(): boolean;
  /** The store behind the global API (same instance the provider renders). */
  readonly store: SnackbarStore;
}

export interface SnackbarHostProps {
  store: SnackbarStore;
  /** Maximum simultaneously visible snackbars per corner. */
  maxVisible?: number;
  /** Outer inset in pixels. @default 20 */
  offset?: number;
  /** Space between stacked snackbars in pixels. @default 12 */
  gap?: number;
  /** Card width in pixels (desktop) for the default `md` size. @default 384 */
  width?: number;
  /** @default 'auto' */
  theme?: SnackbarTheme;
  /** Portal target. Defaults to `document.body`. */
  container?: HTMLElement | (() => HTMLElement | null);
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  pauseOnDocumentHidden?: boolean;
  /** @default true */
  swipeToDismiss?: boolean;
  /** Horizontal drag distance that triggers a dismiss. @default 88 */
  swipeThreshold?: number;
  icons?: Partial<Record<SnackbarVariant, ReactNode>>;
  closeIcon?: ReactNode;
  /** Accessible label for the close button. @default 'Dismiss notification' */
  closeLabel?: string;
  /** Accessible label for each notification region. @default 'Notifications' */
  regionLabel?: string;
  /**
   * Text shown on the collapsed pill. Defaults to
   * `"1 notification"` / `"3 notifications"`.
   */
  minimizedLabel?: (count: number) => ReactNode;
  className?: string;
  style?: CSSProperties;
  /** @default 2147483000 */
  zIndex?: number;
  /** Text direction. Inherits from the document when omitted. */
  dir?: 'ltr' | 'rtl';
}

export interface SnackbarProviderProps
  extends Omit<SnackbarHostProps, 'store'> {
  children?: ReactNode;
  /** Bring your own store (useful for tests, SSR or multiple apps). */
  store?: SnackbarStore;
  /** Default position for new snackbars. @default 'bottom-right' */
  position?: SnackbarPosition;
  /** Default duration for new snackbars. @default 5000 */
  duration?: number | null;
  /** @default true */
  dismissible?: boolean;
  /** @default true */
  progress?: boolean;
  /** Render every snackbar as a single-line pill. @default false */
  compact?: boolean;
  /** Default layout for new snackbars. @default 'card' */
  layout?: SnackbarLayout;
  /** Default enter/exit animation. @default 'slide' */
  animation?: SnackbarAnimation;
  /** Default enter animation; falls back to `animation`. */
  enterAnimation?: SnackbarAnimation;
  /** Default exit animation; falls back to `animation`. */
  exitAnimation?: SnackbarAnimation;
  /** @default 'glass' */
  tone?: SnackbarTone;
  /** Default size for new snackbars. @default 'md' */
  size?: SnackbarSize;
}
