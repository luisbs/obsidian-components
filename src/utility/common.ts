import type { Logger } from 'obsidian-fnc'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isString(value: unknown): value is string {
  return typeof value === 'string' && !!value
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

/**
 * Obtains a `SHA-1` hash from the data.
 */
export async function getHash(data: string, logger?: Logger): Promise<string> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  const hashBytes = await crypto.subtle.digest('SHA-1', encodedData)
  const hashArray = new Uint8Array(hashBytes)
  const hashString = Array.from(hashArray)
    .map((byte) => byte.toString(16).padStart(2, '0')) // hex
    .join('')

  // logger?.trace('hash', { encodedData, hashBytes, hashArray, hashString })
  return hashString
}


export function compareBySpecificity(a: string, b: string): number {
  //[
  //  'example.com',
  //  'example.com/images',
  //  'example.com/blog',
  //  'images.org',
  //  'example.com/blog/asd',
  //]
  // becomes ⬇️
  //[
  //  'example.com/blog/asd',
  //  'example.com/blog',
  //  'example.com/images',
  //  'example.com',
  //  'images.org',
  //]

  // prioritize specificity
  if (a.startsWith(b)) return -1
  else if (b.startsWith(a)) return 1

  // order alfabetically
  return a.localeCompare(b, 'en')
}
