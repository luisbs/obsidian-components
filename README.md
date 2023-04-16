# [obsidian-components](https://github.com/luisbs/obsidian-components)

## Usage

### Inline names

Allows the user to use a **component** placing the name after the word `use` in the **Codeblock** first line (e.g. `use book`). Example:

```use book
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```

### In params

> **This behavior is disabled by default** and can be enabled by changing the _Codeblock usage method_ setting.

Allows the user to use a **component** placing the name as a value inside the **Codeblock**, by default with the `__name` param, but can be changed. Example:

```use
__name: book
title: 'The Great Gatsby'
author: 'F. Scott Fitzgerald'
```

### As custom Codeblocks

> **This behavior is disabled by default** and can be enabled with the _Enabled custom Codeblocks_ setting.

The **custom Codeblocks** allow a user to use **components** avoiding the `use` word. It uses the **components** custom names defined by the user instead. Example:

```book
title: 'Cien años de Soledad'
author: 'Gabriel García Márquez'
```

---

## Supported Syntax

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

Example:

```use book.cjs
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```

---

## Settings and other details

All the **Codeblocks** support the use of `JSON` too. Example:

```book
{
	"title": "Lord of the rings",
	"author": "J. R. Tolkien"
}
```

---

### Design mode

The design mode is a setting that can be enabled on the _SettingsTab_.

> **TL;DR** activate the _design mode_ when you're designing/editing the code of your components and want to see the result of those changes on _Obsidian_ on runtime.

The change when enable, is that each change on the component files are stored, that allows the plugin to refresh the view/rendered component on _Obsidian_, while you edit the file (**runtime reload**).

This feature is always disabled, until the user manually enables it, and when you close the app it returns to be disabled.

The reason of this behavior is because it can generate a lot of memory and storage usage (both are temporal until the app closes).

The reason for all of this is they way the plugin works, the plugin executes yout components code, with `require()` the plugin can't reload the changes on the components because in the first load they are loaded to memory and any new `require()` executions will return the same output, to allow hot-reload the plugin makes a temporal copy of the file with different names on each modification, and then loads those temporal files.

---

### Styling

Each component/codeblock is assigned two classes `component` and `<component-name>-component` (the component-name is the word you are using to reference the component)

> This examples are should be checked on _edit-mode_.

Example:

```use book

```

And

```use
__name: 'book'
```

And

```book

```

will all use `.component.book-component`

### About the components custom names

- Any character not alphanumeric nor underscore is going to be ignored, so the input `%%b$l-u.e+` is going to allow the word `blue` to reference that component.
- The characters on the regex `|;,\s` (whitespaces are included) can be use as separators, so the input `red|||green; blue    gray|,cyan` is a valid input, that will allow the words `red`, `green`, `blue`, `gray`, and `cyan` to reference that component.
