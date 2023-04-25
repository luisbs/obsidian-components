const { render } = require('./common/music.cjs');

/** @param {Row|Row[]} input */
module.exports = (input) => {
  if (typeof input !== 'object' || input == null) return '';
  return render('cards-list', 'vault-card music-card', input);
};
