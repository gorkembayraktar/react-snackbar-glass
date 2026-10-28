<div align="center">

<img src="https://raw.githubusercontent.com/gorkembayraktar/react-snackbar-glass/main/assets/surfaces.png" alt="The five surfaces: glass, paper, solid, graphite and neon" width="100%" />

<h1>react-snackbar-glass</h1>

**Snackbars that look like they belong in your product.**<br />
Five surfaces, three densities, promise-aware flows, swipe-to-dismiss and a
global `toast` — with **zero runtime dependencies**.

<p>
  <a href="https://www.npmjs.com/package/react-snackbar-glass"><img alt="npm version" src="https://img.shields.io/npm/v/react-snackbar-glass?style=flat-square&color=6d5efc" /></a>
  <a href="https://www.npmjs.com/package/react-snackbar-glass"><img alt="npm downloads" src="https://img.shields.io/npm/dm/react-snackbar-glass?style=flat-square&color=6d5efc" /></a>
  <img alt="bundle size" src="https://img.shields.io/badge/gzip-8.6%20kB%20JS%20%2B%205.1%20kB%20CSS-6d5efc?style=flat-square" />
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/npm/l/react-snackbar-glass?style=flat-square&color=6d5efc" /></a>
  <a href="https://github.com/gorkembayraktar/react-snackbar-glass/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/gorkembayraktar/react-snackbar-glass?style=flat-square&color=6d5efc" /></a>
</p>

<p>
  <a href="https://gorkembayraktar.github.io/react-snackbar-glass/"><strong>Live demo</strong></a> ·
  <a href="https://gorkembayraktar.github.io/react-snackbar-glass/#playground">Playground</a> ·
  <a href="https://www.npmjs.com/package/react-snackbar-glass">npm</a> ·
  <a href="#api">API reference</a>
</p>

</div>

---

**Why this one?**

- 🪟 **Five surfaces** — `glass`, `paper`, `solid`, `graphite`, `neon`; switch the whole look with one prop.
- 📐 **Three densities** — `card`, `compact`, `inline`; `toast.single()` for one-line status.
- 🌍 **Global `toast`** — call it from anywhere: handlers, API clients, plain modules.
- ⏳ **Promise aware** — one call moves a snackbar through loading → success → error.
- 👆 **Swipe to dismiss**, hover/focus/document-hidden pause, countdown hairline.
- 📦 **Minimize** — collapse the whole stack into a single summary pill.
- 🎞️ **Motion presets** — slide, fade, scale, pop, flip or none.
- ♿ **Accessible** — live regions, keyboard reachable actions, `prefers-reduced-motion`.
- 🪶 **Tiny and typed** — 8.6 kB gzipped JS, 5.1 kB CSS, ESM + CJS + `.d.ts`, React 18/19.
- 🖥️ **SSR safe** — no `window` access during render.

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
    <SnackbarProvider position="bottom-right" theme="auto" tone="glass">
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

That is the whole setup: one provider, one stylesheet, one hook. Everything else
below is optional.

## API

Two entry points render the same store, so pick whichever fits the call site:

| Import | Use it when |
| --- | --- |
| `useSnackbar()` | Inside a component — the idiomatic path. |
| `toast` | Anywhere else: data layers, API clients, event handlers, `setTimeout`. |

### `useSnackbar()`

```ts
const snackbar = useSnackbar();
```

| Method | Description |
| --- | --- |
| `show(options)` | Queue a fully customised snackbar, returns its `id`. |
| `update(id, options)` | Patch an existing snackbar in place; timers restart when `duration` changes. |
| `dismiss(id?, reason?)` | Close one snackbar (or the oldest) and report a close reason. |
| `dismissAll(reason?)` | Close every visible snackbar. |
| `success / error / warning / info / neutral / loading / custom(message, options?)` | Variant presets. |
| `single(message, options?)` | Message-only status line (`layout: 'inline'`). |
| `promise(promise, messages, options?)` | Drive one snackbar through loading → success → error. |
| `minimize()` / `expand()` / `isMinimized()` | Collapse the stack into a summary pill and bring it back. |
| `store` | Escape hatch: the underlying store for subscriptions and advanced updates. |

