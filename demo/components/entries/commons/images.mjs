import { Obj, Renderer, URI, serialize } from '../../esm/index.mjs';

/** @type {(image: unknown) => URIMetadata} */
export function serializeImage(image) {
  if (Obj.isNil(image)) return;
  if (typeof image === 'object') return URI.getMetadata(image.url);
  else if (typeof image === 'string') return URI.getMetadata(image);
}

/** @type {(items: URIMetadata[], data: Record<string, unknown>) => } */
export function serializeGroup(images, { label, title, link, artist }) {
  return {
    images,
    label: label || title || '',
    link: URI.getMetadata(link || artist) || undefined,
  };
}

/** @type {(input: unknown) => ImageGroupMetadata[]} */
export function serializeGallery(input) {
  return serialize(input, 'images', serializeImage, serializeGroup);
}

/**
 * @param {ImageGroupMetadata} row
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
        const value = value;
        headerEl.clink(value.src, value.label);
      }
    }
  }
}
