/// <reference types="vite/client" />

declare module '*.py?raw' {
  const source: string;
  export default source;
}

interface Window {
  /** Set by the print route once every cell has finished (used by scripts/pdf.ts). */
  __PRINT_READY__?: boolean;
}
