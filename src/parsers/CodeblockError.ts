type ErrorCode =
  | 'invalid-codeblock-syntax'
  | 'missing-component-name'
  | 'unknown-component'
  // throwed on `getRenderer`
  | 'disabled-component'
  | 'missing-component-renderer'
  // throwed on `render` method
  | 'invalid-component-params'
  | 'missing-component-file'
  | 'invalid-component-syntax'
  | 'missing-component-render-function'

export class CodeblockError extends Error {
  constructor(public code: ErrorCode, public source?: unknown) {
    super(code)
  }
}
