type ErrorCode =
  | 'codeblock-missing-name'
  | 'codeblock-invalid-data'
  | 'fragment-missing'
  | 'fragment-disabled'
  | 'fragment-format-unknown'
  | 'fragment-render-missing'
  | 'fragment-file-missing'
  | 'fragment-invalid'

export class CodeblockError extends Error {
  constructor(public code: ErrorCode, public source?: unknown) {
    super(code)
  }
}
