export interface DumpOptions {
  /**
   * The newline sequence.
   * @default '\n'
   */
  newline?: '\n' | '\r\n';

  /**
   * If true, properties with unsupported types (like undefined, Symbol, Function)
   * will be silently ignored instead of throwing an error.
   * @default false
   */
  ignoreUndefined?: boolean;

  /**
   * If true, string keys will always be quoted, even when they contains only
   * bare-key characters.
   * @default false
   */
  forceQuotes?: boolean;
}
