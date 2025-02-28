import { Obj, Renderer, URI, serialize } from '../../esm/index.mjs';

/** @type {(notepath: string, items: unknown[]) => Promise<URIMetadata[]>} */
export async function serializeImages(notepath, images) {
    const prepared = [];
    for (const image of images) {
        if (Obj.isNil(image)) continue;

        let item = null;
        if (typeof image === 'string') item = await URI.getMetadata(image, notepath);
        else if (typeof image === 'object') item = await URI.getMetadata(image.url, notepath);
        if (item) prepared.push(item);
    }
    return prepared;
}

/** @type {(notepath: string, items: unknown[], data: Record<string, unknown>) => Promise<ImageGroupMetadata[]>} */
export async function serializeGroup(notepath, images, { label, title, link, artist }) {
    return {
        label: label || title || '',
        link: (await URI.getMetadata(link || artist, notepath)) || undefined,
        images: await serializeImages(notepath, images),
    };
}

/** @type {(notepath:string, input: unknown) => Promise<ImageGroupMetadata[]>} */
export async function serializeGallery(notepath, input) {
    return serialize(input, 'images', serializeGroup.bind(null, notepath));
}

/**
 * @param {ImageGroupMetadata} row
 * @param {Renderer} cardEl
 */
export function appendGalleryHeader(row, cardEl, HEADER_ATTRS = ['label', 'link']) {
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
