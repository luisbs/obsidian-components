export function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null
}

/**
 * Creates an object from an array_of_objects
 * using a value on the array items, as key of the result object
 */
export function arrayToObject<T extends object>(
  source: Array<T>,
  key: keyof T,
): Record<string, T> {
  const result = {} as Record<string, T>

  for (const item of source) {
    result[item[key] as string] = item
  }

  return result
}

/**
 * Generates an `string[]` from a string with separators `|;,\s`
 */
export function parseStringList(source: string): string[] {
  return source.split(/[|;,\s]+/gi).reduce((arr, str) => {
    // keep only basic values [A-Za-z0-9_]
    str = str.replace(/\W*/gi, '')
    // add values only onces
    if (str.length > 0 && !arr.includes(str)) arr.push(str)
    return arr
  }, [] as string[])
}
