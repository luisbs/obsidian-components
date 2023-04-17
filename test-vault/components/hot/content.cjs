const { serializeInputForTable, ensureArray } = require('./common/array.cjs');
const {
  appendTBody,
  appendTHead,
  appendValuesArray,
  appendValues,
  appendLink,
} = require('./common/render.cjs');

/**
 * @typedef {Object} Column
 * @property {?string} text
 * @property {?('td'|'th')} tag
 * @property {?('center')} align
 * @property {?string[]} keys
 * @property {?('custom'|'image'|'link'|'iframe')} type
 * @property {?string} title  only for `image` type
 */

/**
 * @typedef {'ap'|'mal'|'tags'|'rating'|'label'|'title'|'cover'} CommonKeys
 * @typedef {'volumes'|'chapters'|'read'} MangaKeys
 * @typedef {'episodes'|'watch'|'sources'|'download'} AnimeKeys
 * @typedef {'summary'|'links'} CustomKeys
 * @typedef {CommonKeys|MangaKeys|AnimeKeys|CustomKeys} ColumnKey
 *
 * @typedef {Object} Row
 * @property {?number} volumes
 * @property {?number} chapters
 * @property {?number} episodes
 * @property {?string} rating
 * @property {?string|string[]} tags
 * @property {?string|string[]} label
 * @property {?string|string[]} title
 * @property {?string} ap
 * @property {?string} mal
 * @property {?string} read
 * @property {?string} watch
 * @property {?string} sources
 * @property {?string} download
 * @property {?string} cover
 */

/** @type {ColumnKey[]} */
const LINK_COLUMNS = ['read', 'watch', 'sources', 'download', 'ap', 'mal'];
/** @type {Record<string, Column>} */
const COLUMNS = {
  summary: { type: 'custom', text: 'Summary' },
  links: { type: 'custom', text: 'Links' },

  volumes: { text: 'Volumes' },
  chapters: { text: 'Chapters' },
  episodes: { text: 'Episodes' },
  label: { text: 'Label', tag: 'th' },
  title: { text: 'Title' },
  rating: { text: 'Rating' },
  tags: { text: 'Tags' },

  cover: { type: 'image', text: 'Cover', align: 'center' },
  ap: { type: 'link', text: 'Anime Planet', align: 'center' },
  mal: { type: 'link', text: 'My Anime List', align: 'center' },
  read: { type: 'link', text: 'Read', align: 'center' },
  watch: { type: 'link', text: 'Watch', align: 'center' },
  sources: { type: 'link', text: 'Sources', align: 'center' },
  download: { type: 'link', text: 'Download', align: 'center' },
};

/**
 * @param {HTMLTableCellElement} td
 * @param {ColumnKey} key
 * @param {Row} row
 */
module.exports.customRender = (td, key, row) => {
  if (key === 'summary') {
    // rating
    appendValuesArray(td, row.rating, (el, value) => el.append(value));

    // volumes, chapters & episodes
    appendValues(td, row, ['volumes', 'chapters', 'episodes'], (el, key) => {
      const code = el.createEl('code');
      code.append(`${row[key]} ${COLUMNS[key]?.text || ''}`);
    });

    // labels
    appendValuesArray(td, row.label, (el, value) => el.createEl('strong').append(value));

    // title
    appendValuesArray(td, row.title, (el, value) => el.append(value));

    // tags
    const tags = ensureArray(row.tags);
    if (tags.length) {
      const container = td.createEl('div');
      container.classList.add('flex-tags');
      tags.forEach((tag) => container.createEl('code').appendText(`#${tag}`));
    }

    //
  } else if (key === 'links') {
    return appendValues(td, row, LINK_COLUMNS, (el, key) => {
      return appendLink(el, row[key], COLUMNS[key]?.text || '');
    });
  }
};

/**
 * @param {HTMLElement} el
 * @param {Record<string, unknown>} input
 */
module.exports = (el, input) => {
  const { order, values } = serializeInputForTable([input], ['summary', 'links', 'cover']);

  const table = el.createEl('table');
  table.style.width = '100%';

  // appendTHead(table, order, COLUMNS);
  appendTBody(table, order, COLUMNS, values, this.customRender);
};
