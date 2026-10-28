# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-10-28

### Added

- Surface presets via `tone`: `paper` (opaque matte, light/dark aware),
  `graphite` (dark charcoal in both themes) and `neon` (near-black with an
  accent glow), next to the existing `glass` and `solid`. Per-snackbar, on the
  provider and in store config; no new prop to learn.
- Demo: the playground's tone switch is now a five-way surface picker with
  swatches.

### Fixed

- Title-less cards no longer pin their message to the top edge: content is
  centred against the icon when there is no title.

## [1.3.0] - 2026-10-28

### Added

- `layout` option: `'card' | 'compact' | 'inline'`, available per snackbar,
  on `<SnackbarProvider layout="…">` and in the store config. `compact: true`
  keeps working as sugar for `layout: 'compact'`.
- `toast.single(message, options)` / `useSnackbar().single()`: message-only
  status line with a hard one-line contract (ellipsis instead of wrapping),
  no title, no hairline, and no close button while timed.
- Animation presets: `animation`, `enterAnimation` and `exitAnimation`
  (`'slide' | 'fade' | 'scale' | 'pop' | 'flip' | 'none'`).
- `--prs-enter-duration` / `--prs-exit-duration` and `--prs-radius-inline`
  CSS variables for pacing and shaping the new modes.
- Demo: replaced the showcase page with an API-first homepage — hero install
  command, 3-step quickstart, live playground, method/option tables and theming
  notes (`demo/src/ApiHome.tsx`).

## [1.2.0] - 2026-10-28

### Added

- `compact` snackbars: single-line pill, no title or countdown hairline.
  Available per toast (`compact: true`), on the provider
  (`<SnackbarProvider compact />`) and in the store config.
- Minimize API: `toast.minimize()`, `toast.expand()`, `toast.isMinimized()`
  (also on `useSnackbar()`), collapsing the whole stack into one summary pill
  that expands on click.
- `minimizedLabel` host prop to customise the collapsed pill text.

### Changed

- Demo homepage now defaults to the light theme.

## [1.1.0] - 2026-10-28

### Added

- Global `toast` API: callable (`toast('Saved')`), option objects
  (`toast({ message, variant })`), every variant preset, plus `show`,
  `update`, `dismiss`, `dismissAll`, `promise` and a `store` accessor.
- `getDefaultStore()` / `setDefaultStore()` to share or swap the store behind
  the global API.
- `<SnackbarProvider>` now renders the shared default store when no `store`
  prop is given, so `toast` works with zero wiring.

### Changed

- Copy and docs rebranded from "premium" to "glass".
- Added `repository`, `homepage` and `bugs` metadata.

## [1.0.0] - 2026-10-28

### Added

- Initial public release.
- `SnackbarProvider`, `useSnackbar`, `useSnackbarStore` and a headless
  `createSnackbarStore` + `SnackbarHost` pair.
- Seven variants (`neutral`, `success`, `error`, `warning`, `info`, `loading`,
  `custom`), glass/solid tones and four sizes.
- Six screen placements with queueing and `maxVisible` stacking.
- Promise-aware `promise()` flows with loading, success, error and mapper
  content.
- Swipe-to-dismiss, pause on hover/focus/hidden document, countdown hairline.
- Accessible live regions, keyboard-reachable actions, reduced-motion support.
- Token-driven CSS theming via `--prs-*` custom properties.
- ESM, CJS and TypeScript declarations with zero runtime dependencies.
