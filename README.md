# react-snackbar-glass

A glassmorphic snackbar system for React — queueing, promise-aware
states, swipe-to-dismiss and token-driven theming with **zero runtime
dependencies**.

- 🪟 **Five surfaces** — `glass`, `paper`, `solid`, `graphite`, `neon`, `xs` → `lg` sizes, six screen corners
- 🌍 **Global `toast`** — call it from anywhere, no hook required
- ⏳ **Promise aware** — one call moves a snackbar through loading → success → error
- 👆 **Swipe to dismiss**, hover/focus/document-hidden pause, countdown hairline
- 📦 **Compact + minimize** — one-line pills, or collapse the whole stack
- ✏️ **Single-line status** — `toast.single()` for instant, title-less feedback
- 🎞️ **Pick your motion** — slide, fade, scale, pop, flip or none
- ♿ **Accessible** — polite/assertive live regions, keyboard reachable actions, `prefers-reduced-motion`
- 🧩 **Typed** — written in TypeScript, ships ESM + CJS + `.d.ts`
- 🪶 **Tiny** — React is the only peer dependency
- 🖥️ **SSR safe** — no `window` access during render

## Installation

```bash
npm install react-snackbar-glass
```

Import the stylesheet once in your app entry point:

```ts
import 'react-snackbar-glass/styles.css';
```

## Quick start

```tsx
import { SnackbarProvider, useSnackbar } from 'react-snackbar-glass';
import 'react-snackbar-glass/styles.css';

export default function App() {
  return (
    <SnackbarProvider position="bottom-right" theme="auto">
      <Dashboard />
    </SnackbarProvider>
  );
}

function Dashboard() {
  const snackbar = useSnackbar();

  return (
    <button onClick={() => snackbar.success('Saved to your workspace.')}>
      Save
    </button>
  );
}
```

## API

### `useSnackbar()`

| Method | Description |
| --- | --- |
| `show(options)` | Queue a fully customised snackbar, returns its `id`. |
| `update(id, options)` | Patch an existing snackbar in place; timers restart if `duration` changes. |
| `dismiss(id?, reason?)` | Close one snackbar (or the oldest) and report a close reason. |
| `dismissAll(reason?)` | Close every visible snackbar. |
| `success / error / warning / info / neutral / loading / custom(message, options?)` | Variant presets. |
| `promise(promise, messages, options?)` | Drive a single snackbar through loading, success and error. |
| `store` | Escape hatch: the underlying store for subscriptions and advanced updates. |

### `toast` — global API

Import `toast` when you are outside a component: data layers, event
emitters, API clients, `setTimeout` callbacks. It targets the same store
that `<SnackbarProvider>` renders, so no hook is needed.

```ts
import { toast } from 'react-snackbar-glass';

toast('Draft saved');
toast.success('Deployment complete.', { title: 'v1.4.0 is live' });
toast.error('Payment declined', { action: { label: 'Retry', onClick: retry } });
```

It mirrors `useSnackbar()` one-to-one — `show`, `update`, `dismiss`,
`dismissAll`, every variant preset, `promise`, and `store`:

```ts
const id = toast.loading('Saving…');
await save();
toast.update(id, { variant: 'success', message: 'Saved', duration: 3000 });
```

`<SnackbarProvider>` renders the shared store by default. Mount
`<SnackbarHost store={getDefaultStore()} />` if you need the host without a
provider, and `setDefaultStore(store)` to point `toast` at a store of your
own (handy in tests or multi-app setups). On the server, pass an explicit
`store` so requests stay isolated.

### Promise-aware flows

```tsx
const snackbar = useSnackbar();

snackbar.promise(deploy(), {
  loading: { title: 'Deploying', message: 'Uploading assets…' },
  success: { title: 'Deployed', message: 'Build #4821 is live.' },
  error: (error) => ({
    title: 'Deployment failed',
    message: error instanceof Error ? error.message : 'Something went wrong.',
    action: { label: 'View logs' },
  }),
});
```

