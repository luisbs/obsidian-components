# Usage

Check [support](./support.md) for details about **Components**.

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

> **This behavior is disabled by default** and can be enabled by changing the _'Codeblock usage method'_ setting.

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

## Styling

Each component/codeblock is assigned two classes `component` and `<component-name>-component` (the component-name is the word you are using to reference the component)

> This examples should be checked on _edit-mode_.

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

will all recive the `.component.book-component` css-class

---

## About the components custom names

- Any character not alphanumeric nor underscore is going to be ignored, so the input `%#b$l-u.e+` is going to allow the word `blue` to reference that component.
- The characters on the regex `|;,\s` (whitespaces are included) can be use as separators, so the input `red|||green; blue    gray|,cyan` is a valid input, that will allow the words `red`, `green`, `blue`, `gray`, and `cyan` to reference that component.
