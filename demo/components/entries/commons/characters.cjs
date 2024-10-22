const { Obj, URI, serializeGroup } = require('../../cjs/index.cjs');

/** @type {Array<keyof CharacterMetadata>} */
module.exports.HEADER_ATTRS = ['alias', 'name'];

/** @type {Map<keyof CharacterMetadata, MetadataField>} */
module.exports.ATTRS = new Map([
  // header
  ['alias', { tag: 'h6' }],
  ['name', { tag: 'h3' }],
]);

/**
 * @param {unknown} input
 * @returns {ItemsGroup<'items', CharacterMetadata>}
 */
module.exports.serializeCharacters = function (input) {
  return serializeGroup(input, 'items', (item) => {
    if (Obj.isNil(item)) return;

    if (typeof item === 'string') {
      const meta = URI.getMetadata(item.url);
      return { url: meta, link: meta, name: meta?.label };
    }
    if (typeof item === 'object') {
      return {
        url: URI.getMetadata(item.url),
        link: URI.getMetadata(item.link),
        name: item.name,
        alias: item.alias,
      };
    }
  });
};
