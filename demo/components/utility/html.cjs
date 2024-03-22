const { wrap } = require('./array.cjs');

/**
 * @param   {string} wrapperCls
 * @param   {string|(record: Record<string, unknown>) => string} innerCls
 * @param   {Record<string, unknown>[]} records
 * @param   {(record: Record<string, unknown>, append: (str: string) => void) => void} cb
 * @returns {string}
 */
module.exports.collection = (wrapperCls, innerCls, records, cb) => {
  if (!Array.isArray(records)) records = [records];

  if (typeof innerCls === 'string') {
    return this.div(wrapperCls, (append) => {
      for (const record of records) {
        append(
          this.div(innerCls, (append2) => {
            cb(record, append2);
          })
        );
      }
    });
  }

  return this.div(wrapperCls, (append) => {
    for (const record of records) {
      append(
        this.div(innerCls(record) || '', (append2) => {
          cb(record, append2);
        })
      );
    }
  });
};

/**
 * @param   {string} cls
 * @param   {string[]} keys
 * @param   {Record<string, unknown>} record
 * @param   {(key: string, value: unknown) => string} format
 * @returns {string}
 */
module.exports.group = (cls, keys, record, format) => {
  return this.div(cls, (append) => {
    for (const key of keys) {
      if (!(key in record)) continue;
      wrap(record[key]).forEach((value) => {
        append(format(key, value));
      });
    }
  });
};

/**
 * @param   {string} tag
 * @param   {string|string[]} content
 * @param   {?string} cls
 * @returns {string}
 */
module.exports.h = (tag, content, cls) => {
  if (typeof content !== 'string') content = JSON.stringify(content);
  if (cls) return `<${tag} class="${cls}">${content}</${tag}>`;
  return `<${tag}>${content}</${tag}>`;
};

/**
 * @param   {string} output
 * @param   {string} cls
 * @param   {(append: (str: string) => void) => void} cb
 * @returns {string}
 */
module.exports.div = (cls, cb) => {
  let content = `<div class="${cls}">`;
  cb((str) => (content += str));
  return content + '</div>';
};

/**
 * @param   {string} src
 * @param   {string} title
 * @param   {?string} cls
 * @returns {string}
 */
module.exports.img = (src, title, cls) => {
  if (cls) return `<img class="${cls}" src="${src}" title="${title}" />`;
  return `<img src="${src}" title="${title}" />`;
};

/**
 * @param   {string} url
 * @param   {string} text
 * @param   {?string} cls
 * @returns {string}
 */
module.exports.link = (url, text, cls) => {
  if (cls) return `<a class="${cls}" href="${url}">${text}</a>`;
  return `<a href="${url}">${text}</a>`;
};

/**
 * @param   {string} src
 * @param   {?string} cls
 * @returns {string}
 */
module.exports.iframe = (src, cls) => {
  const attrs = 'width="100%" height="80" frameBorder="0" allow="encrypted-media; fullscreen"';
  if (cls) return `<iframe class="${cls}" ${attrs} src="${src}"></iframe>`;
  return `<iframe ${attrs} src="${src}"></iframe>`;
};
