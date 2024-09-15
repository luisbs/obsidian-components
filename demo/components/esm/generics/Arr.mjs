import { isNil } from './Obj.mjs';

/**
 * Ensure a variable is an array.
 *
 * @template T
 * @param   {T} value
 * @returns {T extends Array ? T : T[]}
 */
export function wrap(value) {
  if (Array.isArray(value)) return value;
  return isNil(value) ? [] : [value];
}
