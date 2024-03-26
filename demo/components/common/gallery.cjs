const { onEach, isNil } = require('../utility/types.cjs');
const { normalizeURI } = require('../utility/filesystem.cjs');
const Renderer = require('../utility/Renderer.cjs');

/**
 * Stripe url params.
 *
 * @param {string} url
 * @returns {string}
 */
module.exports.strip = (url) => {
  return url.replace(/\?.*/gi, '');
};

/**
 * Extracts the title of an image.
 *
 * @param {string} url
 * @returns {string}
 */
module.exports.title = (url) => {
  const [path, ...params] = url.split(/[?&]/gi);

  if (params.length === 1 && !params[0].includes('=')) {
    return params[0];
  }

  for (const param of params) {
    if (/^(title|label|name)=/gi.test(param)) {
      return param.split('=').pop() || '';
    }
  }

  // no params, use path filename
  return path.split(/[\\/]/gi).pop() || '';
};

/**
 * Extracts the width of an image.
 *
 * @param {string} url
 * @returns {string}
 */
module.exports.width = (url) => {
  const [_, ...params] = url.split(/[?&]/gi);

  if (params.length === 1 && !params[0].includes('=')) {
    return params[0].replace(/^(width|size|w|s)/gi, '');
  }

  for (const param of params) {
    if (/^(width|size|w|s)=/gi.test(param)) {
      return param.split('=').pop() || '1';
    }
  }

  // no params, use path filename
  return '1';
};

/**
 * @param {unknown} item
 * @returns {GalleryRow|undefined}
 */
module.exports.serializeItem = (item) => {
  if (isNil(item)) return;
  if (typeof item === 'object') {
    return {
      title: item.title || '',
      width: this.width(item.width || item.url),
      url: this.strip(item.url || ''),
    };
  }
  if (typeof item === 'string') {
    return { title: this.title(item), width: this.width(item), url: this.strip(item) };
  }
};

/**
 * @param {unknown} group
 * @returns {{ label: string?, images: GalleryRow[] }}
 */
module.exports.serializeGroup = (group) => {
  const prepare = (images) => images.map(this.serializeItem).filter((v) => !!v);

  if (Array.isArray(group)) {
    return { label: '', images: prepare(group) };
  }
  if (typeof group === 'object' && group?.images) {
    return { label: group.label || '', images: prepare(group.images) };
  }
  return { label: '', images: prepare([group]) };
};

/**
 * Serialize the data into an standard object.
 *
 * @param {unknown} data
 * @returns {Array<{ label: string?, images: GalleryRow[] }>}
 */
module.exports.serialize = (data) => {
  if (Array.isArray(data) && data.some((item) => !isNil(item) && typeof item === 'object')) {
    return data.map(this.serializeGroup);
  }
  return this.serializeGroup(data);

  // if (!Array.isArray(data)) data = [data];
  // if (data.some(Array.isArray)) {
  //   return data.map(this.serializeGroup);
  // }
  // return this.serializeGroup(data);
};

//
//
//

/**
 * @param {Renderer} render
 * @param {string} wrapperCls
 * @param {string|(record: ComponentData) => string} innerCls
 * @param {ContentRow|ContentRow[]} input
 */
module.exports.gallery = (render, wrapperCls, innerCls, input) => {
  if (!(render instanceof Renderer)) return;
  // console.log(input);
  // console.log(this.serialize(input));

  render.collection(wrapperCls, innerCls, this.serialize(input), (group) => {
    render.group('card-header', ['label'], group, (_, value) => {
      onEach(value, (val) => render.el('h2', val));
    });

    render.div('card-gallery', () => {
      onEach(group.images, (image) => {
        render.div('gallery-image w' + image.width, () => {
          render.image(normalizeURI(image.url), image.title);
          render.el('span', image.title);
        });
      });
    });
  });
};
