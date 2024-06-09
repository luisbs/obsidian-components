import { isNil } from './Obj.js';

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

/**
 * Call a function on a param that maybe an array.
 *
 * @template T
 * @param   {T | T[]} value
 * @param   {(value: T, index: number) => void} fn
 * @returns {void}
 * @deprecated
 */
export function onEach(value, fn) {
  if (!Array.isArray(value)) {
    fn(value, 0);
    return;
  }

  for (let i = 0; i < value.length; i++) {
    if (value[i]) fn(value[i], i);
  }
}
