import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { createRouter } from '@/routes/router';
import { registerServiceWorker } from '@/sw-register';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/app.css';
import '@/styles/future.css';
import '@/styles/sections.css';
import '@/styles/polish.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={createRouter()} />
  </StrictMode>,
);

registerServiceWorker();
