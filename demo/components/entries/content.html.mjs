import { Arr, HtmlRenderer, Obj, URI, tagsCleaner } from '../esm/index.mjs';
import { ATTRS, HEADER_ATTRS, CHAPTERS_ATTRS, LINKS_ATTRS } from './commons/content.mjs';

/**
 * @param {ContentMetadata} row
 * @param {Array<keyof ContentMetadata>} attrs
 * @param {HTMLElement} parentEl
 * @param {string} divClass
 * @returns {Iterable<[HtmlRenderer, MetadataField, unknown]>}
 */
function* iterate(row, attrs, parentEl, divClass) {
    if (!Obj.includes(row, attrs)) return;

    const divEl = parentEl.div(divClass);
    for (const [key, value] of Obj.flattenEntries(row, attrs)) {
        yield [divEl, ATTRS.get(key) || {}, value];
    }
}

/** @param {ContentMetadata} row */
function innerCls(row) {
    return ['vault-content', row.cover ? 'with-cover' : ''];
}

/**
 * @param {unknown} input
 * @param {CodeblockContext} context
 */
export default function render(input, { notepath }) {
    /** @type {ContentMetadata[]} */
    const data = Arr.wrap(input);
    // console.log({ input, data });

    const rootEl = new HtmlRenderer();
    for (const row of data) {
        const cardEl = rootEl.div(innerCls(row));

        // content-tags
        if (Obj.includes(row, 'tags')) {
            const tagsEl = cardEl.div('content-tags');
            for (const tag of tagsCleaner(row['tags'])) {
                tagsEl.ilink(tag, tag, 'tag');
            }
        }

        // content-header
        for (const [divEl, attr, value] of iterate(row, HEADER_ATTRS, cardEl, 'content-header')) {
            divEl.el(attr.tag, value || attr.fallback || '');
        }

        // content-chapters
        for (const [divEl, attr, value] of iterate(
            row,
            CHAPTERS_ATTRS,
            cardEl,
            'content-chapters',
        )) {
            divEl.el(attr.tag, attr.text?.replace('{value}', value), 'lb-teal');
        }

        // content-links
        for (const [divEl, attr, value] of iterate(row, LINKS_ATTRS, cardEl, 'content-links')) {
            divEl.link(value, attr.text?.replace('{domain}', URI.getURLDomain(value)));
        }

        // content-cover
        const cover = URI.getMetadata(row.cover, notepath);
        if (cover) {
            // used as background for easier size manipulation
            const coverEl = cardEl.div('content-cover');
            coverEl.el('div', null, null, `background-image: url('${cover.src}')`);
            coverEl.image(cover.src, cover.label);
        }
    }

    return rootEl.getContent();
}
