const { callOnArray } = require('./array.cjs');

/**
 * @typedef {Object} Column
 * @property {?string} text
 * @property {?('td'|'th')} tag
 * @property {?('center')} align
 * @property {?string[]} keys
 * @property {?('custom'|'image'|'link'|'iframe')} type
 * @property {?string} title  only for `image` type
 */

//#region Text

/**
 * @param  {HTMLElement} el
 * @param  {Record<string,unknown>} row
 * @param  {string[]} keys
 * @param  {(el: HTMLElement, key: string) => void} render
 * @return {void}
 */
module.exports.appendValues = (el, row, keys, render) => {
  for (const key of keys) {
    if (!(key in row)) continue;
    if (el.hasChildNodes()) el.createEl('br');
    render(el, key);
  }
};
/**
 * @param  {HTMLElement} el
 * @param  {unknown} values
 * @param  {(el: HTMLElement, key: string) => void} render
 * @return {void}
 */
module.exports.appendValuesArray = (el, values, render) => {
  callOnArray(values, (value) => {
    if (!value) return;
    if (el.hasChildNodes()) el.createEl('br');
    render(el, value);
  });
};

//#endregion

//#region Especial types

/**
 * @param {HTMLElement} parent
 * @param {string} url
 * @param {string} text
 */
module.exports.appendLink = (parent, url, text) => {
  const link = parent.createEl('a');
  link.href = url;
  link.setText(text);
};
/**
 * @param {HTMLElement} parent
 * @param {string} src
 * @param {string} title
 */
module.exports.appendImage = (parent, src, title = 'image') => {
  const img = parent.createEl('img');
  img.title = title;
  img.src = src;
};
/**
 * @param {HTMLElement} parent
 * @param {string} src
 */
module.exports.appendIframe = (parent, src) => {
  const iframe = parent.createEl('iframe');
  iframe.width = '100%';
  iframe.height = '80';
  iframe.frameBorder = '0';
  iframe.allow = 'encrypted-media; fullscreen';
  iframe.src = src;
};

//#endregion

/**
 * @param {HTMLTableElement} table
 * @param {string[]} columnsOrder
 * @param {Record<string, Column>} columns
 */
module.exports.appendTHead = (table, columnsOrder, columns) => {
  const thead = table.createEl('thead');
  const tr = thead.createEl('tr');

  for (const key of columnsOrder) {
    const { text, align } = columns[key];

    const th = tr.createEl('th');
    th.appendText(text);

    if (align) th.style.textAlign = align;
  }
};

/**
 * @param {HTMLTableElement} table
 * @param {string[]} columnsOrder
 * @param {Record<string, Column>} columns
 * @param {Record<string, undefined>[]} rows
 * @param {(td: HTMLTableCellElement, key: string, row: Record<string, undefined>) => void} render
 */
module.exports.appendTBody = (table, columnsOrder, columns, rows, render) => {
  const tbody = table.createEl('tbody');

  for (const row of rows) {
    const tr = tbody.createEl('tr');

    for (const key of columnsOrder) {
      const col = columns[key];

      // avoid empty rows
      if (row.rowspan === 0) continue;

      const td = tr.createEl(col.tag || 'td');
      if (col.align) td.style.textAlign = col.align;
      if (row.rowspan > 1) td.rowSpan = row.rowspan;

      // render custom column cell
      if (col.type === 'custom') {
        render(td, key, row);
        continue;
      }

      // if not is custom but the value is not found do nothing
      if (!row[key]) continue;

      // render link column cell
      if (col.type === 'link') {
        this.appendLink(td, row[key], col.text);
        continue;
      }

      // render image column cell
      if (col.type === 'image') {
        this.appendImage(td, row[key], col.title);
        continue;
      }

      // render iframe column cell
      if (col.type === 'iframe') {
        this.appendIframe(td, row[key]);
        continue;
      }

      // render simple columns cell
      this.appendValuesArray(td, row[key], (el, v) => el.appendText(v));
    }
  }
};
