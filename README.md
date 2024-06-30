# XTP Plugin Bindgen

> *Warning*: This is very experimental and is still in the prototyping phase.
> Changes will be made without warning. Please wait before you start writing new bindgens.

This repository houses the prototype for bingden for typescript plug-ins in XTP.
It's based on the [XTP Schema](https://docs.xtp.dylibso.com/docs/host-usage/xtp-schema)
as the driving document. This document will be used to generate code and documentation
for plug-in systems and is specifically tailored to [Extism](https://extism.org/) at the moment.

When this is integrated into CLI, usage will look something like:

```bash
xtp gen --template @dylibso/xtp-typescript-bindgen --path ~/my-plugin
```

This will grab the `bundle.zip` which contains the plugin and templates from the [latest release](https://github.com/dylibso/xtp-typescript-bindgen/releases/latest).

[Here is my initial document](DESIGN.md) stating the design of the system. However things are changing as I'm implementing.
This codebase contains a mix of go code and typescript code in order to bootstrap the system. But
eventually all Go code will be genericized and moved into the XTP CLI. A generator will only be 
an Extism (usually TypeScript) plugin with some templates and a config file.

