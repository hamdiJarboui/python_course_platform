/** A content problem with a precise source location, so authors can fix it quickly. */
export class ContentError extends Error {
  constructor(
    readonly file: string,
    readonly line: number | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'ContentError';
  }

  override toString(): string {
    return `${this.file}${this.line ? `:${this.line}` : ''}: ${this.message}`;
  }
}
