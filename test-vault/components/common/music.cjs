const { toArray } = require('../utility/array.cjs');
const { collection, group, h, iframe, link, div } = require('../utility/html.cjs');
const { Spotify, Youtube } = require('../utility/online_services.cjs');

/**
 * @typedef {Object} Column
 * @property {?string} tag
 * @property {?string} text
 * @property {?string} fallback
 *
 * @typedef {Object} Row
 * @property {?string|string[]} label
 * @property {?string|string[]} title
 * @property {?string|string[]} author
 * @property {?string} link
 * @property {?string[]} links
 * @property {?string|string[]} spotify
 * @property {?string|string[]} youtube
 * @property {?string} iframe
 *
 * @typedef {keyof Row} ColumnKey
 */

/** @type {Record<ColumnKey, Column>} */
const ATTRS = {
  label: { tag: 'strong' },
  title: { tag: 'h6', fallback: '«No Title»' },
  author: { tag: 'span' },

  link: { text: 'Link' },
  iframe: { text: 'Embed' },
  spotify: { text: 'on Spotify' },
  youtube: { text: 'on Youtube' },
};

/** @type {ColumnKey[]} */
const HEADER_ATTRS = ['label', 'title', 'author'];
/** @type {ColumnKey[]} */
const LINKS_ATTRS = ['spotify', 'youtube', 'link', 'links'];

module.exports = { ATTRS, HEADER_ATTRS, LINKS_ATTRS };

//
//
//

/**
 * @param {string} wrapperCls
 * @param {string|(record: Record<string, unknown>) => string} innerCls
 * @param {Row|Row[]} input
 */
module.exports.render = (wrapperCls, innerCls, input) => {
  if (typeof input !== 'object' || !input) return '';

  return collection(wrapperCls, innerCls, input, (record, append) => {
    // header
    append(
      group('card-header', HEADER_ATTRS, record, (key, value) => {
        const attr = ATTRS[key] || {};
        return h(attr.tag, value || attr.fallback || '');
      })
    );

    // iframe
    append(
      div('card-media', (append2) => {
        for (const value of toArray(record['spotify'])) {
          append2(iframe(Spotify.getEmbedUrl(value)));
        }
        for (const value of toArray(record['youtube'])) {
          append2(iframe(Youtube.getEmbedUrl(value)));
        }
      })
    );

    // links
    append(
      group('card-links', LINKS_ATTRS, record, (key, value) => {
        const attr = ATTRS[key] || {};
        if (key === 'spotify') return link(Spotify.getShareUrl(value), attr.text);
        if (key === 'youtube') return link(Youtube.getShareUrl(value), attr.text);

        const text = value.replace(/^https?:\/\//, '').split('/')[0] || attr.text;
        return link(value, text);
      })
    );
  });
};
