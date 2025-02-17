type ErrorCode =
    | 'not-supported'
    // throwed on `codeblockProcessors`
    //| 'invalid-codeblock-syntax'
    | 'missing-component-name'
    // throwed on `render` method
    // | 'invalid-component-params'
    | 'missing-component-file'
// throwed on `getRenderer`
// ! | 'missing-component-renderer'
// ! | 'invalid-component-syntax'
// ! | 'missing-component-render-function'

export class ComponentError extends Error {
    public name = 'ComponentError'
    public code: string

    constructor(message: string, options: { code: string; cause?: unknown }) {
        super(message)
        this.code = options.code
        this.cause = options.cause
    }

    toString(): string {
        if (!this.cause) return `${this.name}: ${this.message}`

        const base = `${this.name}: ${this.message}, cause:\n\n`
        if (this.cause instanceof Error) return `${base}${this.cause}`
        return `${base}${JSON.stringify(this.cause)}`
    }
}
export class DisabledComponentError extends ComponentError {
    public name = 'DisabledComponentError'

    constructor(componentName: string) {
        super(`'${componentName}' was disabled recently`, {
            code: 'disabled-component',
        })
    }
}

export class OldComponentError extends Error {
    constructor(
        public code: ErrorCode,
        public cause?: unknown,
    ) {
        super(OldComponentError.#suggestion(code))
        this.name = 'OldComponentError(' + this.code + ')'
    }

    toString(): string {
        let print = this.name + ': ' + this.message
        if (!this.cause) return print

        print += ', cause:\n\n'
        if (this.cause instanceof Error) return print + String(this.cause)
        return print + JSON.stringify(this.cause)
    }

    static #suggestion(code: ErrorCode): string {
        switch (code) {
            // case 'invalid-codeblock-syntax':
            //   return 'check json/yaml syntax on the codeblock'
            case 'missing-component-name':
                return 'check if Component-name is present and follows Plugin settings'

            // case 'invalid-component-params':
            //   return 'codeblock json/yaml should be object-ish'
            case 'not-supported':
                return 'unknown behavior, open an issuer'
            case 'missing-component-file':
                return "refresh 'Components filter' on Plugin settings"

            default:
                return 'try-reloading Obsidian'
        }
    }
}
