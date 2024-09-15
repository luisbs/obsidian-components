/** @type {Array<keyof MusicMetadata>} */
export const HEADER_ATTRS = ['label', 'title', 'author', 'artist'];
/** @type {Array<keyof MusicMetadata>} */
export const LINKS_ATTRS = ['link', 'links'];
/** @type {Array<keyof MusicMetadata>} */
export const MEDIA_ATTRS = ['spotify', 'youtube'];

/** @type {Map<keyof MusicMetadata, MetadataField>} */
export const ATTRS = new Map([
  // header
  ['label', { tag: 'strong' }],
  ['title', { tag: 'h6', fallback: '«No Title»' }],
  ['author', { tag: 'span' }],
  ['artist', { tag: 'span' }],

  // links
  ['spotify', { text: 'on Spotify' }],
  ['youtube', { text: 'on Youtube' }],
  ['iframe', { text: 'Embed' }],
  ['links', { text: 'Link' }],
  ['link', { text: 'Link' }],
]);
