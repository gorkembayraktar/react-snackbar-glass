# react-snackbar-glass

A premium, glassmorphic snackbar system for React — queueing, promise-aware
states, swipe-to-dismiss and token-driven theming with **zero runtime
dependencies**.

- 🪟 **Glass or solid** surfaces, `xs` → `lg` sizes, six screen corners
- ⏳ **Promise aware** — one call moves a snackbar through loading → success → error
- 👆 **Swipe to dismiss**, hover/focus/document-hidden pause, countdown hairline
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
| `tone` | `'glass' \| 'solid'` | `'glass'` | Surface treatment. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Card density/width. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme. |
| `maxVisible` | `number` | `3` | Simultaneously visible cards per corner. |
| `dismissible` | `boolean` | `true` | Show the close button. |
| `progress` | `boolean` | `true` | Show the countdown hairline. |
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
`action`, `dismissible`, `progress`, `tone`, `size`, `className`, `style`,
`onOpen`, `onClose`.

Reusing an `id` updates (or revives) the existing snackbar instead of stacking
a duplicate — ideal for progress-style flows.

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
