const { split, onEach, isNil } = require('../utility/types.cjs');
const ONLINE = require('../utility/online_services.cjs');
const Renderer = require('../utility/Renderer.cjs');

/**
 * @typedef {keyof MusicRow} ColumnKey
 */

/** @type {Record<ColumnKey, Column>} */
const ATTRS = {
  // header
  label: { tag: 'strong' },
  title: { tag: 'h6', fallback: '«No Title»' },
  author: { tag: 'span' },

  // links
  spotify: { text: 'on Spotify' },
  youtube: { text: 'on Youtube' },
  iframe: { text: 'Embed' },
  links: { text: 'Link' },
  link: { text: 'Link' },
};

/** @type {ColumnKey[]} */
const HEADER_ATTRS = ['label', 'title', 'author'];
/** @type {ColumnKey[]} */
const LINKS_ATTRS = ['spotify', 'youtube', 'link', 'links'];
module.exports = { ATTRS, HEADER_ATTRS, LINKS_ATTRS };

/**
 * @param {Renderer} render
 * @param {string} wrapperCls
 * @param {string|(record: ComponentData) => string} innerCls
 * @param {MusicRow|MusicRow[]} input
 */
module.exports.music = (render, wrapperCls, innerCls, input) => {
  if (typeof input !== 'object' || !input) return;
  // TODO: agregar elemento cuando no hay conenido que mostrar

  render.collection(wrapperCls, innerCls, input, (record) => {
    render.group('card-header', HEADER_ATTRS, record, (key, value) => {
      const attr = ATTRS[key] || {};
      render.el(attr.tag, value || attr.fallback || '');
    });

    render.group('card-links', LINKS_ATTRS, record, (key, value) => {
      const attr = ATTRS[key] || {};

      const service = ONLINE[key];
      if (!isNil(service)) {
        onEach(split(value), (val) => render.link(service.getShareUrl(val), attr.text));
      } else {
        onEach(split(value), (val) => {
          render.link(val, value.replace(/^https?:\/\//, '').split('/')[0] || attr.text);
        });
      }
    });

    render.group('card-media', ['spotify', 'youtube'], record, (key, value) => {
      onEach(split(value), (val) => render.iframe(ONLINE[key].getEmbedUrl(val)));
    });
  });
};
