import { Obj } from './generics/index.js';

/**
 * Serialize the data into an standard object.
 *
 * @template T
 * @template {string} L
 * @param {unknown} data
 * @param {L} itemsLabel
 * @param {(item: unknown) => T} callback
 * @param {(item: unknown, items: T) => SerializedGroup<T, L>} headersCallback
 * @returns {SerializedGroup<T, L>[]>[]}
 */
export function serialize(data, itemsLabel, callback, headersCallback) {
  const shouldGroup = (item) => {
    if (Obj.isNil(item)) return false;
    if (Array.isArray(item)) return true;
    return typeof item === 'object' && item[itemsLabel];
  };

  if (Array.isArray(data) && data.some(shouldGroup)) {
    return data.map((group) => serializeGroup(group, itemsLabel, callback, headersCallback));
  }

  return [serializeGroup(data, itemsLabel, callback, headersCallback)];
}

/**
 * @template T
 * @template {string} L
 * @param {unknown} group
 * @param {L} itemsLabel
 * @param {(item: unknown) => T} callback
 * @param {(item: unknown, items: T) => SerializedGroup<T, L>} headersCallback
 * @returns {SerializedGroup<T, L>}
 */
export function serializeGroup(group, itemsLabel, callback, headersCallback = null) {
  const prepare = (items) => items.map(callback).filter((v) => !!v);

  if (Array.isArray(group)) {
    return { label: '', [itemsLabel]: prepare(group) };
  }

  if (typeof group === 'object' && itemsLabel in group) {
    if (headersCallback) {
      return headersCallback(group, prepare(group[itemsLabel]));
    } else {
      return { label: group.label || '', [itemsLabel]: prepare(group[itemsLabel]) };
    }
  }

  return { label: '', [itemsLabel]: prepare([group]) };
}
