import { HtmlRenderer } from '../esm/index.mjs';
import { appendGalleryHeader, serializeGallery } from './commons/images.mjs';

/** @param {SerializedGroup<ImageGroupMetadata, 'images'>} row */
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
    if (row.images.length < 1) return;

    // gallery-content
    const galleryEl = cardEl.div('gallery-content');
    for (const media of row.images) {
      const mediaSrc = await media.getSrc(notepath);
      const mediaLabel = media.getLabel();

      const mediaEl = galleryEl.div(['gallery-grid-image', `w${media.getSize() || 1}`]);
      if (media.hasLabel()) mediaEl.el('span', mediaLabel);
      if (media.isVideo()) mediaEl.video(mediaSrc, true);
      else mediaEl.image(mediaSrc, mediaLabel);
    }
  }

  return containerEl.getHtml();
}
