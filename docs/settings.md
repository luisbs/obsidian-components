# Settings

The next entries are settings that can be configured on the _SettingsTab_ of the plugin.

## Execution Behavior Setting

The **components** are run directly, they are not isolated in any way, this allows them to use _network connections_, _import/export modules_, but at the same time **any malicious code will run without limitations**.

To prevent dangerious situations this setting can be used to only allow the execution of **components** you enable, or **components** enabled by the **component-formats** you enable.

## Design Mode Setting

> **TL;DR** activate the _design mode_ when you're designing/editing the code of your **components** and want to see the result of those changes on the app on runtime.

The **components** are run directly from the file you write, using the native `require( ... )` method, this allows them to run as normal code, and not like scripts.

But, this situation loads your file in memory, and the next time `require( ... )` is run it will return the already loaded output, and will ignore any modifications you make to the code.

This behavior is perfect for reduced resources usage, but when you're editing/designing your **components** is not ideal since you would need to re-open the app each time you change something.

To bypass these behavior the _Design Mode Setting_ actives a modifications tracker, that listen to changes on the **components files**, stores a copy of each iteration, and when changes are made refreshes the rendered element inside the app.

The bad thing about this is that it will generate a higher memory and storage usage meanwhile the app is open; thats why it is disabled by default.

## Custom Codeblocks Setting

By default to identify a Codeblocks that should run a **component**, the `use <component-name>` sentence is used as the header of the Codeblock. Example:

````yaml
```use book
param1: value1
```
````

This settings allows the usage of the **components custom names** defined by the user as Codeblocks identifiers, so instead of `use book` you can use `book` in the first line of the Codeblock. Example:

````yaml
```book
param1: value1
```
````
