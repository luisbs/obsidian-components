const { onEach, stringify } = require('../utility/types.cjs');
const { normalizeURI } = require('../utility/filesystem.cjs');
const { match: tagCleaner } = require('../utility/tags.cjs');
const Renderer = require('../utility/Renderer.cjs');
const { serializeGroup, serializeItem } = require('./gallery.cjs');

/**
 * @typedef {keyof ContentRow} ColumnKey
 */

/** @type {Record<ColumnKey, Column>} */
const ATTRS = {
  // header
  label: { tag: 'strong' },
  title: { tag: 'h2', fallback: '«No Title»' },
  alias: { tag: 'h6' },
  tags: { tag: 'code' },
  cover: { text: 'Cover' },
  gallery: {},

  // metadata
  art: { tag: 'code', text: 'Ilustrator' },
  story: { tag: 'code', text: 'Author' },
  mangaka: { tag: 'code', text: 'Mangaka' },
  author: { tag: 'code', text: 'Author' },
  studio: { tag: 'code', text: 'Studio' },
  magazine: { tag: 'code', text: 'Magazine' },

  // opinion
  rating: { tag: 'code' },
  comment: { tag: 'code', text: 'Comments' },
  comments: { tag: 'code', text: 'Comments' },

  // progress
  day: { tag: 'code' },
  volumes: { tag: 'code', text: ' Volumes' },
  chapters: { tag: 'code', text: ' Chapters' },
  episodes: { tag: 'code', text: ' Episodes' },

  // links
  ap: { text: 'Anime Planet' },
  mal: { text: 'My Anime List' },
  mangadex: { text: 'MangaDex' },

  read: { text: 'Read' },
  watch: { text: 'Watch' },
  sources: { text: 'Sources' },
  download: { text: 'Download' },
};

/** @type {ColumnKey[]} */
const HEADER_ATTRS = ['label', 'title', 'alias'];
/** @type {ColumnKey[]} */
const METADATA_ATTRS = ['author', 'story', 'art', 'mangaka', 'magazine', 'studio'];
/** @type {ColumnKey[]} */
const OPINION_ATTRS = ['rating', 'comment', 'comments'];
/** @type {ColumnKey[]} */
const PROGRESS_ATTRS = ['volumes', 'chapters', 'episodes', 'day'];
/** @type {ColumnKey[]} */
const LINKS_ATTRS = ['read', 'watch', 'sources', 'download', 'ap', 'mal', 'mangadex'];
/** @type {ColumnKey[]} */
const DETAILS_ATTRS = ['rating', ...METADATA_ATTRS, ...OPINION_ATTRS];
module.exports = {
  ATTRS,
  HEADER_ATTRS,
  METADATA_ATTRS,
  OPINION_ATTRS,
  PROGRESS_ATTRS,
  LINKS_ATTRS,
  DETAILS_ATTRS,
};

/**
 * @param {Renderer} render
 * @param {string} wrapperCls
 * @param {string|(record: ComponentData) => string} innerCls
 * @param {ContentRow|ContentRow[]} input
 */
module.exports.content = (render, wrapperCls, innerCls, input) => {
  if (!(render instanceof Renderer)) return;
  if (typeof input !== 'object' || !input) return;
  // TODO: agregar elemento cuando no hay conenido que mostrar

  render.collection(wrapperCls, innerCls, input, (record) => {
    render.group('card-header', HEADER_ATTRS, record, (key, value) => {
      const attr = ATTRS[key] || {};
      onEach(value, (val) => render.el(attr.tag, val || attr.fallback || ''));
    });

    render.group('card-tags', ['tags'], record, (_, value) => {
      onEach(tagCleaner(value), (tag) => render.ilink(tag, tag, 'tag'));
    });

    render.group('card-details', DETAILS_ATTRS, record, (key, value) => {
      const attr = ATTRS[key] || {};

      if (!METADATA_ATTRS.includes(key)) {
        render.el(attr.tag, value, 'lb-sky');
        return;
      }

      render.div(null, () => {
        render.el('span', (attr?.text || key) + ': ');
        onEach(value, (val) => render.clink(val, val, 'lb-sky'));
      });
    });

    render.group('card-summary', PROGRESS_ATTRS, record, (key, value) => {
      const attr = ATTRS[key] || {};
      render.el(attr.tag, `${value}${stringify(attr.text)}`, 'lb-pink');
    });

    render.group('card-links', LINKS_ATTRS, record, (key, value) => {
      onEach(value, (val) => render.link(val, ATTRS[key]?.text));
    });

    const images = serializeGroup(record.gallery).images;
    const cover = serializeItem(record.cover) || (images.length === 1 && images[0]) || null;
    if (cover) {
      render.div('card-cover', () => {
        // used as background to easier size manipulation
        render.el('div', null, null, `background-image: url('${cover.url}')`);
        render.image(cover.url, cover.title);
        render.el('span', cover.title);
      });
    }

    if (images.length > 1) {
      render.div('card-gallery', () => {
        render.div(null, () => {
          onEach(images, (image) => {
            render.div('gallery-image w' + image.width, () => {
              render.image(normalizeURI(image.url), image.title);
              render.el('span', image.title);
            });
          });
        });
      });
    }
  });
};
