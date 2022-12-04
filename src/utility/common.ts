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
 * Creates an object from other objects
 * uses the source values as result keys,
 * and the source keys as result values.
 */
export function reverseObject(
  source: Record<string, string>,
): Record<string, string[]> {
  const result = {} as Record<string, string[]>

  for (const [value, key] of Object.entries(source)) {
    // after first occurrence
    if (key in result) result[key].push(value)
    // first occurrence
    else result[key] = [value]
  }

  return result
}
