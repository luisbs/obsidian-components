const { CodeRenderer, Obj } = require('../cjs/index.cjs');
const { appendGalleryHeader, serializeGallery } = require('./commons/images.cjs');

/** @param {ImageGroupMetadata} row */
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
 * @param {CodeblockContext} context
 */
module.exports.render = async function (root, input, { notepath }) {
    const data = await serializeGallery(notepath, input);
    // console.log({ input, data });

    const rootEl = CodeRenderer.init(root);
    for (const row of data) {
        const containerEl = rootEl.div(innerCls(row));
        const galleryId = `gallery-${Obj.random()}`;

        // gallery-header
        appendGalleryHeader(row, containerEl);
        if (row.images.length < 1) continue;

        // gallery-content
        const galleryEl = containerEl.div('gallery-content');
        for (let i = 0; i < row.images.length; i++) {
            const mediaId = `${galleryId}-image-${Obj.random()}`;
            const media = row.images[i];

            // <div class="gallery-image">
            //   <input type="radio" id="mediaId" name="galleryId" checked/>
            //   <div>
            //     <span></span>
            //     <img src="" alt=""/>
            //   </div>
            //   <label for="mediaId"><img src="" alt=""/></label>
            // </div>

            const divEl = galleryEl.div('gallery-image');
            const inputEl = divEl.input('radio', galleryId, mediaId);
            if (i === 0) inputEl.checked = true;

            const mediaEl = divEl.div();
            if (media.label) mediaEl.el('span', media.label);
            if (media.isVideo) mediaEl.video(media.src, true);
            else mediaEl.image(media.src, media.label);

            const labelEl = divEl.label(mediaId);
            if (media.isVideo) labelEl.video(media.src, false);
            else labelEl.image(media.src, media.label);
        }
    }
};
