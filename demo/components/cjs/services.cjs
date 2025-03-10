/**
 * @param {string} key
 * @returns {undefined | Record<'getShareUrl'|'getEmbedUrl'|'trim', (id: string) => string>}
 */
module.exports.getService = function (key) {
    if (key === 'spotify') return this.spotify;
    if (key === 'youtube') return this.youtube;
};

module.exports.spotify = {
    /**
     * @param {string} id
     * @example
     * - 'https://open.spotify.com/track/73XvHCzH9U0r9xjRll514x'
     * - 'https://open.spotify.com/album/3WDkuVqT1OfkTdCyYQ2gXa'
     */
    getShareUrl(id) {
        return 'https://open.spotify.com/' + this.trim(id);
    },

    /**
     * @param {string} id
     * @example
     * - 'https://open.spotify.com/embed/track/73XvHCzH9U0r9xjRll514x?utm_source=generator&theme=0'
     * - 'https://open.spotify.com/embed/album/3WDkuVqT1OfkTdCyYQ2gXa?utm_source=generator&theme=0'
     */
    getEmbedUrl(id) {
        return 'https://open.spotify.com/embed/' + this.trim(id);
    },

    /**
     * @param {string} url
     * @example
     * - **track links**
     * - 'https://open.spotify.com/track/73XvHCzH9U0r9xjRll514x'
     * - 'https://open.spotify.com/embed/track/73XvHCzH9U0r9xjRll514x'
     *
     * - **album links**
     * - 'https://open.spotify.com/album/3WDkuVqT1OfkTdCyYQ2gXa'
     * - 'https://open.spotify.com/embed/album/3WDkuVqT1OfkTdCyYQ2gXa'
     */
    trim(url) {
        if (typeof url !== 'string') return '';
        if (url.startsWith('http')) {
            url = url.replace(/^https?:\/\/open.spotify.com\/(embed\/)?/, '');
        }
        return url.includes('/') ? url : 'track/' + url;
    },
};

module.exports.youtube = {
    /**
     * @param {string} id
     * @example
     * - 'https://www.youtube.com/watch?v=ebsWLj7dHWo'
     */
    getShareUrl(id) {
        // return `https://youtu.be/${id}`; // ? shows ads
        return 'https://www.youtube.com/watch?v=' + this.trim(id);
    },

    /**
     * @param {string} id
     * @example
     * - 'https://www.youtube-nocookie.com/embed/ebsWLj7dHWo'
     */
    getEmbedUrl(id) {
        return 'https://www.youtube-nocookie.com/embed/' + this.trim(id);
    },

    /**
     * @param {string} url
     * @example
     * - 'ebsWLj7dHWo'
     * - 'https://youtu.be/ebsWLj7dHWo'
     * - 'https://www.youtube.com/watch?v=ebsWLj7dHWo'
     * - 'https://www.youtube.com/embed/ebsWLj7dHWo'
     * - 'https://www.youtube-nocookie.com/embed/ebsWLj7dHWo'
     */
    trim(url) {
        if (typeof url !== 'string') return '';
        if (!url.startsWith('http')) return url;

        // remove protocol and common domains
        url = url.replace(/^https?:\/\/(www\.)?(youtube(-nocookie)?\.com\/)?/, '');
        // remove specific url parts
        if (url.startsWith('youtu.be')) return url.replace(/^youtu.be\//, '');
        if (url.startsWith('watch')) return url.replace(/^watch\?v=/, '');
        if (url.startsWith('embed')) return url.replace(/^embed\//, '');

        return url;
    },
};
