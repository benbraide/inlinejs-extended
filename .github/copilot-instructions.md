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

### Manual Testing
- **No test suite**: This repository does not contain automated tests (`src/**/*.spec.ts` patterns are empty)
- **Browser testing required**: Library depends on browser APIs (DOM, window object)
- **Dependency note**: InlineJS Extended requires the base InlineJS library to function

### Testing the Built Library
The built `inlinejs-extended.js` file extends InlineJS but does not include the base framework. For testing:

1. **Include base InlineJS first** (from CDN or separate install):
   ```html
   <script src="https://unpkg.com/@benbraide/inlinejs@latest/dist/inlinejs.js"></script>
   ```

2. **Then include InlineJS Extended**:
   ```html
   <script src="dist/inlinejs-extended.js"></script>
   ```

3. **Alternative: Use the library programmatically** for module environments:
   ```js
   import { BootstrapAndAttach } from '@benbraide/inlinejs';
   import { InlineJSExtended } from '@benbraide/inlinejs-extended';
   
   InlineJSExtended().then(() => {
       BootstrapAndAttach();
   });
   ```

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
- `hx-form` - Enhanced form handling with server submission and middleware
- `hx-intersection` - Intersection observer for visibility detection
- `hx-overlay` - Overlay management for modals and dropdowns
- `hx-state` - State management and persistence
- `hx-resize` - Element resize observation
- `hx-tick` - Next tick execution
- `hx-attr` - Enhanced attribute binding
- `hx-mouse` - Mouse event handling
- `hx-keyboard` - Keyboard event handling

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

2. **Create a test HTML file** to validate functionality (requires base InlineJS):
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <style>[hx-cloak] { display: none; }</style>
   </head>
   <body>
       <div hx-data="{ message: 'Test successful!', count: 0 }" hx-cloak>
           <p hx-text="message"></p>
           <p>Count: <span hx-text="count"></span></p>
           <button hx-on:click="count++">Test Click</button>
       </div>
       
       <!-- Include base InlineJS first -->
       <script src="https://unpkg.com/@benbraide/inlinejs@latest/dist/inlinejs.js"></script>
       <!-- Then include Extended -->
       <script src="dist/inlinejs-extended.js"></script>
   </body>
   </html>
   ```

3. **Test core functionality**:
   - Basic data binding (hx-data, hx-text, hx-on:click)
   - Extended directives (hx-form, hx-intersection if modified)
   - Magic properties ($fetch, $format if modified)

4. **Browser testing**: Open the test HTML in a browser and verify:
   - No JavaScript errors in console
   - Data binding works (text updates, click handlers respond)
   - Extended features work as expected
   - Elements with hx-cloak become visible after initialization

## Validation Scenarios for Extended Features

### Testing Form Directive
```html
<div hx-data="{ name: '', submitted: false }">
    <form hx-form="{ success: submitted = true }">
        <input hx-model="name" name="name" required>
        <button type="submit">Submit</button>
    </form>
    <p hx-show="submitted">Form submitted!</p>
</div>
```

### Testing Format Magic
```html
<div hx-data="{ number: 1234567.89, text: 'hello world' }">
    <p hx-text="$format.comma(number)"></p>
    <p hx-text="$format.upperCase(text)"></p>
</div>
```

### Testing Intersection Directive
```html
<div hx-data="{ visible: false }">
    <p hx-text="visible ? 'Visible' : 'Not visible'"></p>
    <div hx-intersection:visible="visible = $event.detail.visible">
        Watch me scroll into view
    </div>
</div>
```

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
- **ES2015 compatibility**: Use bracket notation instead of newer array methods (e.g., `array[index]` instead of `array.at(index)`)
- **Webpack errors**: Verify `webpack.config.js` paths and ts-loader configuration

### Missing Dependencies
- **UNMET DEPENDENCY errors**: Run `npm install` to resolve
- **Version conflicts**: Check peer dependencies with `npm list`

### Testing Issues
- **"No test files found"**: This is expected - repository has no automated tests
- **Manual testing required**: Create HTML files that import both base InlineJS and the extended version
- **Elements stay hidden**: Ensure base InlineJS is loaded before the extended library
- **Extended features not working**: Verify both scripts loaded and no console errors

### Development Workflow Issues
- **Changes not reflected**: Always run full build process after code changes
- **Debugging**: Use browser dev tools to check for script loading errors
- **Performance**: Use minified version (`inlinejs-extended.min.js`) for production

## Dependencies
- **Runtime**: `@benbraide/inlinejs` (core framework)
- **Build**: `typescript`, `webpack`, `ts-loader`
- **Testing**: `mocha`, `chai`, `jsdom` (configured but no tests exist)

## Development Notes
- **No linting**: Project does not include ESLint or Prettier configuration
- **No CI/CD**: No GitHub Actions or automated builds configured
- **Manual testing only**: No automated test suite exists
- **Browser-focused**: Library designed for browser use, not Node.js environments