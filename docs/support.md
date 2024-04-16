## Supported Codeblocks Syntax

The plugin supports 2 syntax for defining data, it should be writen in a standard way

- **YAML** uses the obsidian [`parseYaml()`](https://docs.obsidian.md/Reference/TypeScript+API/parseYaml) method.

> ````md
> ```yaml
> param1: 'value1'
> # ...
> ```
> ````

- **JSON** uses the standard [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) method.

> ````md
> ```json
> {
>   "param1": "value1"
>   // ...
> }
> ```
> ````

## Supported Components Syntax

Each supported syntax can be enabled as a `format` on the settings. The formats defines how each **component file** is handled.

### HTML Components

The `html` components:

1. Reads the **content of the file as plain text**.
2. Replaces the placeholders like `{{ key_name_1 }}` _(allows only alphanumeric and underscores)_ with the correspending parameter on the **Codeblock**.
3. Injects the replaced string as the `innerHTML` of the element.

### Markdown Components

The `markdown` components:

1. Reads the **content of the file as plain text**.
2. Replaces the placeholders like `{{ key_name_1 }}` _(allows only alphanumeric and underscores)_ with the correspending parameter on the **Codeblock**.
3. Injects the replaced string into the **Codeblock** using the obsidian `MarkdownRenderer.renderMarkdown()` method.

### Javascript Components

The javascript-based components use the **content of the file as CommonJS Modules**. They check if _default export_ is a **function** to use; if not it checks if the module contains a `render` function to use.

#### Javascript-HTML Components

The `javascript_html` components:

1. Calls the `render` function waiting for a string to be returned (the `render` function will recive a _javascript object_ parsed from the content of the **Codeblock**).
2. Injects the returned string as the `innerHTML` of the element.

#### Javascript-Markdown Components

The `javascript_markdown` components:

1. Calls the `render` function waiting for a string to be returned (the `render` function will recive a _javascript object_ parsed from the content of the **Codeblock**).
2. Injects the returned string into the **Codeblock** using the obsidian `MarkdownRenderer.renderMarkdown()` method.

#### Javascript-code Components

The `javascript_code` components:

1. Calls the `render` funcion with:
   - A `HTMLElement` as first param.
   - A `javascript object` as second param (parsed from the content of the **Codeblock**).