Every method returns the snackbar `id` (except `update`, `dismiss*` and the
minimize helpers), so you can update or dismiss it later.

### `toast` — global API

Import `toast` when you are outside a component. It talks to the same store that
`<SnackbarProvider>` renders, so no hook is needed.

```ts
import { toast } from 'react-snackbar-glass';

toast('Draft saved');
toast.success('Deployment complete.', { title: 'v1.4.0 is live' });
toast.error('Payment declined', { action: { label: 'Retry', onClick: retry } });
toast.single('Position set to top-center');

const id = toast.loading('Saving…');
await save();
toast.update(id, { variant: 'success', message: 'Saved', duration: 3000 });
```

It mirrors `useSnackbar()` one-to-one — `show`, `update`, `dismiss`,
`dismissAll`, every variant preset, `single`, `promise`, `minimize`, `expand`,
`isMinimized` and `store`.

`<SnackbarProvider>` renders the shared store by default. Mount
`<SnackbarHost store={getDefaultStore()} />` if you need the host without a
provider, and `setDefaultStore(store)` to point `toast` at a store of your own
(handy in tests or multi-app setups). On the server, pass an explicit `store` so
requests stay isolated.

### Layouts

`layout` is the density axis. It can be set per snackbar, on the provider or in
the store config, and it is the only thing that changes between the three shapes:

| `layout` | Shape | Use it for |
| --- | --- | --- |
| `card` | Full card: title, message, action, hairline. Default. | Results that deserve a headline and an action. |
| `compact` | Fully rounded single-line pill. | High-frequency messages that should stay quiet. |
| `inline` | Message-only status line, content width, ~38 px tall. | Instant feedback such as “Copied” or “Position set”. |

```ts
toast.success('Draft saved', { layout: 'compact' });
snackbar.show({ message: 'Synced', layout: 'inline' });
<SnackbarProvider layout="compact" />;
```

`compact: true` still works and is sugar for `layout: 'compact'`.

**Single-line status** — `toast.single()` is the `inline` preset with a hard
one-line contract: long text truncates with an ellipsis instead of wrapping, and
a timed notice has no title, no countdown hairline and no close button.

```ts
toast.single('Position set to top-center', { variant: 'success' });
toast.single('Could not reach the server', { variant: 'error', duration: 8000 });
```

### Surfaces

Five presets ship with the stylesheet. Pick one per snackbar or as the default:

```tsx
<SnackbarProvider tone="paper" />

// or per snackbar
toast.info('Backup finished.', { tone: 'graphite' });
```

| `tone` | Look |
| --- | --- |
| `glass` | Frosted and translucent — the page shows through. Default. |
| `paper` | Opaque, matte, hairline border, no blur. Follows light/dark. |
| `solid` | The variant accent painted as the surface, white text. |
| `graphite` | Dark matte charcoal with light text, in both themes. |
| `neon` | Near-black with an accent glow ring, in both themes. |

All five keep the same layout, icon tinting, hairline and motion, and every one
is driven by the `--prs-*` tokens, so you can restyle a preset without forking
the CSS.

### Sizes and positions

| `size` | Width (relative to `--prs-width`, default `384px`) |
| --- | --- |
| `xs` | 72 % |
| `sm` | 86 % |
| `md` | 100 % — default |
| `lg` | 116 % |

Positions are the six screen corners: `top-left`, `top-center`, `top-right`,
`bottom-left`, `bottom-center`, `bottom-right` (default).

```ts
toast.success('Saved', { size: 'sm', position: 'top-center' });
```

`maxVisible` (default `3`) caps how many cards a corner shows at once; older
ones stay queued and take the next free slot.

