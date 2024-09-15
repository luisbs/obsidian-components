const { HtmlRenderer, Obj } = require('../cjs/index.cjs');
const { ATTRS, HEADER_ATTRS, serializeCharacters } = require('./commons/characters.cjs');

/**
 * @param {unknown} input
 * @param {string} notepath
 */
module.exports.render = async function (input, notepath) {
  const data = serializeCharacters(input);
  // console.log({ input, data });

  const containerEl = new HtmlRenderer('vault-characters-grid');
  for (const item of data.items) {
    const cardEl = containerEl.div();

    // character-header
    const headerEl = cardEl.div('character-header');
    for (const [key, value] of Obj.flattenEntries(item, HEADER_ATTRS)) {
      const attr = ATTRS.get(key) || {};
      headerEl.el(attr.tag, value);
    }

    cardEl.image(await item.url?.getSrc(notepath), item.name);

    // character-footer
    const footerEl = cardEl.div('character-footer');
    footerEl.ilink(item.link?.path, item.link?.label, 'internal-link');
  }

  return containerEl.getHtml();
};
