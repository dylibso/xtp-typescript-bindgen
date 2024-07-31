# XTP Plugin Bindgen

> _Warning_: This is experimental and is still in the alpha phase. Changes will
> be made without warning. Please wait before you start writing new bindgens.

This repository houses the prototype for bingden for typescript plug-ins in XTP.
It's based on the [XTP Schema](https://docs.xtp.dylibso.com/docs/concepts/xtp-schema) as the
driving document. This document will be used to generate code and documentation
for plug-in systems and is specifically tailored to
[Extism](https://extism.org/) at the moment.

## Building

An XTP gen template is distributed as a zip file with a `plugin.wasm`,
`config.yaml`, and a `templates` directory of template files. To build this
"bundle" run the `bundle.sh` command:

```
./bundle.sh
```

To test you can use the XTP CLI and `plugin init`. You just need to point it at
a valid [XTP Schema](https://docs.xtp.dylibso.com/docs/concepts/xtp-schema)
file:

```
xtp plugin init --schema-file ./tests/schemas/fruit.yaml --template ./bundle --path myplugin -y
```

> _Note_: If you have not installed the xtp cli: curl
> https://static.dylibso.com/cli/install.sh | sudo sh
