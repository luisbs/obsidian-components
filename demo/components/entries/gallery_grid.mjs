import { HtmlRenderer } from '../esm/index.mjs';
import { appendGalleryHeader, serializeGallery } from './commons/images.mjs';

/** @param {ImageGroupMetadata} row */
function innerCls(row) {
  return ['vault-gallery', 'vault-gallery-grid', row.label ? 'with-header' : ''];
}

/**
 * @param {unknown} input
 * @param {string} notepath
 */
export default async function render(input, notepath) {
  const data = serializeGallery(input);
  // console.log({ input, data });

  const containerEl = new HtmlRenderer();
  for (const row of data) {
    const cardEl = containerEl.div(innerCls(row));

    // gallery-header
    await appendGalleryHeader(row, cardEl);
    if (row.images.length < 1) continue;

    // gallery-content
    const galleryEl = cardEl.div('gallery-content');
    for (const media of row.images) {
      const mediaEl = galleryEl.div(['gallery-grid-image', `w${media.size}`]);
      if (media.label) mediaEl.el('span', media.label);
      if (media.isVideo) mediaEl.video(media.src, true);
      else mediaEl.image(media.src, media.label);
    }
  }

  return containerEl.getHtml();
}
