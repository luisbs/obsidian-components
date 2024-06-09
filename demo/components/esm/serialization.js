import { Obj } from './generics/index.js';
import { getURIMetadata } from './uri.js';

/**
 * Serialize the data into an standard object.
 *
 * @template T
 * @template {string} L
 * @param {unknown} data
 * @param {L} itemsLabel
 * @param {(item: unknown) => T} callback
 * @returns {SerializedGroup<T, L>[]>[]}
 */
export function serialize(data, itemsLabel, callback) {
  const shouldGroup = (item) => {
    return !Obj.isNil(item) && typeof item === 'object' && itemsLabel in item;
  };

  if (Array.isArray(data) && data.some(shouldGroup)) {
    return data.map((group) => serializeGroup(group, itemsLabel, callback));
  }

  return [serializeGroup(data, itemsLabel, callback)];
}

/**
 * @template T
 * @template {string} L
 * @param {unknown} group
 * @param {L} itemsLabel
 * @param {(item: unknown) => T} callback
 * @returns {SerializedGroup<T, L>}
 */
export function serializeGroup(group, itemsLabel, callback) {
  const prepare = (items) => items.map(callback).filter((v) => !!v);

  if (Array.isArray(group)) {
    return { label: '', [itemsLabel]: prepare(group) };
  }

  if (typeof group === 'object' && itemsLabel in group) {
    return { label: group.label || '', [itemsLabel]: prepare(group[itemsLabel]) };
  }

  return { label: '', [itemsLabel]: prepare([group]) };
}

/**
 * @param {unknown} input
 * @returns {SerializedGroup<ImgData, 'images'>[]}
 */
export function serializeImages(input) {
  return serialize(input, 'images', (item) => {
    if (Obj.isNil(item)) return;

    if (typeof item === 'object') {
      const meta = getURIMetadata(item.url);
      return {
        url: meta?.getSrc() || '',
        title: item.title || meta?.label || '',
        width: item.width || meta?.getSize() || '1',
        isVideo: meta?.isVideo() || false,
      };
    }

    if (typeof item === 'string') {
      const meta = getURIMetadata(item);
      return {
        url: meta?.getSrc() || '',
        title: meta?.label || '',
        width: meta?.getSize() || '1',
        isVideo: meta?.isVideo() || false,
      };
    }
  });
}
