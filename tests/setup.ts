import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement scrolling.
if (typeof window !== 'undefined') window.scrollTo = () => undefined;

afterEach(() => {
  cleanup();
});
