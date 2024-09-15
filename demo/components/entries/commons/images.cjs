const { Obj, Renderer, URI, serialize } = require('../../cjs/index.cjs');

/**
 * @param {unknown} image
 * @returns {URIMetadata}
 */
module.exports.serializeImage = function (image) {
  if (Obj.isNil(image)) return;
  if (typeof image === 'object') return URI.getURIMetadata(image.url);
  else if (typeof image === 'string') return URI.getURIMetadata(image);
};

/**
 * @param {unknown} input
 * @returns {SerializedGroup<URIMetadata, 'images'>[]}
 */
module.exports.serializeGallery = function (input) {
  return serialize(input, 'images', this.serializeImage, ({ title: label, artist }, images) => {
    if (artist) return { label, link: URI.getURIMetadata(artist), images };
    return { label, images };
  });
};

/**
 * @param {SerializedGroup<ImageMetadata, 'images'>} row
 * @param {Renderer} cardEl
 */
module.exports.appendGalleryHeader = async function (
  row,
  cardEl,
  HEADER_ATTRS = ['label', 'link']
) {
  // card-header
  if (Obj.includes(row, HEADER_ATTRS)) {
    const headerEl = cardEl.div('gallery-header');
    for (const [key, value] of Obj.flattenEntries(row, HEADER_ATTRS)) {
      if (key === 'label') headerEl.el('h2', value);
      else if (key === 'link') {
        /** @type {URIMetadata} */
        // const value = value
        headerEl.clink(await value.getSrc(), value.label);
      }
    }
  }
};
