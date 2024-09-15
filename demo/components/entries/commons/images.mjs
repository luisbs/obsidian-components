import { Obj, Renderer, URI, serialize } from '../../esm/index.js';

/**
 * @param {unknown} image
 * @returns {URIMetadata}
 */
export function serializeImage(image) {
  if (Obj.isNil(image)) return;
  if (typeof image === 'object') return URI.getURIMetadata(image.url);
  else if (typeof image === 'string') return URI.getURIMetadata(image);
}

/**
 * @param {unknown} input
 * @returns {SerializedGroup<URIMetadata, 'images'>[]}
 */
export function serializeGallery(input) {
  return serialize(input, 'images', serializeImage, ({ title: label, artist }, images) => {
    if (artist) return { label, link: URI.getURIMetadata(artist), images };
    return { label, images };
  });
}

/**
 * @param {SerializedGroup<ImageMetadata, 'images'>} row
 * @param {Renderer} cardEl
 */
export async function appendGalleryHeader(row, cardEl, HEADER_ATTRS = ['label', 'link']) {
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
}
