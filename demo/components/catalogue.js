import { Obj, CodeRenderer, serializeImages } from './esm/index.js';

/** @typedef {SerializedGroup<ImgData, 'images'>} Row */

/** @param {Row} row */
function innerCls(row) {
  const size = row.images.length;
  return [
    'vault-card',
    'catalogue-card',
    row.label ? 'with-header' : '',
    size < 7 ? 'c2' : size < 16 ? 'c3' : 'c4',
  ];
}

/** @param {unknown} input */
export default function render(root, input) {
  const data = serializeImages(input);
  // console.log({ input, data });

  const containerEl = new CodeRenderer(root, 'cards-list');
  for (const row of data) {
    const cardEl = containerEl.div(innerCls(row));
    const id = Obj.random();

    // card-header
    if (Obj.includes(row, 'label')) {
      const header = cardEl.div('card-header');
      for (const [_, value] of Obj.flattenEntries(row, 'label')) {
        header.el('h2', value);
      }
    }

    if (row.images.length < 1) return;
    const first = row.images[0];

    // main image
    const sliderEl = cardEl.div('card-catalogue-main');
    const mainEl = sliderEl.image(first.url, first.title);

    // option images
    const optsEl = cardEl.div('card-catalogue-options');
    for (const media of row.images) {
      const labelEl = optsEl.el('label');
      labelEl.append(optsEl.createImage(media.url, media.title));

      const radio = labelEl.createEl('input');
      radio.type = 'radio';
      radio.name = `catalogue-option-${id}`;
      radio.id = media.url;
      radio.on('change', 'input', (_) => {
        mainEl.title = media.title;
        mainEl.src = media.url;
      });
    }
  }
}
