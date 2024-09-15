import { Obj, URI, serializeGroup } from '../../esm/index.js';

/** @type {Array<keyof CharacterMetadata>} */
export const HEADER_ATTRS = ['alias', 'name'];

/** @type {Map<keyof CharacterMetadata, MetadataField>} */
export const ATTRS = new Map([
  // header
  ['alias', { tag: 'h6' }],
  ['name', { tag: 'h3' }],
]);

/**
 * @param {unknown} input
 * @returns {SerializedGroup<CharacterMetadata, 'items'>}
 */
export function serializeCharacters(input) {
  return serializeGroup(input, 'items', (item) => {
    if (Obj.isNil(item)) return;

    if (typeof item === 'object') {
      return {
        url: URI.getURIMetadata(item.url),
        link: URI.getURIMetadata(item.link),
        name: item.name,
        alias: item.alias,
      };
    }

    if (typeof item === 'string') {
      const meta = URI.getURIMetadata(item.url);
      return { url: meta, link: meta, name: meta?.label };
    }
  });
}