### Animations

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

`loading`, `success` and `error` accept plain content, full options, or a mapper
that receives the resolved value / rejection reason. The returned promise
resolves with the original value, so it can be awaited inline.

### Sticky snackbars with in-place updates

```ts
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

Reusing an `id` (in `show()` or `update()`) updates or revives the existing
snackbar instead of stacking a duplicate — ideal for progress-style flows.

### Actions and undo windows

```ts
snackbar.show({
  message: 'Project archived.',
  duration: 7000,
  action: {
    label: 'Undo',
    onClick: () => restoreProject(),
  },
});
```

Action handlers may return a promise: the button shows a pending state and the
snackbar only closes after the handler settles (`closeOnClick`, default `true`).
Set `closeOnClick: false` to keep the snackbar open for a second step.

### Close reasons and lifecycle

`onClose` receives **why** a snackbar went away, plus its id:

```ts
snackbar.show({
  message: 'Draft saved',
  onOpen: (id) => track('shown', id),
  onClose: (reason) => track('closed', reason),
});
```

| Reason | Fired by |
| --- | --- |
| `timeout` | The duration elapsed. |
| `manual` | The close button (or `dismiss()` without a reason). |
| `action` | The action button, after its handler settled. |
| `swipe` | A drag past `swipeThreshold`. |
| `escape` | The user pressed <kbd>Esc</kbd> while a snackbar had focus. |
| `dismissAll` | `dismissAll()` cleared the stack. |

`onOpen` runs once the snackbar is actually mounted in a visible slot — not when
it is queued.

## `SnackbarOptions`

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | generated | Stable key; reusing it updates instead of stacking. |
| `title` | `ReactNode` | — | Small, strong headline above the message. |
| `message` | `ReactNode` | — | Main content. |
| `variant` | `'neutral' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'loading' \| 'custom'` | `'neutral'` | Drives accent, icon and live-region politeness. |
| `duration` | `number \| null` | `5000` | `null`, `0` or `Infinity` = persistent. |
| `position` | `SnackbarPosition` | provider | Corner for this snackbar. |
| `icon` | `ReactNode \| false` | variant icon | `false` hides the icon. |
| `action` | `{ label, onClick?, closeOnClick? } \| null` | `null` | One call-to-action. |
| `dismissible` | `boolean` | `true` | Show the close button. |
| `progress` | `boolean` | `true` | Countdown hairline. |
| `layout` | `'card' \| 'compact' \| 'inline'` | `'card'` | Density. |
| `compact` | `boolean` | `false` | Sugar for `layout: 'compact'`. |
| `animation` | `SnackbarAnimation` | `'slide'` | Both phases. |
| `enterAnimation` / `exitAnimation` | `SnackbarAnimation` | — | Per-phase override. |
| `tone` | `'glass' \| 'paper' \| 'solid' \| 'graphite' \| 'neon'` | `'glass'` | Surface preset. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Density/width. |
| `className` / `style` | — | — | Per-snackbar styling hooks. |
| `onOpen` | `(id) => void` | — | Mounted and visible. |
| `onClose` | `(reason, id) => void` | — | Dismissal started. |

## `<SnackbarProvider>` props

Every default below can be overridden per snackbar in `SnackbarOptions`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `SnackbarPosition` | `'bottom-right'` | Default corner for new snackbars. |
| `duration` | `number \| null` | `5000` | Auto-dismiss delay in ms. `null`/`0`/`Infinity` = persistent. |
| `tone` | `'glass' \| 'paper' \| 'solid' \| 'graphite' \| 'neon'` | `'glass'` | Surface preset. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Card density/width. |
| `layout` | `'card' \| 'compact' \| 'inline'` | `'card'` | Default layout. |
| `compact` | `boolean` | `false` | Sugar for `layout: 'compact'`. |
| `animation` | `SnackbarAnimation` | `'slide'` | Enter + exit preset. |
| `enterAnimation` / `exitAnimation` | `SnackbarAnimation` | — | Per-phase override. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme. |
| `maxVisible` | `number` | `3` | Simultaneously visible cards per corner. |
| `dismissible` | `boolean` | `true` | Show the close button. |
| `progress` | `boolean` | `true` | Show the countdown hairline. |
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
| `className` / `style` | — | — | Classes/styles for the host root. |

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
toast.minimize();     // stack → one pill
toast.expand();       // back to full cards
toast.isMinimized();  // boolean
```

