const { Arr, HtmlRenderer, Obj, SERVICES, URI } = require('../cjs/index.cjs');
const { ATTRS, HEADER_ATTRS, LINKS_ATTRS, MEDIA_ATTRS } = require('./commons/music.cjs');

/** @param {MusicMetadata} row */
function innerCls(row) {
  return ['vault-soundtrack', row.link || row.links ? 'with-links' : ''];
}

/**
 * @param {unknown} input
 * @param {string} notepath
 */
module.exports.render = async function (input) {
  /** @type {MusicMetadata[]} */
  const data = Arr.wrap(input);
  // console.log({ input, data });

  const rootEl = new HtmlRenderer();
  for (const row of data) {
    const cardEl = rootEl.div(innerCls(row));

    // soundtrack-header
    const headerEl = cardEl.div('soundtrack-header');
    for (const [key, value] of Obj.flattenEntries(row, HEADER_ATTRS)) {
      const attr = ATTRS.get(key) || {};
      headerEl.el(attr.tag, value || attr.fallback || '');
    }

    // soundtrack-links
    if (Obj.includes(row, LINKS_ATTRS)) {
      const linksEl = cardEl.div('soundtrack-links');
      for (const [key, value] of Obj.flattenEntries(row, LINKS_ATTRS)) {
        const attr = ATTRS.get(key) || {};
        // const service = SERVICES.getService(key);
        // if (service) {
        //   linksEl.link(service.getShareUrl(value), attr.text);
        // } else {
        const label = URI.getURLDomain(value) || attr.text;
        linksEl.link(value, label);
      }
    }

    // soundtrack-media
    const mediaEl = cardEl.div('soundtrack-media');
    for (const [key, value] of Obj.flattenEntries(row, MEDIA_ATTRS)) {
      const service = SERVICES.getService(key);
      mediaEl.iframe(service.getEmbedUrl(value));
    }
  }

  return rootEl.getContent();
};
