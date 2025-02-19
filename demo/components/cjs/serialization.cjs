const { isNil } = require('./generics/Obj.cjs');

/** @type {(itemsLabel: string, item: unknown) => boolean} */
function shouldGroup(itemsLabel, item) {
    if (isNil(item)) return false;
    if (Array.isArray(item)) return true;
    return typeof item === 'object' && itemsLabel in item;
}

/**
 * Serialize the data into an standard object.
 *
 * @template T
 * @template {string} L
 * @template {ItemsGroup<L, T>} G
 * @param {unknown} data
 * @param {L} itemsLabel
 * @param {(item: unknown) => T | undefined} callback
 * @param {(items: T[], data: Record<string, unknown>) => G} headersCallback
 * @returns {G[]}
 */
function serialize(data, itemsLabel, callback, headersCallback) {
    if (Array.isArray(data) && data.some(shouldGroup.bind(null, itemsLabel))) {
        return data.map((group) => serializeGroup(group, itemsLabel, callback, headersCallback));
    }

    return [serializeGroup(data, itemsLabel, callback, headersCallback)];
}

/**
 * @template T
 * @template {string} L
 * @template {ItemsGroup<L, T>} G
 * @param {unknown} group
 * @param {L} itemsLabel
 * @param {(item: unknown) => T | undefined} callback
 * @param {(items: T[], data: Record<string, unknown>) => G} headersCallback
 * @returns {G}
 */
function serializeGroup(group, itemsLabel, callback, headersCallback = null) {
    let items = [];
    if (Array.isArray(group)) items = group;
    else if (typeof group !== 'object') items = [group];
    else if (itemsLabel in group) items = group[itemsLabel];

    // invalid can be omitted returning undefined
    const prepared = items.map(callback).filter((v) => !!v);

    if (headersCallback) return headersCallback(prepared, group);
    return { [itemsLabel]: prepared };
}

module.exports = { serialize, serializeGroup };