`useSnackbar()` exposes the same three methods, and the store has
`setMinimized(true | false)` + `getMinimized()`. Customize the pill text with
`minimizedLabel={(count) => `${count} neue Meldungen`}`.

## Theming

Colors, radii, blur and motion are CSS custom properties on `.prs-root` (and
per-card inline styles).

```css
:root {
  --prs-accent: #8b5cf6;
  --prs-radius: 16px;
  --prs-width: 400px;
}
```

Or scope a single snackbar:

```tsx
snackbar.custom('Added to collection.', {
  style: { '--prs-accent': '#f472b6', '--prs-solid': '#be185d' },
});
```

| Token | Default | Controls |
| --- | --- | --- |
| `--prs-accent` | variant color | Accent for icons, actions and links. |
| `--prs-accent-soft` | 13 % accent | Icon chip / action background. |
| `--prs-accent-ring` | 30 % accent | Icon ring and hover border. |
| `--prs-solid` | accent | Surface color of the `solid` tone. |
| `--prs-radius` | `18px` | Card radius. |
| `--prs-width` | `384px` | Base card width; `size` scales it. |
| `--prs-offset` | `20px` | Distance from the viewport edge. |
| `--prs-gap` | `12px` | Space between stacked cards. |
| `--prs-font` | Inter/system stack | Font family. |
| `--prs-blur` | `blur(22px) saturate(1.55)` | Glass backdrop filter. |
| `--prs-shadow` / `--prs-shadow-hover` | layered | Card shadow. |
| `--prs-enter-duration` / `--prs-exit-duration` | `440ms` / `190ms` | Motion pacing. |
| `--prs-radius-inline` | pill radius | Radius of `inline` notices. |
| `--prs-z-index` | `2147483000` | Host stacking context. |

## Store-only usage

If you want to own the store — or render the host somewhere specific — skip the
provider:

```tsx
import { createSnackbarStore, SnackbarHost } from 'react-snackbar-glass';

const store = createSnackbarStore({ position: 'top-center', tone: 'paper' });

function App() {
  return (
    <>
      <button onClick={() => store.show({ message: 'Hi there' })}>Notify</button>
      <SnackbarHost store={store} />
    </>
  );
}
```

```ts
store.setConfig({ duration: 3000, layout: 'compact' }); // live default changes
const stop = store.subscribe(() => console.log(store.getSnapshot()));
```

| Member | Description |
| --- | --- |
| `show / update / dismiss / dismissAll / promise` | Same semantics as the hook. |
| `subscribe(fn)` | Listen for any change; returns an unsubscribe function. |
| `getSnapshot()` / `getServerSnapshot()` | Current records (stable for `useSyncExternalStore`). |
| `getConfig()` / `setConfig(partial)` | Read or change defaults at runtime. |
| `pause(id, reason?)` / `resume(id, reason?)` | Reference-counted timer pause (hover, drag, hidden tab). |
| `minimize / expand / getMinimized` | Stack collapse state. |
| `notifyShown(id)` / `notifyExited(id)` | Lifecycle hooks the viewport calls. |
| `setPageHidden(hidden)` | Forward `document.visibilityState` changes. |

## Server-side rendering

`SnackbarProvider` and `SnackbarHost` render nothing until mounted, and the
store returns a stable server snapshot. No `window` access during render, so the
components are safe in Next.js, Remix and other SSR frameworks.

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
