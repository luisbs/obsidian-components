const HtmlRenderer = require('./utility/HtmlRenderer.cjs');
const { content } = require('./common/content.cjs');

/** @param {ContentRow|ContentRow[]} input */
module.exports = (input) => {
  if (typeof input !== 'object' || input == null) return '';

  /** @param {ContentRow} record */
  const cardCls = (item) => {
    const has_cover = item.cover || typeof item.gallery === 'string' || item.gallery?.length === 1;
    return 'vault-card content-card' + (has_cover ? ' with-cover' : '');
  };

  const renderer = new HtmlRenderer();
  content(renderer, 'cards-list', cardCls, input);
  return renderer.getHtml();
};
