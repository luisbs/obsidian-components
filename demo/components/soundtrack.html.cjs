const HtmlRenderer = require('./utility/HtmlRenderer.cjs');
const { music } = require('./common/music.cjs');

/** @param {MusicRow|MusicRow[]} input */
module.exports = (input) => {
  if (typeof input !== 'object' || input == null) return '';

  const renderer = new HtmlRenderer();
  music(renderer, 'cards-collection', 'vault-card music-card', input);
  return renderer.getHtml();
};
