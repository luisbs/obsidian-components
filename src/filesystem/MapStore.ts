export default class MapStore<T> {
  protected values = new Map<string, T[]>()

  public clear(): void {
    this.values = new Map()
  }

  /**
   * Get the stored values related to the key.
   */
  public get(key: string): T[] {
    return this.values.get(key) || []
  }

  /**
   * Get the first stored value related to the key.
   */
  public getFirst(key: string): T | undefined {
    return this.get(key).first()
  }

  /**
   * Check if a value is stored in relation to a key.
   */
  public has(key: string, value?: T): boolean {
    if (value) {
      return this.get(key).includes(value)
    } else {
      return this.values.has(key)
    }
  }

  /**
   * Store a value as the first value related to a key.
   */
  public prepend(key: string, value: T): void {
    const values = this.get(key)
    values.unshift(value)
    this.values.set(key, values.unique())
  }

  /**
   * Store a value as the last value related to a key.
   */
  public push(key: string, value: T): void {
    // reverse the list so the newly inserted value is kept when unique si applied
    const values = this.get(key).reverse()
    values.unshift(value)
    this.values.set(key, values.unique().reverse())
  }
}
