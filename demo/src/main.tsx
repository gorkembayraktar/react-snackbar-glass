import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ApiHome from './ApiHome';
// Import the stylesheet explicitly, the same way consumers of the package do.
// Vite drops the transitive CSS import inside `src/index.ts` because that file
// lives outside this demo's `root`.
import '../../src/styles.css';
import './api-home.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiHome />
  </StrictMode>,
);
