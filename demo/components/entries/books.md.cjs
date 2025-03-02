/**
 * @template T
 * @template E
 * @typedef {Object} Result see https://github.com/blacksmithgu/obsidian-dataview/blob/master/src/api/result.ts#L2
 * @property {boolean} successful
 * @property {T} value
 */
/**
 * @typedef {Object} TableResult see https://github.com/blacksmithgu/obsidian-dataview/blob/master/src/api/plugin-api.ts#L585
 * @property {"table"} type
 * @property {string[]} headers
 * @property {unknown[][]} values
 */

/**
 * @param {Result<TableResult, string>} input
 * @param {CodeblockContext} context
 */
module.exports.render = function (input, { notepath }) {
    if (!input.successful) return '> No results';
    // return `<pre>${JSON.stringify(input.value)}</pre>`;

    // fields may come on diferent orders
    const titleIndex = input.value.headers.indexOf('title');
    const authorIndex = input.value.headers.indexOf('author');

    const result = [];
    for (const row of input.value.values) {
        result.push(`- Book «_**${row[titleIndex]}**_» was wrote by _**${row[authorIndex]}**_`);
    }

    return result.join('\n');
};
