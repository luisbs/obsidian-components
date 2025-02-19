const tags = require('./tags.cjs');
const serialization = require('./serialization.cjs');

const URI = require('./uri.cjs');
const SERVICES = require('./services.cjs');

const Arr = require('./generics/Arr.cjs');
const Obj = require('./generics/Obj.cjs');
const Str = require('./generics/Str.cjs');

const Renderer = require('./renders/Renderer.cjs');
const HtmlRenderer = require('./renders/HtmlRenderer.cjs');
const CodeRenderer = require('./renders/CodeRenderer.cjs');

module.exports = {
    ...tags,
    ...serialization,

    URI,
    SERVICES,

    Arr,
    Obj,
    Str,

    Renderer,
    HtmlRenderer,
    CodeRenderer,
};
