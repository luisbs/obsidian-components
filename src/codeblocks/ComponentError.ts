type ErrorCode =
  // throwed on `codeblockProcessors`
  //| 'invalid-codeblock-syntax'
  | 'missing-component-name'
  | 'unknown-component'
  // throwed on `getRenderer`
  | 'missing-component-renderer'
  // throwed on `render` method
  // | 'invalid-component-params'
  | 'missing-component-file'
  | 'invalid-component-syntax'
  | 'missing-component-render-function'

export class ComponentError extends Error {
  constructor(public code: ErrorCode, public cause?: unknown) {
    super(ComponentError.#suggestion(code))
    this.name = 'ComponentError(' + this.code + ')'
  }

  toString(): string {
    let print = this.name + ': ' + this.message
    if (this.cause) print += ', cause:\n\n' + String(this.cause)
    return print
  }

  static #suggestion(code: ErrorCode): string {
    switch (code) {
      // case 'invalid-codeblock-syntax':
      //   return 'check json/yaml syntax on the codeblock'
      case 'missing-component-name':
        return 'check if Component-name is present and follows Plugin settings'
      case 'unknown-component':
        return "component-name doesn't match an active Component"

      case 'missing-component-renderer':
        return "refresh 'Components filter' on Plugin settings"

      // case 'invalid-component-params':
      //   return 'codeblock json/yaml should be object-ish'
      case 'missing-component-file':
        return "refresh 'Components filter' on Plugin settings"
      case 'invalid-component-syntax':
        return 'check the code on the Component file'
      case 'missing-component-render-function':
        return "check the Component file exports a function or a 'render' method"

      default:
        return 'try-reloading Obsidian'
    }
  }
}
