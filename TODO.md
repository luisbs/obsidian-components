# obsidian-component

## Features for v1.0.0

- [x] Add a real documentation.
- [x] Add settings page to control all the plugin variables.
- [x] Add granular control over which component are allow to run.
- [x] Add error feedback.
- [x] Add alternative to inline component name method.
- [x] Reload the component when the file is updated
- [x] Add support for custom codeblocks name.
- [x] Isolate the html related component formats to custom renders.
- [x] Change all the references of the name **fragment** to **component** for better naming
- [x] Change the 3way-switch into a select input for a simplier design.
- [x] Isolate the plugin state out of the plugin settings.
- [x] Add a setting to allow the user to set the the parameters to use on names

## Things to fix

- [ ] El selector de carpeta, tiene el fondo transparente.
- [x] La pagina de settings no se actualiza correctamente al cambiar la configuracion en la tabla de componentes.
- [ ] La tabla de componentes no se actualiza al cambiar la tabla de formatos.
- [ ] Cambiar la forma en que se cargan los archivos js, la forma actual (cargando el archivo directamente) carga el codigo a memoria, y si se hacen cambios al archivo estos no son actualizados en la version de la memoria, eso genera que los cambios hechos en caliente (con obsidian abierto) no se tomen en cuenta.
  - Idea: sacar hash del archivo (para poder identificar cuando cambia) y hacer un clone del archivo cambiando el nombre con cada actualizacion (eso hace que sean archivos distintos) antes de cargar el archivo a memoria.
  - Problema: puede generar que se cargue execivamente la memoria con versiones ligeramente distintas del mismo codigo.

### Support

- [x] Add support for `'html'` component.
- [x] Add support for `'markdown'` component.
- [x] Add support for `'javascript_html'` component.
- [x] Add support for `'javascript_markdown'` component.
- [x] Add support for `'javascript_code'` component.

- [x] Support on Linux
- [x] Support on Windows

## Ideas for the future

- [ ] Add cache of `'html' | 'md'` component types.
- [ ] Add support for other codeblock content syntax (e.g. **JS objects**)
- [ ] Add support for other codeblock content syntax (e.g. **TOML**)
- [ ] Add support for custom formats, defined by the user.

## Discarted Ideas

> Add syntax highlight on _edit mode_.
> R/ It seems the syntax highlight can not easily be activated for custom codeblocks.

> Add the posibility to use a separator inside `yaml`
> to make easier the use of objects arrays.
> R/ Is better to keep a valid syntax
> Example:
>
> ```yaml
> var1: a
> var2: b
> ---
> var1: c
> var2: d
> ---
> var1: e
> var2: f
> ```
