import { isNil } from './generics/Obj.mjs';

/** @type {(item: unknown, itemsLabel: string) => boolean} */
function shouldGroup(item, itemsLabel) {
  if (isNil(item)) return false;
  if (Array.isArray(item)) return true;
  return typeof item === 'object' && itemsLabel in item;
}

/**
 * Serialize the data into an standard object.
 *
 * @template T
 * @template {string} L
 * @template {ItemsGroup<L, T>} G
 * @param {unknown} data
 * @param {L} itemsLabel
 * @param {(item: unknown) => T | undefined} callback
 * @param {(items: T[], data: Record<string, unknown>) => G} headersCallback
 * @returns {G[]}
 */
export function serialize(data, itemsLabel, callback, headersCallback) {
  if (Array.isArray(data) && data.some(shouldGroup)) {
    return data.map((group) => serializeGroup(group, itemsLabel, callback, headersCallback));
  }

  return [serializeGroup(data, itemsLabel, callback, headersCallback)];
}

/**
 * @template T
 * @template {string} L
 * @template {ItemsGroup<L, T>} G
 * @param {unknown} group
 * @param {L} itemsLabel
 * @param {(item: unknown) => T | undefined} callback
 * @param {(items: T[], data: Record<string, unknown>) => G} headersCallback
 * @returns {G}
 */
export function serializeGroup(group, itemsLabel, callback, headersCallback = null) {
  const items = [];
  if (Array.isArray(group)) items = group;
  else if (typeof group !== 'object') items = [group];
  else if (itemsLabel in group) items = group[itemsLabel];

  // invalid can be omitted returning undefined
  const prepared = items.map(callback).filter((v) => !!v);

  if (headersCallback) return headersCallback(group, prepared);
  return { [itemsLabel]: prepared };
}
