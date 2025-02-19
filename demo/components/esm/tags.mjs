const rating = ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐'];

const status = ['publishing', 'finished', 'airing', 'aired', 'reading', 'read'];

const type = ['light_novel', 'manga', 'anime'];

const target = ['kodomo', 'shounen', 'shoujo', 'josei', 'seinen'];

const genre = [
    'parody',
    'comedy',

    'slice_of_life',
    'drama',
    'romance',
    'ecchi',

    'adventure',
    'action',
    'sports',

    'mystery',
    'horror',
    'gore',

    'fantasy',
    'sci_fy',
];

export function tagsCleaner(...tags) {
    const valid = [];

    // cleanup
    for (const tag of tags) {
        if (typeof tag === 'string') {
            tag.split(/\s+/gi).forEach((tag1) => tag1 && valid.push(tag1));
        } else if (Array.isArray(tag)) {
            tag.forEach((tag1) => tag1 && valid.push(tag1));
        } else if (tag) {
            valid.push(JSON.stringify(tag));
        }
    }

    // rewriting
    return valid.map((tag) => {
        // especial treatment for seasons
        if (/^\d/gi.test(tag)) return '#season/' + tag;

        // keep nested
        if (tag.contains('/')) return '#' + tag;

        // nest simples
        if (rating.contains(tag)) return '#rating/' + tag;
        if (status.contains(tag)) return '#status/' + tag;
        if (type.contains(tag)) return '#type/' + tag;
        if (target.contains(tag)) return '#target/' + tag;
        if (genre.contains(tag)) return '#genre/' + tag;
        return '#theme/' + tag;
    });
}
