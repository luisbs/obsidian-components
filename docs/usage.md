# Usage

## Codeblock syntax

All the **Codeblocks** support the use of `YAML` and `JSON`. So the next to **Codeblocks** will generate the same output.

````yaml
```use book
title: Lord of the rings
author: J. R. Tolkien
```
````

````json
```use book
{
	"title": "Lord of the rings",
	"author": "J. R. Tolkien"
}
```
````

### Inline names

Allows the user to use a **component** placing the name after the word `use` in the **Codeblock** first line (e.g. `use book`). Example:

````yaml
```use book
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```
````

### In params

> **This behavior is disabled by default** and can be enabled by changing the _Codeblock usage method_ setting.

Allows the user to use a **component** placing the name as a value inside the **Codeblock**, by default with the `__name` param, but can be changed. Example:

````yaml
```use
__name: book
title: 'The Great Gatsby'
author: 'F. Scott Fitzgerald'
```
````

### As custom Codeblocks

> **This behavior is disabled by default** and can be enabled with the [Custom Codeblocks Setting](./settings.md#custom-codeblocks-setting).

The **custom Codeblocks** allow a user to use **components** avoiding the `use` word. It uses the **components** custom names defined by the user instead. Example:

````yaml
```book
title: 'Cien años de Soledad'
author: 'Gabriel García Márquez'
```
````

---

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

#### Javascript_HTML Components

The `javascript_html` components:

1. Calls the `render` function waiting for a string to be returned (the `render` function will recive a _javascript object_ parsed from the content of the **Codeblock**).
2. Injects the returned string as the `innerHTML` of the element.

#### Javascript_Markdown Components

The `javascript_markdown` components:

1. Calls the `render` function waiting for a string to be returned (the `render` function will recive a _javascript object_ parsed from the content of the **Codeblock**).
2. Injects the returned string into the **Codeblock** using the obsidian `MarkdownRenderer.renderMarkdown()` method.

#### Javascript_code Components

The `javascript_code` components:

1. Calls the `render` funcion with:
   - A `HTMLElement` as first param.
   - A `javascript object` as second param (parsed from the content of the **Codeblock**).

Example:

````yaml
```use book.cjs
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```
````

## m

## Styling

Each component/codeblock is assigned two classes `component` and `<component-name>-component` (the component-name is the word you are using to reference the component)

> This examples are should be checked on _edit-mode_.

Example:

````yaml
```use book
```
````

And

````yaml
```use
__name: 'book'
```
````

And

````yaml
```book
```
````

will all use `.component.book-component`
