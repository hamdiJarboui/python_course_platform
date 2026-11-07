/// <reference types="vite/client" />

declare module '*.mdx?raw' {
  const content: string;
  export default content;
}
