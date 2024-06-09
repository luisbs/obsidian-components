const generics = require('./generics/index.cjs');
const serialization = require('./serialization.cjs');

const services = require('./services.cjs');
const tags = require('./tags.cjs');

const URI = require('./uri.cjs');
const Renderer = require('./renders/Renderer.cjs');
const HtmlRenderer = require('./renders/HtmlRenderer.cjs');
const CodeRenderer = require('./renders/CodeRenderer.cjs');

module.exports = {
  ...generics,
  ...serialization,

  ...services,
  ...tags,

  URI,
  Renderer,
  HtmlRenderer,
  CodeRenderer,
};
