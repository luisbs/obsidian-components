const { CodeRenderer, Obj } = require('../cjs/index.cjs');
const { appendGalleryHeader, serializeGallery } = require('./commons/images.cjs');

/** @param {SerializedGroup<ImageGroupMetadata, 'images'>} row */
function innerCls(row) {
  return [
    'vault-gallery',
    'vault-gallery-side',
    row.label ? 'with-header' : '',
    row.images.length < 7 ? 'c2' : row.images.length < 16 ? 'c3' : 'c4',
  ];
}

/**
 * @param {HTMLElement} root
 * @param {unknown} input
 * @param {string} notepath
 */
module.exports.render = async function (root, input, notepath) {
  const data = serializeGallery(input);
  console.log({ input, data });

  for (const row of data) {
    const containerEl = new CodeRenderer(root, innerCls(row));
    const galleryId = `gallery-${Obj.random()}`;

    // gallery-header
    await appendGalleryHeader(row, containerEl);
    if (row.images.length < 1) continue;

    // gallery-content
    const galleryEl = containerEl.div('gallery-content');
    for (let i = 0; i < row.images.length; i++) {
      const itemId = `${galleryId}-image-${Obj.random()}`;
      const media = row.images[i];
      const mediaSrc = await media.getSrc(notepath);
      const mediaLabel = media.getLabel() || '';

      // <div>
      //   <input type="radio" id="img-1" name="gallery" checked/>
      //   <img src="example.jpg" alt=""/>
      //   <label for="img-1"><img src="example.jpg" alt=""/></label>
      // </div>

      const divEl = galleryEl.div('gallery-image');
      const inputEl = divEl.input('radio', galleryId, itemId);
      if (i === 0) inputEl.checked = true;

      const mediaEl = divEl.div();
      if (media.hasLabel()) mediaEl.el('span', mediaLabel);
      if (media.isVideo()) mediaEl.video(mediaSrc, true);
      else mediaEl.image(mediaSrc, mediaLabel);

      const labelEl = divEl.label(itemId);
      if (media.isVideo()) labelEl.video(mediaSrc, false);
      else labelEl.image(mediaSrc, mediaLabel);
    }
  }
};
