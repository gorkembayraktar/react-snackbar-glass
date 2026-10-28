# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
