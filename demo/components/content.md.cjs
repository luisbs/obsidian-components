const { render } = require('./common/content.cjs');

/** @param {Row|Row[]} input */
module.exports = (input) => {
  if (typeof input !== 'object' || input == null) return '';
  return render(
    'cards-list',
    (record) => {
      return typeof record['cover'] === 'string' //
        ? 'vault-card content-card'
        : 'vault-card content-card simple-content-card';
    },
    input
  );
};
// d
