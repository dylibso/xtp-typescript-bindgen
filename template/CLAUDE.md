# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a template for creating an XTP plugin (using the Extism framework). The server compiles JavaScript to WebAssembly using the Extism JavaScript PDK and runs in a highly constrained QuickJS environment wrapped in WASM.

**This is a starting point template** - you should implement your own plugin logic and keep this CLAUDE.md file updated as you develop your implementation.

### Key Components

- **src/index.ts**: Generated glue code that bridges the host application with your plugin implementation
- **src/main.ts**: **Your implementation file** - contains `callImpl()` and `describeImpl()` functions where you write your plugin logic
- **src/pdk.ts**: Internal library for interfacing with the host application (not type definitions)
- **xtp.toml**: Configuration with app/extension point IDs and build scripts

### JavaScript Runtime Constraints

The plugin runs in a bare-bones QuickJS environment with significant limitations:
- No Node.js or browser APIs
- No npm modules (except what's bundled)
- Must use CommonJS format
- Target ES2020 maximum
- Synchronous execution only
- Limited memory management

### Available Runtime APIs

#### Host API
- `Host.inputString(): string` - Get input as string from host
- `Host.outputString(output: string): boolean` - Send string output to host
- `Host.inputBytes(): ArrayBufferLike` - Get input as bytes from host
- `Host.outputBytes(output: ArrayBufferLike): boolean` - Send bytes output to host
- `Host.arrayBufferToBase64(input: ArrayBuffer): string` - Convert ArrayBuffer to Base64
- `Host.base64ToArrayBuffer(input: string): ArrayBuffer` - Convert Base64 to ArrayBuffer

#### Config API
- `Config.get(key: string): string | null` - Access configuration values

#### Http API
- `Http.request(req: HttpRequest, body?: string | ArrayBufferLike): HttpResponse` - Make synchronous HTTP requests
  - `req`: `{ url: string, method?: string, headers?: Record<string, string> }`
  - Returns: `{ body: string, status: number }`

#### Var API (Persistent Storage)
- `Var.set(name: string, value: string | ArrayBufferLike): void` - Store persistent data
- `Var.getString(name: string): string | null` - Retrieve string value
- `Var.getBytes(name: string): ArrayBufferLike | null` - Retrieve bytes value

#### Console API
- `Console.log(...data: any[]): void` - Log messages
- `Console.debug(...data: any[]): void` - Debug messages
- `Console.info(...data: any[]): void` - Info messages
- `Console.warn(...data: any[]): void` - Warning messages
- `Console.error(...data: any[]): void` - Error messages
- `Console.trace(...data: any[]): void` - Trace messages

## Development Commands

### Build and Format
```bash
# Build the plugin (runs prepare.sh + npm build)
xtp plugin build

# Build manually
npm run build

# Format code
npm run format
```

### Testing with xtp plugin call

This plugin template has two main functions:

```bash
# Get the server description (available tools/resources)
xtp plugin call --wasi dist/plugin.wasm describe

# Call a specific tool (basic example)
xtp plugin call --wasi dist/plugin.wasm call -i '{"params": {"arguments": {"name": "World"}}}'

# Call a tool that requires network access (like IP address fetching)
xtp plugin call --wasi --allow-host "api.ipify.org" dist/plugin.wasm call -i '{"params": {"arguments": {}}}'
```

**Important**: When testing plugins that make HTTP requests, you must use the `--allow-host` flag to specify which domains the plugin can access. Without this flag, all HTTP requests will be blocked in the sandbox environment.

### Prerequisites Check
The `prepare.sh` script validates required dependencies:
- Node.js and npm
- extism-js compiler (install via: `curl -L https://raw.githubusercontent.com/extism/js-pdk/main/install.sh | bash`)

## Build Process

1. **prepare.sh**: Validates dependencies and runs `npm install`
2. **TypeScript compilation**: `tsc --noEmit` for type checking
3. **esbuild bundling**: Bundles to CommonJS format targeting ES2020
4. **WASM compilation**: `extism-js` converts bundled JS to WebAssembly

The final output is `dist/plugin.wasm`.

## Configuration Files

- **xtp.toml**: Configuration with IDs and build scripts
- **esbuild.js**: Bundler configuration (must use CJS format, ES2020 target)

## Common Mistakes to Avoid

### Testing and Development
- **Always build before testing**: Run `xtp plugin build` before `xtp plugin call`
- **WASI flag required**: Always use `--wasi` flag when calling the server: `xtp plugin call --wasi dist/plugin.wasm`

### Runtime Constraints
- **No async/await**: Use synchronous APIs only (Http.request, not fetch)
- **No Node.js APIs**: Use provided APIs (Console.log, not console.log)
- **CommonJS only**: Use `module.exports` and `require()`, not ES6 imports/exports in bundled code
- **Memory limitations**: Avoid large data structures, use streaming where possible

### File Structure
- **Don't edit index.ts**: This is generated glue code - implement your logic in main.ts
- **Use existing types**: Import types from "./pdk" for CallToolRequest, CallToolResult, etc.
- **Follow the interface**: Implement `callImpl(input: CallToolRequest)` and `describeImpl()` in main.ts
