import { CodeRenderer } from '../esm/index.mjs';
import { appendGalleryHeader, serializeGallery } from './commons/images.mjs';

/** @param {ImageGroupMetadata} row */
function innerCls(row) {
    return ['vault-gallery', 'vault-gallery-grid', row.label ? 'with-header' : ''];
}

/**
 * @param {HTMLElement} root
 * @param {unknown} input
 * @param {CodeblockContext} context
 */
export default async function render(root, input, { notepath }) {
    const data = await serializeGallery(notepath, input);
    // console.log({ input, data });

    const rootEl = CodeRenderer.init(root);
    for (const row of data) {
        const containerEl = rootEl.div(innerCls(row));

        // gallery-header
        appendGalleryHeader(row, containerEl);
        if (row.images.length < 1) continue;

        // gallery-content
        const galleryEl = containerEl.div('gallery-content');
        for (const media of row.images) {
            // <div class="card-image w1">
            //   <span></span>
            //   <img src="" alt=""/>
            // </div>

            const mediaEl = galleryEl.div(['gallery-image', `w${media.size}`]);
            if (media.label) mediaEl.el('span', media.label);
            if (media.isVideo) mediaEl.video(media.src, true);
            else mediaEl.image(media.src, media.label);
        }
    }
}
