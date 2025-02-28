const { isNil } = require('../generics/Obj.cjs');
const Renderer = require('./Renderer.cjs');

/** @typedef {import('./Renderer.js').ClassDefinition} ClassDefinition */

/** @extends {Renderer<HTMLElement>} */
module.exports = class CodeRenderer extends Renderer {
    /** @type {HTMLElement} */
    #container;

    /** @type {HTMLElement} */
    static init(rootEl) {
        const child = new CodeRenderer();
        child.#container = rootEl;
        return child;
    }

    /** @type {Renderer<HTMLElement>['append']} */
    append(el) {
        this.#container.append(el);
    }

    /**
     * @param   {ClassDefinition} cls
     * @returns {CodeRenderer}
     */
    div(cls) {
        const child = new CodeRenderer();
        child.#container = this.#container.createDiv();
        child.#container.addClasses(this.clearClassess(cls));
        return child;
    }

    /**
     * Append a `label` element.
     *
     * @param {string} id
     * @param {ClassDefinition} cls
     * @returns {CodeRenderer}
     */
    label(id, cls = null) {
        const child = new CodeRenderer();
        child.#container = this.#container.createEl('label');
        child.#container.addClasses(this.clearClassess(cls));
        child.#container.htmlFor = id;
        return child;
    }

    /**
     * Append an `input` element.
     *
     * @param {string} type
     * @param {string} name
     * @param {string} id
     * @param {ClassDefinition} cls
     * @returns {HTMLInputElement}
     */
    input(type, name, id, cls = null) {
        const input = this.createEl('input', null, cls);
        input.type = type;
        input.name = name;
        input.id = id;

        this.append(input);
        return input;
    }

    //#region Detached Methods

    /** @type {Renderer<HTMLElement>['createEl']} */
    createEl(tag = 'span', content, cls = null, style = '') {
        const el = createEl(tag);
        el.addClasses(this.clearClassess(cls));
        el.style.all = style;

        // content
        if (isNil(content)) return el;

        if (Array.isArray(content)) el.append(...content);
        else el.append(content);

        return el;
    }

    /** @type {Renderer<HTMLElement>['createImage']} */
    createImage(src, title = 'image', cls = null) {
        const image = this.createEl('img', null, cls);
        image.title = title;
        image.src = src;
        image.dataset.src = src;
        return image;
    }

    /** @type {Renderer<HTMLElement>['createVideo']} */
    createVideo(src, withControls = true, cls = null) {
        const video = this.createEl('video', null, cls);
        if (withControls) video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.src = src;
        return video;
    }

    /** @type {Renderer<HTMLElement>['createIframe']} */
    createIframe(src, cls = null) {
        const iframe = this.createEl('iframe', null, cls);
        iframe.width = '100%';
        iframe.height = '80';
        iframe.frameBorder = '0';
        iframe.allow = 'encrypted-media; fullscreen';
        iframe.src = src;
        return iframe;
    }

    /** @type {Renderer<HTMLElement>['createLink']} */
    createLink(url, content, cls = null) {
        const link = this.createEl('a', content, cls);
        link.href = url;
        return link;
    }

    /** @type {Renderer<HTMLElement>['createInternalLink']} */
    createInternalLink(resource, content, cls = null) {
        const link = this.createEl('a', content, cls);
        link.dataset.href = resource;
        link.href = resource;
        link.target = '_blank';
        link.rel = 'noopener';
        return link;
    }

    //#endregion
};
