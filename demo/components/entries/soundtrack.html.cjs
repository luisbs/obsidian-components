const { Arr, HtmlRenderer, Obj, SERVICES, URI } = require('../cjs/index.cjs');
const { ATTRS, HEADER_ATTRS, LINKS_ATTRS, MEDIA_ATTRS } = require('./commons/music.cjs');

/** @param {MusicMetadata} row */
function innerCls(row) {
  return [row.link || row.links ? 'with-links' : ''];
}

/** @param {unknown} input */
module.exports.render = function (input) {
  /** @type {MusicMetadata[]} */
  const data = Arr.wrap(input);
  // console.log({ input, data });

  const containerEl = new HtmlRenderer('vault-music-list');
  for (const row of data) {
    const cardEl = containerEl.div(innerCls(row));

    // music-header
    const headerEl = cardEl.div('music-header');
    for (const [key, value] of Obj.flattenEntries(row, HEADER_ATTRS)) {
      const attr = ATTRS.get(key) || {};
      headerEl.el(attr.tag, value || attr.fallback || '');
    }

    // music-links
    if (Obj.includes(row, LINKS_ATTRS)) {
      const linksEl = cardEl.div('music-links');
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

    // music-media
    const mediaEl = cardEl.div('music-media');
    for (const [key, value] of Obj.flattenEntries(row, MEDIA_ATTRS)) {
      const service = SERVICES.getService(key);
      mediaEl.iframe(service.getEmbedUrl(value));
    }
  }

  return containerEl.getHtml();
};
