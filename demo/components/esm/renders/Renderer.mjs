/**
 * // @typedef {string | string[]; //| (() => string | string[])} ClassDefinition
 * @typedef {string | string[]} ClassDefinition
 */

/** @template T */
export default class Renderer {
    /**
     * Append an element.
     *
     * @param {T} el
     * @returns {T}
     */
    append(el) {
        throw Error('Not implemented');
    }

    /**
     * Creates and appends a `div` element.
     *
     * @param {ClassDefinition} cls
     * @returns {Renderer<T>}
     */
    div(cls) {
        throw Error('Not implemented');
    }

    //#region Detached Methods

    /**
     * Create a detached element.
     *
     * @template {keyof HTMLElementTagNameMap} K
     * @param {K} tag
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @param {string} style
     * @returns {T extends string ? string : HTMLElementTagNameMap[K]}
     */
    createEl(tag, content, cls = null, style = null) {
        throw Error('Not implemented');
    }

    /**
     * Create a detached `image` element.
     *
     * @param {string} src
     * @param {string} title
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLImageElement}
     */
    createImage(src, title = 'image', cls = null) {
        throw Error('Not implemented');
    }

    /**
     * Create a detached `video` element.
     *
     * @param {string} src
     * @param {boolean} withControls
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLVideoElement}
     */
    createVideo(src, withControls = true, cls = null) {
        throw Error('Not implemented');
    }

    /**
     * Create a detached `iframe` element.
     *
     * @param {string} src
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLIFrameElement}
     */
    createIframe(src, cls = null) {
        throw Error('Not implemented');
    }

    /**
     * Create a detached `link` element.
     *
     * @param {string} url
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLLinkElement}
     */
    createLink(url, content, cls = null) {
        throw Error('Not implemented');
    }

    /**
     * Create a detached internal `link`.
     *
     * @param {string} resource
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLLinkElement}
     */
    createInternalLink(resource, content, cls = null) {
        throw Error('Not implemented');
    }

    /**
     * Create a detached `code` element inside an internal `link`.
     *
     * @param {string} resource
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLLinkElement}
     */
    createCodeLink(resource, content, cls = null) {
        return this.createInternalLink(
            resource,
            this.createEl('code', content, cls),
            'internal-link',
        );
    }

    //#endregion

    //#region Attaching Methods

    /**
     * Append an element.
     *
     * @template {keyof HTMLElementTagNameMap} K
     * @param {K} tag
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @param {string} style
     * @returns {T extends string ? string : HTMLElementTagNameMap[K]}
     */
    el(tag, content, cls = null, style = null) {
        return this.append(this.createEl(tag, content, cls, style));
    }

    /**
     * Append an `image` element.
     *
     * @param {string} src
     * @param {string} title
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLImageElement}
     */
    image(src, title = 'image', cls = null) {
        return this.append(this.createImage(src, title, cls));
    }

    /**
     * Append a `video` element.
     *
     * @param {string} src
     * @param {boolean} withControls
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLVideoElement}
     */
    video(src, withControls = true, cls = null) {
        return this.append(this.createVideo(src, withControls, cls));
    }

    /**
     * Append an `iframe` element.
     *
     * @param {string} src
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLIFrameElement}
     */
    iframe(src, cls = null) {
        return this.append(this.createIframe(src, cls));
    }

    /**
     * Append a `link` element.
     *
     * @param {string} url
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLLinkElement}
     */
    link(url, content, cls = null) {
        return this.append(this.createLink(url, content, cls));
    }

    /**
     * Append an internal `link`.
     *
     * @param {string} resource
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLLinkElement}
     */
    ilink(resource, content, cls = null) {
        return this.append(this.createInternalLink(resource, content, cls));
    }

    /**
     * Append a `code` element inside an internal `link`.
     *
     * @param {string} resource
     * @param {unknown} content
     * @param {ClassDefinition} cls
     * @returns {T extends string ? string : HTMLLinkElement}
     */
    clink(resource, content, cls = null) {
        return this.append(this.createCodeLink(resource, content, cls));
    }

    //#endregion

    /**
     * Normalize css classes.
     *
     * @param {string[]} classess
     * @returns {string[]}
     */
    clearClassess(...classess) {
        const valid = [];
        for (const cls of classess) {
            if (Array.isArray(cls)) {
                cls.forEach((c) => typeof c === 'string' && c && valid.push(c));
            } else if (typeof cls === 'string') {
                cls.split(/\s+/gi).forEach((c) => c && valid.push(c));
            }
        }
        return valid;
    }
}
