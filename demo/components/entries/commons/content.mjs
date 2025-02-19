/** @type {Array<keyof ContentMetadata>} */
export const HEADER_ATTRS = ['label', 'title', 'alias'];
/** @type {Array<keyof ContentMetadata>} */
export const CHAPTERS_ATTRS = ['volumes', 'chapters', 'episodes'];
/** @type {Array<keyof ContentMetadata>} */
export const LINKS_ATTRS = ['mal', 'ap'];

/** @type {Map<keyof ContentMetadata, MetadataField>} */
export const ATTRS = new Map([
    ['label', { tag: 'strong' }],
    ['title', { tag: 'h2', fallback: '«No Title»' }],
    ['alias', { tag: 'h6' }],
    ['tags', { tag: 'code' }],
    ['cover', { text: 'Cover' }],

    // chapters
    ['volumes', { tag: 'code', text: '{value} Volumes' }],
    ['chapters', { tag: 'code', text: '{value} Chapters' }],
    ['episodes', { tag: 'code', text: '{value} Episodes' }],

    // links
    ['ap', { text: 'Anime Planet' }],
    ['mal', { text: 'My Anime List' }],
]);