`success` and `error` can be plain content, full options, or a mapper that
receives the resolved value / rejection reason.

### Sticky snackbars with in-place updates

```tsx
const id = snackbar.show({
  variant: 'loading',
  title: 'Uploading assets',
  message: '42% · 8 of 19 files',
  duration: null,
});

// later…
snackbar.update(id, {
  variant: 'success',
  title: 'Upload complete',
  message: '19 assets are ready to use.',
  duration: 4200,
});
```

### Actions and undo windows

```tsx
snackbar.show({
  message: 'Project archived.',
  duration: 7000,
  action: {
    label: 'Undo',
    onClick: () => restoreProject(),
  },
});
```

Action handlers may return a promise: the button shows a pending state and
the snackbar only closes after the handler settles (`closeOnClick`, default
`true`).

## `<SnackbarProvider>` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `SnackbarPosition` | `'bottom-right'` | Default corner for new snackbars. |
| `duration` | `number \| null` | `5000` | Auto-dismiss delay in ms. `null`/`0`/`Infinity` = persistent. |
| `tone` | `'glass' \| 'paper' \| 'solid' \| 'graphite' \| 'neon'` | `'glass'` | Surface preset. `paper` is matte and opaque, `solid` paints the accent, `graphite`/`neon` are dark in both themes. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Card density/width. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme. |
| `maxVisible` | `number` | `3` | Simultaneously visible cards per corner. |
| `dismissible` | `boolean` | `true` | Show the close button. |
| `progress` | `boolean` | `true` | Show the countdown hairline. |
| `compact` | `boolean` | `false` | Single-line pill for every snackbar. |
| `layout` | `'card' \| 'compact' \| 'inline'` | `'card'` | Default layout; `compact` is sugar for `'compact'`. |
| `animation` | `'slide' \| 'fade' \| 'scale' \| 'pop' \| 'flip' \| 'none'` | `'slide'` | Enter + exit animation preset. |
| `enterAnimation` / `exitAnimation` | same as `animation` | — | Override a single phase. |
| `minimizedLabel` | `(count: number) => ReactNode` | `"3 notifications"` | Text on the collapsed pill. |
| `pauseOnHover` | `boolean` | `true` | Freeze the timer while hovered. |
| `pauseOnFocus` | `boolean` | `true` | Freeze the timer while focus is inside. |
| `pauseOnDocumentHidden` | `boolean` | `true` | Pause when the tab is hidden. |
| `swipeToDismiss` | `boolean` | `true` | Drag/flick a card to dismiss. |
| `swipeThreshold` | `number` | `88` | Drag distance (px) that triggers dismissal. |
| `store` | `SnackbarStore` | — | Bring your own store (tests, SSR, multiple apps). |
| `offset` / `gap` / `width` | `number` | `20` / `12` / `384` | Layout tuning in px. |
| `icons` / `closeIcon` / `closeLabel` / `regionLabel` | — | — | Icon and a11y overrides. |
| `container` | `HTMLElement \| () => HTMLElement \| null` | `document.body` | Portal target. |
| `dir` | `'ltr' \| 'rtl'` | inherited | Text direction. |
| `zIndex` | `number` | `2147483000` | Host stacking context. |

## `SnackbarOptions`

`id`, `title`, `message`, `variant`, `duration`, `position`, `icon`,
`action`, `dismissible`, `progress`, `compact`, `layout`, `animation`,
`enterAnimation`, `exitAnimation`, `tone`, `size`, `className`, `style`,
`onOpen`, `onClose`.

Reusing an `id` updates (or revives) the existing snackbar instead of stacking
a duplicate — ideal for progress-style flows.

## Single-line status notices

`toast.single()` is the "one line, no ceremony" preset: content width, a hard
one-line contract (long text truncates with an ellipsis instead of wrapping),
no title, no countdown hairline and no close button while it is timed.

```ts
toast.single('Position set to top-center', { variant: 'success' });
toast.single('Could not reach the server', { variant: 'error', duration: 8000 });
```

