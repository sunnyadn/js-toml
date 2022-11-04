export class SyntaxParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyntaxParseError';
  }
}
