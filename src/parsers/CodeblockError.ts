type ErrorCode =
  | 'invalid-codeblock-syntax'
  | 'missing-fragment-name'
  | 'unknown-fragment'
  | 'disabled-fragment'
  | 'missing-fragment-renderer'
  | 'missing-fragment-file'
  | 'invalid-fragment-syntax'

export class CodeblockError extends Error {
  constructor(public code: ErrorCode, public source?: unknown) {
    super(code)
  }
}
