const { Arr, HtmlRenderer, Obj, SERVICES, URI } = require('../cjs/index.cjs');
const { ATTRS, HEADER_ATTRS, LINKS_ATTRS, MEDIA_ATTRS } = require('./commons/music.cjs');

/**
 * @param {MusicMetadata} row
 * @param {Array<keyof MusicMetadata>} attrs
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

/** @param {MusicMetadata} row */
function innerCls(row) {
    return ['vault-soundtrack', row.link || row.links ? 'with-links' : ''];
}

/**
 * @param {unknown} input
 * @param {CodeblockContext} context
 */
module.exports.render = async function (input, context) {
    /** @type {MusicMetadata[]} */
    const data = Arr.wrap(input);
    // console.log({ input, data });

    const rootEl = new HtmlRenderer();
    for (const row of data) {
        const cardEl = rootEl.div(innerCls(row));

        // soundtrack-header
        for (const [divEl, attr, value] of iterate(
            row,
            HEADER_ATTRS,
            cardEl,
            'soundtrack-header',
        )) {
            divEl.el(attr.tag, value || attr.fallback || '');
        }

        // soundtrack-links
        for (const [divEl, attr, value] of iterate(row, LINKS_ATTRS, cardEl, 'soundtrack-links')) {
            // const service = SERVICES.getService(key);
            // if (service) {
            //   linksEl.link(service.getShareUrl(value), attr.text);
            // } else {
            divEl.link(value, URI.getURLDomain(value) || attr.text);
        }

        // soundtrack-media
        for (const [divEl, attr, value] of iterate(row, MEDIA_ATTRS, cardEl, 'soundtrack-media')) {
            const service = SERVICES.getService(key);
            divEl.iframe(service.getEmbedUrl(value));
        }
    }

    return rootEl.getContent();
};
