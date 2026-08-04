/** Thrown for any input that is not valid TOML, including by `TomlTime`. */
export class SyntaxParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyntaxParseError';
  }
}
