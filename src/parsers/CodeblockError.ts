type ErrorCode =
  | 'invalid-codeblock-syntax'
  | 'missing-component-name'
  | 'unknown-component'
  | 'disabled-component'
  | 'missing-component-renderer'
  | 'missing-component-file'
  | 'invalid-component-syntax'

export class CodeblockError extends Error {
  constructor(public code: ErrorCode, public source?: unknown) {
    super(code)
  }
}
