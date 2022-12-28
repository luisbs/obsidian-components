type ErrorCode =
  | 'codeblock-parse-error'
  | 'fragment-missing'
  | 'fragment-disabled'
  | 'fragment-format-unknown'
  | 'fragment-render-missing'
  | 'fragment-file-missing'

export class CodeblockError extends Error {
  constructor(public code: ErrorCode, public source?: unknown) {
    super(code)
  }
}
