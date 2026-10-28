import { copyFile } from 'node:fs/promises';

// tsup emits the extracted stylesheet as index.css. Expose it under the
// friendlier `react-snackbar-glass/styles.css` subpath as well.
await copyFile('dist/index.css', 'dist/styles.css');
console.log('styles.css ready');
