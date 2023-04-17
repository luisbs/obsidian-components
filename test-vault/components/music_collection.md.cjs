const { render } = require('./common/music.cjs');

/** @param {Row|Row[]} input */
module.exports = (input) => {
  if (typeof input !== 'object' || input == null) return '';
  return render('cards-collection', 'vault-card music-card', input);
};
