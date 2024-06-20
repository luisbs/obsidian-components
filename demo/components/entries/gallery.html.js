import { Obj, HtmlRenderer, serializeImages } from '../esm/index.js';

/** @typedef {SerializedGroup<ImgData, 'images'>} Row */

/** @param {Row} row */
function innerCls(row) {
  return ['vault-card', 'gallery-card', row.label ? 'with-header' : ''];
}

/** @param {unknown} input */
export default function render(input) {
  const data = serializeImages(input);
  // console.log({ input, data });

  const containerEl = new HtmlRenderer('cards-list');
  for (const row of data) {
    const cardEl = containerEl.div(innerCls(row));

    // card-header
    if (Obj.includes(row, 'label')) {
      const headerEl = cardEl.div('card-header');
      for (const [_, value] of Obj.flattenEntries(row, 'label')) {
        headerEl.el('h2', value);
      }
    }

    if (row.images.length < 1) return;

    // card-gallery
    const galleryEl = cardEl.div('card-gallery');
    for (const media of row.images) {
      const imgEl = galleryEl.div(['gallery-image', `w${media.width}`]);
      if (media.isVideo) imgEl.video(media.url, media.title);
      else imgEl.image(media.url, media.title);
      imgEl.el('span', media.title);
    }
  }

  return containerEl.getHtml();
}
