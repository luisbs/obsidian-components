import { isNil } from './generics/Obj.mjs';

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
 * @param {(items: T[], data: Record<string, unknown>) => Promise<G>} callback
 * @returns {Promise<G[]>}
 */
export async function serialize(data, itemsLabel, callback) {
    if (!Array.isArray(data) || !data.some(shouldGroup.bind(null, itemsLabel))) {
        const prepared = [];
        prepared.push(await serializeGroup(data, itemsLabel, callback));
        return prepared;
    }

    const prepared = [];
    for (const group of data) {
        prepared.push(await serializeGroup(group, itemsLabel, callback));
    }
    return prepared;
}

/**
 * @template T
 * @template {string} L
 * @template {ItemsGroup<L, T>} G
 * @param {unknown} group
 * @param {L} itemsLabel
 * @param {(items: undefined[], data: Record<string, unknown>) => Promise<G>} callback
 * @returns {Promise<G>}
 */
export async function serializeGroup(group, itemsLabel, callback) {
    if (Array.isArray(group)) return callback(group, {});
    if (typeof group !== 'object') return callback([group], {});
    if (itemsLabel in group) return callback(group[itemsLabel], group);
    return callback([], group);
}
