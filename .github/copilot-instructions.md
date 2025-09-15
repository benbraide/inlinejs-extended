# InlineJS Extended

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

InlineJS Extended is a TypeScript library that extends the InlineJS framework with additional directives and magic properties for enhanced web application functionality. It provides form handling, fetch utilities, formatting, state management, intersection observing, overlay management, and more. The library is built as both CommonJS and ES modules, and bundled for browser use via webpack.

## Working Effectively

### Initial Setup
- **Node.js version**: Requires Node.js v20+ (tested with v20.19.5)
- **npm version**: Works with npm v10+ (tested with v10.8.2)

### Install Dependencies
```bash
npm install
```
**Time**: ~11 seconds. NEVER CANCEL - install can take up to 2 minutes in some environments.

### Build Process
```bash
# TypeScript compilation (builds lib/common and lib/esm)
npm run compile
```
**Time**: ~3.6 seconds. NEVER CANCEL - set timeout to 5+ minutes for safety.

```bash
# Webpack bundling (builds dist/inlinejs-extended.js and dist/inlinejs-extended.min.js)
npm run build
```
**Time**: ~8 seconds. NEVER CANCEL - set timeout to 15+ minutes for safety.

```bash
# Full build (compile + build)
npm run prepublishOnly
```
**Time**: ~12 seconds combined. NEVER CANCEL - set timeout to 20+ minutes for safety.

### Development Workflow
- **Primary source directory**: `src/` - all TypeScript source files
- **Build output**: 
  - `lib/common/` - CommonJS modules with TypeScript declarations
  - `lib/esm/` - ES modules with TypeScript declarations  
  - `dist/` - Browser-ready bundles (development and minified production)

### Testing
- **No test suite**: This repository does not contain automated tests (`src/**/*.spec.ts` patterns are empty)
- **Manual testing**: Test functionality using HTML files that import the built JavaScript
- **Browser testing required**: Library depends on browser APIs (DOM, window object)

## Project Structure

### Key Directories
- `src/directive/` - Extended directive handlers (form, intersection, overlay, etc.)
- `src/magic/` - Magic property handlers (fetch, format, wait, etc.)  
- `src/concepts/` - Core concept implementations (fetch, server)
- `lib/` - Compiled TypeScript output
- `dist/` - Webpack bundles for browser use

### Important Files
- `src/inlinejs-extended.ts` - Browser entry point that auto-initializes
- `src/entry.ts` - Core initialization function that registers all handlers
- `src/index.ts` - Main export file for npm package
- `src/names.ts` - Constant definitions for directive and concept names
- `src/types.ts` - TypeScript type definitions
- `package.json` - Project configuration and npm scripts
- `tsconfig.json` - TypeScript config for CommonJS build
- `tsconfig.esm.json` - TypeScript config for ES modules build
- `webpack.config.js` - Development build configuration
- `webpack2.config.js` - Production build configuration

## Extended Functionality

### Available Directives
- `x-form` - Enhanced form handling with server submission and middleware
- `x-intersection` - Intersection observer for visibility detection
- `x-overlay` - Overlay management for modals and dropdowns
- `x-state` - State management and persistence
- `x-resize` - Element resize observation
- `x-tick` - Next tick execution
- `x-attr` - Enhanced attribute binding
- `x-mouse` - Mouse event handling
- `x-keyboard` - Keyboard event handling

### Available Magic Properties
- `$fetch` - HTTP request utilities with path handlers and mocking
- `$format` - Data formatting (numbers, dates, strings, currency)
- `$wait` - Promise waiting with transition states
- `$server` - Server interaction utilities
- `$overlay` - Overlay visibility management

### Core Concepts
- **FetchConcept** - HTTP request management with interceptors
- **ServerConcept** - Server communication utilities

## Validation Scenarios

### After Making Changes
1. **Always run the full build process**:
   ```bash
   npm run compile && npm run build
   ```

2. **Create a test HTML file** to validate functionality:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <style>[x-cloak] { display: none; }</style>
   </head>
   <body>
       <div x-data="{ message: 'Test successful!', count: 0 }" x-cloak>
           <p x-text="message"></p>
           <p>Count: <span x-text="count"></span></p>
           <button x-on:click="count++">Test Click</button>
       </div>
       <script src="dist/inlinejs-extended.js"></script>
   </body>
   </html>
   ```

3. **Test core functionality**:
   - Basic data binding (x-data, x-text, x-on:click)
   - Extended directives (x-form, x-intersection if modified)
   - Magic properties ($fetch, $format if modified)

4. **Browser testing**: Open the test HTML in a browser and verify:
   - No JavaScript errors in console
   - Data binding works (text updates, click handlers respond)
   - Extended features work as expected

## Build Timing and Timeouts

- **npm install**: 11 seconds (set timeout: 5+ minutes)
- **npm run compile**: 3.6 seconds (set timeout: 5+ minutes) 
- **npm run build**: 8 seconds (set timeout: 15+ minutes)
- **Full workflow**: ~12 seconds total (set timeout: 20+ minutes)

**CRITICAL**: NEVER CANCEL builds or installations. Always wait for completion. Some CI environments may take significantly longer.

## Common Issues and Solutions

### Build Failures
- **"window is not defined"**: Normal when testing Node.js imports - library requires browser environment
- **TypeScript errors**: Check `tsconfig.json` and ensure all dependencies are installed
- **Webpack errors**: Verify `webpack.config.js` paths and ts-loader configuration

### Missing Dependencies
- **UNMET DEPENDENCY errors**: Run `npm install` to resolve
- **Version conflicts**: Check peer dependencies with `npm list`

### Testing Issues
- **"No test files found"**: This is expected - repository has no automated tests
- **Manual testing required**: Create HTML files that import the built JavaScript

## Dependencies
- **Runtime**: `@benbraide/inlinejs` (core framework)
- **Build**: `typescript`, `webpack`, `ts-loader`
- **Testing**: `mocha`, `chai`, `jsdom` (configured but no tests exist)

## Development Notes
- **No linting**: Project does not include ESLint or Prettier configuration
- **No CI/CD**: No GitHub Actions or automated builds configured
- **Manual testing only**: No automated test suite exists
- **Browser-focused**: Library designed for browser use, not Node.js environments