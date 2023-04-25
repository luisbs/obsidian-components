const { toArray } = require('../utility/array.cjs');
const { collection, group, h, img, link, div } = require('../utility/html.cjs');

/**
 * @typedef {Object} Column
 * @property {?string} tag
 * @property {?string} text
 * @property {?string} fallback
 *
 * @typedef {Object} Row
 * @property {?string} day
 * @property {?number} volumes
 * @property {?number} chapters
 * @property {?number} episodes
 * @property {?string} rating
 * @property {?string|string[]} tags
 * @property {?string|string[]} label
 * @property {?string|string[]} title
 * @property {?string|string[]} alias
 * @property {?string} ap
 * @property {?string} mal
 * @property {?string} read
 * @property {?string} watch
 * @property {?string} sources
 * @property {?string} download
 * @property {?string} cover
 *
 * @typedef {keyof Row} ColumnKey
 */

/** @type {Record<ColumnKey, Column>} */
const ATTRS = {
  day: {},
  volumes: { text: 'Volumes' },
  chapters: { text: 'Chapters' },
  episodes: { text: 'Episodes' },

  author: { text: 'Author' },
  studio: { text: 'Studio' },
  magazine: { text: 'Magazine' },

  label: { tag: 'strong' },
  title: { tag: 'h2', fallback: '«No Title»' },
  alias: { tag: 'h6' },
  rating: { tag: 'code' },
  tags: { tag: 'code' },
  cover: { text: 'Cover' },

  // links
  ap: { text: 'Anime Planet' },
  mal: { text: 'My Anime List' },
  read: { text: 'Read' },
  watch: { text: 'Watch' },
  sources: { text: 'Sources' },
  download: { text: 'Download' },
};

/** @type {ColumnKey[]} */
const HEADER_ATTRS = ['label', 'title', 'alias', 'rating'];
/** @type {ColumnKey[]} */
const PROGRES_ATTRS = ['volumes', 'chapters', 'episodes'];
/** @type {ColumnKey[]} */
const METADATA_ATTRS = ['day', 'author', 'studio', 'magazine'];
/** @type {ColumnKey[]} */
const LINKS_ATTRS = ['read', 'watch', 'sources', 'download', 'ap', 'mal'];

const SUMMARY_ATTRS = [...PROGRES_ATTRS, ...METADATA_ATTRS];

module.exports = { ATTRS, HEADER_ATTRS, PROGRES_ATTRS, METADATA_ATTRS, LINKS_ATTRS, SUMMARY_ATTRS };

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

    // tags
    if ('tags' in record) {
      append(
        div('card-tags', (append2) => {
          for (const tag of toArray(record['tags'])) {
            append2(h('code', `#${tag}`));
          }
        })
      );
    }

    // cover
    if ((record['cover'] || '').length > 0) {
      append(
        div('card-media', (append2) => {
          const attr = ATTRS['cover'] || {};
          append2(img(record['cover'], record.title || attr.text || ''));
        })
      );
    }

    console.log('c');

    // summary
    if (SUMMARY_ATTRS.some((key) => key in record)) {
      append(
        group('card-summary', SUMMARY_ATTRS, record, (key, value) => {
          const label = ATTRS[key]?.text || key;
          return PROGRES_ATTRS.includes(key) //
            ? h('code', `${value} ${label}`)
            : h('span', `${label}: ${value}`);
        })
      );
    }

    // links
    if (LINKS_ATTRS.some((key) => key in record)) {
      append(
        group('card-links', LINKS_ATTRS, record, (key, value) => {
          const attr = ATTRS[key] || {};
          return link(value, attr.text);
        })
      );
    }
  });
};
