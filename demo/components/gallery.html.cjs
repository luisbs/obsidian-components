const HtmlRenderer = require('./utility/HtmlRenderer.cjs');
const { gallery } = require('./common/gallery.cjs');

/** @param {unknown} input */
module.exports = (input) => {
  const renderer = new HtmlRenderer();
  gallery(
    renderer,
    'cards-list',
    (group) => 'vault-card gallery-card' + (group.label ? ' with-header' : ''),
    input
  );

  return renderer.getHtml();
};
