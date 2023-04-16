type ErrorCode =
  | 'invalid-codeblock-syntax'
  | 'missing-component-name'
  | 'unknown-component'
  | 'disabled-component'
  | 'missing-component-renderer'
  // throwed on `render` method
  | 'invalid-component-params'
  | 'missing-component-file'
  | 'invalid-component-syntax'
  | 'missing-component-renderer'

export class CodeblockError extends Error {
  constructor(public code: ErrorCode, public source?: unknown) {
    super(code)
  }
}
