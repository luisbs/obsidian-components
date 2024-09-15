/** @type {Array<keyof ContentMetadata>} */
export const HEADER_ATTRS = ['label', 'title', 'alias'];
/** @type {Array<keyof ContentMetadata>} */
export const CHAPTERS_ATTRS = ['volumes', 'chapters', 'episodes', 'day'];
/** @type {Array<keyof ContentMetadata>} */
export const SUMMARY_ATTRS = ['comment', 'comments', 'summary'];
// prettier-ignore
/** @type {Array<keyof ContentMetadata>} */
export const DETAILS_ATTRS = ['rating', 'author', 'story', 'art', 'artist', 'mangaka', 'magazine', 'studio'];
// prettier-ignore
/** @type {Array<keyof ContentMetadata>} */
export const LINKS_ATTRS = ['website', 'mal', 'ap', 'fandom', 'mangadex', 'read', 'watch', 'sources', 'download'];

/** @type {Map<keyof ContentMetadata, MetadataField>} */
export const ATTRS = new Map([
  // header
  ['label', { tag: 'strong' }],
  ['title', { tag: 'h2', fallback: '«No Title»' }],
  ['alias', { tag: 'h6' }],
  ['tags', { tag: 'code' }],
  ['cover', { text: 'Cover' }],
  ['gallery', {}],

  // metadata
  ['art', { tag: 'code', text: 'Artist' }],
  ['story', { tag: 'code', text: 'Author' }],
  ['artist', { tag: 'code', text: 'Artist' }],
  ['author', { tag: 'code', text: 'Author' }],
  ['mangaka', { tag: 'code', text: 'Mangaka' }],
  ['magazine', { tag: 'code', text: 'Magazine' }],
  ['studio', { tag: 'code', text: 'Studio' }],

  // opinion
  ['rating', { tag: 'code' }],
  ['comment', { tag: 'code', text: 'Comments' }],
  ['comments', { tag: 'code', text: 'Comments' }],
  ['summary', { tag: 'blockquote', text: 'Summary' }],

  // progress
  ['day', { tag: 'code' }],
  ['volumes', { tag: 'code', text: ' Volumes' }],
  ['chapters', { tag: 'code', text: ' Chapters' }],
  ['episodes', { tag: 'code', text: ' Episodes' }],

  // links
  ['ap', { text: 'Anime Planet' }],
  ['mal', { text: 'My Anime List' }],
  ['fandom', { text: 'Fandom' }],
  ['website', { text: 'Official Site' }],
  ['mangadex', { text: 'MangaDex' }],

  ['read', { text: 'Read at {domain}' }],
  ['watch', { text: 'Watch at {domain}' }],
  ['sources', { text: 'Sources at {domain}' }],
  ['download', { text: 'Download from {domain}' }],
]);
