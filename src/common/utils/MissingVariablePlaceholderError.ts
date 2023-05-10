export class MissingVariablePlaceholderError extends Error {
  constructor(public readonly placeholders: Array<string>) {
    super(`Variables not defined for placeholders: ${placeholders.join(',')}`);
  }
}