It is `layout: 'inline'` under the hood, so every entry point can do the same:

```ts
snackbar.show({ message: 'Synced', layout: 'inline' });
useSnackbar().single('Copied to clipboard');
<SnackbarProvider layout="inline" />;
```

## Animations

One preset drives both phases; `enterAnimation` / `exitAnimation` override a
single phase:

```ts
toast.success('Saved', { animation: 'fade' });
toast.error('Failed', { animation: 'scale', exitAnimation: 'none' });
<SnackbarProvider animation="pop" />;
```

| Preset | Feel |
| --- | --- |
| `slide` | Spring slide from the nearest edge with a soft blur (default). |
| `fade` | Pure opacity cross-fade. |
| `scale` | Zoom from the center. |
| `pop` | Bouncy overshoot. |
| `flip` | 3D flip on the X axis. |
| `none` | Instant, no motion. |

Pace them with `--prs-enter-duration` / `--prs-exit-duration` (defaults
`440ms` / `190ms`); `prefers-reduced-motion` still disables everything.

## Compact and minimized stacks

Two ways to reclaim screen space when snackbars would otherwise pile up.

**Compact** — a single-line pill per snackbar (no title, no hairline):

```ts
toast.success('Draft saved', { compact: true });
snackbar.show({ message: 'Synced', compact: true });
```

Set it once for every snackbar with `<SnackbarProvider compact />` or
`createSnackbarStore({ compact: true })`.

**Minimized** — collapse the whole stack into one summary pill
(`"3 notifications"`) that expands on click:

```ts
toast.minimize();   // stack → one pill
toast.expand();     // back to full cards
toast.isMinimized(); // boolean
```

`useSnackbar()` exposes the same three methods, and the store has
`setMinimized(true | false)` + `getMinimized()`. Customize the pill text with
`minimizedLabel={(count) => `${count} neue Meldungen`}`.

## Surfaces

Five presets ship with the stylesheet. Pick one per snackbar or as the default:

```tsx
<SnackbarProvider tone="paper">
toast.info('Backup finished.', { tone: 'graphite' });
```

| `tone` | Look |
| --- | --- |
| `glass` | Frosted and translucent — the page shows through. Default. |
| `paper` | Opaque, matte, hairline border, no blur. Follows light/dark. |
| `solid` | The variant accent painted as the surface, white text. |
| `graphite` | Dark matte charcoal with light text, in both themes. |
| `neon` | Near-black with an accent glow ring, in both themes. |

All five keep the same layout, icon tinting, progress hairline and motion, and
every one is still driven by the `--prs-*` tokens, so you can restyle a preset
without forking the CSS.

## Theming

Colors, radii, blur and motion are CSS custom properties on `.prs-root`
(and per-card inline styles). Override globally:

```css
:root {
  --prs-accent: #8b5cf6;
  --prs-radius: 16px;
}
```

Or scope a single snackbar:

```tsx
snackbar.custom('Added to collection.', {
  style: { '--prs-accent': '#f472b6', '--prs-solid': '#be185d' },
});
```

## Store-only usage

```tsx
import { createSnackbarStore, SnackbarHost } from 'react-snackbar-glass';

const store = createSnackbarStore({ position: 'top-center' });

function App() {
  return (
    <>
      <button onClick={() => store.show({ message: 'Hi there' })}>Notify</button>
      <SnackbarHost store={store} />
    </>
  );
}
```

## Server-side rendering

`SnackbarProvider` and `SnackbarHost` render nothing until mounted, and the
store returns a stable server snapshot. No `window` access during render, so
the components are safe in Next.js, Remix and other SSR frameworks.

## Requirements

- React 18 or 19
- Modern evergreen browsers (CSS `backdrop-filter` degrades gracefully)

## Development

```bash
npm install
npm run dev        # demo playground (Vite)
npm run typecheck
npm test
npm run build      # ESM + CJS + d.ts + styles
```

## License

MIT
