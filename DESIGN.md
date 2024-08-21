> *Note*: This is the old design doc and is already out of date.
> A documentation page for gen will go up soon

## Background

Currently the XTP typescript pdk generator is embedded into the CLI.
It’s written in the Go cli subpackage: `typescriptgen`. This has worked out well when
starting off but was always meant to be temporary. Now that we are almost ready to work
on other languages, it’s time to re-examine this approach as it doesn’t scale well for a
number of reasons:

1. For any small iteration on the pdk gen, we need to release a whole new CLI release.
    1. ideally the individual pdk generators could live in a different codebase and maybe be calloutable by url or git repo from the CLI: example : `plugin init --template @myorg/my-language-git-repo` 
    2. this would allow us to push updates to codegen quickly without releasing the whole CLI
2. If someone wants to write their own pdk generator, they will need to fork the CLI, get a PR into the CLI, etc.
3. People will need to write the pdk generator in Go, which is fine but it isn’t the most accessible language to everyone


## Design Goals

1. Allow creation of pdk generators outside the CLI. The current generator should be reference-able via URL and independently releasable.
2. Utilize templates as much as possible, but allow the user to write a little bit of code when it’s more helpful to do so
    1. We need a balance b/w what OpenAPI does (simple no-code structure but mustache template hell) and forcing them to write all of the code to handle it
3. Generator should be downloadable as a wasm file or a zip file.
    1. Ideally from github releases and the `/latest` asset url.
    2. We can then allow people to reference the project by github slug.
    3. Something like `@github:myuser/myrepo`. Probably a more standard format for this we can adopt


## Design

Let’s take the Typescript generator as an example. Right now i’m thinking we can package up a zip file. Though this could become a single wasm file after i experiment some.

The structure could look like this:

```java
> typescript.zip
  + plugin.wasm         // this will be where the customizable code lives
  + config.yaml         // maybe we need this? maybe we don't
  + template/
    + README.md.ejs
    + src/
      + index.d.ts.ejs  
      + index.ts.ejs
      + main.ts.ejs
      + pdk.ts.ejs
    + package.json.ejs
    + tsconfig.json     // not all files need to be templates 
    + .gitignore
    + esbuild.js
```

<aside>
📝 I’m leaning towards using EJS at the moment because it offers quite a bit of flexibility and it’s recognizable as javascript. But will examine the alternatives.

</aside>

The CLI will walk through the `template` directory and for each file, it will apply the transformation:

```java
renderFile(inputPathMinusEjs, plugin(inputPath, context))
```

So `src/index.d.ts.ejs` will become `src/index.d.ts`. It might start off like this:

```tsx

declare module 'main' {
<% ctx.schema.exports.forEach(e => { %>
  export function <%- toCamelCase(e.name) %>(): I32;
<% } %>
}

<% if (ctx.schema.imports.length > 0) { %>
declare module 'extism:host' {
  interface user {
  <% ctx.schema.import.forEach(i => { %>
    <%- toCamelCase(i.name) %>(ptr: I64): I64;
  <% } %>
  }
}
<% } %>
```

And end up like this:

```tsx
declare module 'main' {
  export function greetMe(): I32;
}

declare module 'extism:host' {
  interface user {
    aHostFunc(ptr: I64): I64
  }
}
```

We can include some common helper methods that do helpful things, but we can also let them register their own helpers. We may also want to let them create a context pre-processor that lets them add some pre-computed state to the context.

The plugin might look like this:

```tsx
function toTypescriptType(xtpType) {
  if (xtpType === 'integer') return 'number'
  throw new Error('I dont want to implement this it is just a demo!')
}

// optionally pre-process or initialize before render is called
export function beforeRender() {
  var context = getContext() // might come from config or var
  context.preComputedThing = 42
  setContext(context)
  // register some custom helpers
  registerHelper("toTypescriptType", toTypescriptType)  
}
```

## Other Customizations

We may want to allow the creator to list a set of dependencies needed on the machine. e.g. this plugin generator needs `node` and `npm`. We also may want some scripts for various tasks the generator will need. Such as formatting or testing. All of this could perhaps go into config.yaml:

```yaml
template-suffix: ejs
dependencies:
  - node
  - npm
  
# these could be from the xtp toml actually
build: npm run build
format: npm run format
test: npm run test

available-feature-flags:
  - camelize-properties
  - map-iso8601-dates
  
```

## Feature Flags

OpenAPI has a concept of feature flags that are custom to the template. We can have the the plugin register some feature flags that it supports. This will allow the host some flexibility to define the experience and the tradeoffs they want.
A feature flag could be used like this `xtp plugin init --template @dylibso/xtp-typescript-bindgen --feature-camelize-properties=true`
where features are derived from the template's config.

