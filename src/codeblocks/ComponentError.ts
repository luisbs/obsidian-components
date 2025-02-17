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
    constructor(message: string) {
        super(message, { code: 'disabled-component' })
    }
}
