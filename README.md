# InlineJS Extended

[![npm (scoped)](https://img.shields.io/npm/v/@benbraide/inlinejs-extended.svg)](https://www.npmjs.com/package/@benbraide/inlinejs-extended) [![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@benbraide/inlinejs-extended.svg)](https://www.npmjs.com/package/@benbraide/inlinejs-extended)

Extended directives and magic properties for the InlineJS framework, providing enhanced form handling, fetch utilities, formatting, state management, intersection observing, overlay management, and more.

InlineJS Extended builds upon the [InlineJS framework](https://github.com/benbraide/inlinejs) to provide additional functionality for modern web applications.

**Note:** This library requires the base [InlineJS framework](https://www.npmjs.com/package/@benbraide/inlinejs) to function.

## Install

### CDN

Include the base InlineJS framework first, then include InlineJS Extended:

```html
<!-- Base InlineJS framework (required) -->
<script src="https://unpkg.com/@benbraide/inlinejs@latest/dist/inlinejs.js"></script>
<!-- InlineJS Extended -->
<script src="https://unpkg.com/@benbraide/inlinejs-extended@latest/dist/inlinejs-extended.js"></script>
```

### NPM Install

```bash
npm install @benbraide/inlinejs @benbraide/inlinejs-extended
```

## Initialization

### Browser (CDN)
When using the CDN scripts, InlineJS Extended will automatically initialize and register all extended directives and magic properties.

### Module Environment
```js
import { BootstrapAndAttach } from '@benbraide/inlinejs';
import { InlineJSExtended } from '@benbraide/inlinejs-extended';

InlineJSExtended().then(() => {
    BootstrapAndAttach();
});
```

> `BootstrapAndAttach` takes an optional DOM element to search. Defaults to the document element.

## Usage Examples

### Basic Form Handling with hx-form
```html
<form hx-data="{ submitted: false }" hx-form:submit.prevent="submitted = true">
    <input name="username" type="text" required>
    <input name="email" type="email" required>
    <button type="submit">Submit</button>
    <p hx-show="submitted" hx-text="'Form submitted successfully!'"></p>
</form>
```

### Intersection Observer with hx-intersection
```html
<div hx-data="{ visible: false, ratio: 0 }"
     hx-intersection:visible="visible = $event.detail.visible"
     hx-intersection:ratio="ratio = $event.detail.ratio">
    <p hx-text="visible ? 'Element is visible!' : 'Element is hidden'"></p>
    <p hx-text="'Visibility ratio: ' + Math.round(ratio * 100) + '%'"></p>
</div>
```

### Data Formatting with $format
```html
<div hx-data="{ price: 1234567.89, date: new Date() }">
    <p hx-text="'Price: $' + $format.comma(price)"></p>
    <p hx-text="'Rounded: $' + $format.round(price, 2)"></p>
    <p hx-text="'Date: ' + $format.date(date, 'Y-m-d')"></p>
</div>
```

### HTTP Requests with $fetch
```html
<div hx-data="{ 
    data: null, 
    loading: false,
    async fetchData() {
        this.loading = true;
        try {
            this.data = await $fetch.get('/api/data');
        } finally {
            this.loading = false;
        }
    }
}">
    <button hx-on:click="fetchData()" hx-bind:disabled="loading">
        <span hx-text="loading ? 'Loading...' : 'Fetch Data'"></span>
    </button>
    <div hx-show="data" hx-text="JSON.stringify(data)"></div>
</div>
```

### Promise Waiting with $wait
```html
<div hx-data="{
    result: null,
    async loadData() {
        const promise = fetch('/api/slow-endpoint').then(r => r.json());
        this.result = $wait(promise, 'Loading...');
        this.result = await promise;
    }
}">
    <button hx-on:click="loadData()">Load Data</button>
    <p hx-text="result || 'No data loaded'"></p>
</div>
```

## Learn

**InlineJS Extended** provides additional directives and magic properties on top of the [base InlineJS framework](https://github.com/benbraide/inlinejs). For core InlineJS documentation, please refer to the [main InlineJS repository](https://github.com/benbraide/inlinejs).

### Extended Directives

| Directive | Description |
| --- | --- |
| [`hx-form`](#hx-form) | Enhanced form handling with server submission, middleware, and validation. |
| [`hx-intersection`](#hx-intersection) | Intersection observer for detecting element visibility and intersection ratios. |
| [`hx-overlay`](#hx-overlay) | Overlay management for modals, dropdowns, and other overlay elements. |
| [`hx-state`](#hx-state) | Advanced state management with dirty tracking, validation, and persistence. |
| [`hx-resize`](#hx-resize) | Element resize observation for responsive behaviors. |
| [`hx-tick`](#hx-tick) | Execute expressions on the next tick or at specified intervals. |
| [`hx-attr`](#hx-attr) | Enhanced attribute binding with additional features. |
| [`hx-mouse`](#hx-mouse) | Advanced mouse event handling with gesture support. |
| [`hx-keyboard`](#hx-keyboard) | Keyboard event handling with key combination support. |

### Extended Magic Properties

| Property | Description |
| --- | --- |
| [`$fetch`](#fetch) | HTTP request utilities with path handlers, mocking, and form data helpers. |
| [`$format`](#format) | Data formatting for numbers, dates, strings, currency, and more. |
| [`$wait`](#wait) | Promise waiting with loading states and transition data. |
| [`$server`](#server) | Server interaction utilities for enhanced client-server communication. |
| [`$overlay`](#overlay) | Overlay visibility management and positioning helpers. |

### Extended Directives

---

### `hx-form`

**Example:** `<form hx-form:submit.prevent="handleSubmit($event)">...</form>`

**Structure:** `<form hx-form:[event].[modifiers]="[expression]">...</form>`

`hx-form` provides enhanced form handling with server submission, middleware support, and automatic validation. It extends standard form behavior with features like:

- Server submission with automatic CSRF handling
- Middleware pipeline for processing form data
- File upload and download support
- Progress tracking and error handling
- Automatic form validation states

**Supported modifiers:**
- `.prevent` - Prevents default form submission
- `.persistent` - Preserves form data across page reloads
- `.upload` - Enables file upload handling
- `.download` - Handles file downloads
- `.blob` - Processes blob responses
- `.silent` - Suppresses success/error notifications

**Example with middleware:**
```html
<form hx-form:submit.prevent.upload="processForm($event)">
    <input name="file" type="file" required>
    <button type="submit">Upload</button>
</form>
```

---

### `hx-intersection`

**Example:** `<div hx-intersection:visible="isVisible = $event.detail.visible">...</div>`

**Structure:** `<div hx-intersection:[event].[options]="[expression]">...</div>`

`hx-intersection` uses the Intersection Observer API to detect when elements enter or leave the viewport. It provides detailed information about element visibility and intersection ratios.

**Available events:**
- `visible` - Fires when visibility changes (boolean)
- `ratio` - Fires when intersection ratio changes (0-1)
- `stage` - Fires when intersection stage changes ('none', 'partial', 'full')

**Supported options:**
- `.once` - Only trigger once
- `.threshold.[number]` - Set intersection threshold (0-1)
- `.ancestor.[number]` - Use ancestor element as root

**Example:**
```html
<div hx-data="{ visible: false, ratio: 0 }"
     hx-intersection:visible="visible = $event.detail.visible"
     hx-intersection:ratio="ratio = $event.detail.ratio">
    <p hx-show="visible">Now visible!</p>
    <p hx-text="'Visibility: ' + Math.round(ratio * 100) + '%'"></p>
</div>
```

---

### `hx-overlay`

**Example:** `<div hx-overlay="isOpen">...</div>`

**Structure:** `<div hx-overlay:[event]="[expression]">...</div>`

`hx-overlay` manages overlay elements like modals, dropdowns, and tooltips. It provides automatic z-index management and integrates with the `$overlay` magic property.

**Available events:**
- `visible` - Controls overlay visibility
- `click` - Handles overlay click events
- `hidden` - Fires when overlay is hidden

**Example:**
```html
<div hx-data="{ modalOpen: false }">
    <button hx-on:click="modalOpen = true">Open Modal</button>
    <div hx-overlay:visible="modalOpen" 
         hx-show="modalOpen"
         hx-on:click.outside="modalOpen = false">
        <div class="modal-content">Modal body content</div>
    </div>
</div>
```

---

### `hx-state`

**Example:** `<div hx-state="{ dirty: false, invalid: false }">...</div>`

**Structure:** `<div hx-state="[state object]">...</div>`

`hx-state` provides advanced state management with automatic dirty tracking, validation states, and error handling. It exposes state properties that can be used throughout the component.

**State properties:**
- `dirty` - Number of dirty (changed) fields
- `invalid` - Number of invalid fields
- `changed` - Number of fields that have been modified

**Example:**
```html
<form hx-data hx-state>
    <input hx-model="name" required>
    <input hx-model="email" type="email" required>
    
    <p hx-show="$state.dirty > 0">You have unsaved changes</p>
    <p hx-show="$state.invalid > 0" class="error">
        Please fix <span hx-text="$state.invalid"></span> validation errors
    </p>
    
    <button type="submit" hx-bind:disabled="$state.invalid > 0">
        Submit
    </button>
</form>
```

---

### `hx-resize`

**Example:** `<div hx-resize="handleResize($event)">...</div>`

**Structure:** `<div hx-resize.[options]="[expression]">...</div>`

`hx-resize` observes element size changes using the ResizeObserver API. It provides detailed information about element dimensions and box sizing.

**Available options:**
- `.content` - Observe content box changes
- `.box` - Observe border box changes

**Event details include:**
- `width`, `height` - Element dimensions
- `x`, `y` - Element position
- `borderBoxBlock`, `borderBoxInline` - Border box dimensions
- `contentBoxBlock`, `contentBoxInline` - Content box dimensions

**Example:**
```html
<div hx-data="{ size: null }"
     hx-resize="size = $event.detail">
    <p hx-show="size" hx-text="'Size: ' + size.width + 'x' + size.height"></p>
</div>
```

---

### `hx-tick`

**Example:** `<div hx-tick.1000="counter++">...</div>`

**Structure:** `<div hx-tick.[delay].[options]="[expression]">...</div>`

`hx-tick` executes expressions on the next tick or at specified intervals. It's useful for animations, polling, and timed updates.

**Available options:**
- `.delay.[number]` - Set delay in milliseconds (default: 1000)
- `.duration.[number]` - Set total duration
- `.steps.[number]` - Set number of steps
- `.vsync` - Sync with requestAnimationFrame
- `.stopped` - Start in stopped state

**Example:**
```html
<div hx-data="{ count: 0, running: true }"
     hx-tick.500="count++"
     hx-show="running">
    <p hx-text="'Count: ' + count"></p>
    <button hx-on:click="$tick.toggle()">Toggle Timer</button>
</div>
```

---

### `hx-attr`

**Example:** `<div hx-attr:data-id="userId">...</div>`

**Structure:** `<div hx-attr:[attribute]="[expression]">...</div>`

`hx-attr` provides enhanced attribute binding with additional features beyond the core `hx-bind` directive.

---

### `hx-mouse`

**Example:** `<div hx-mouse:move="handleMouseMove($event)">...</div>`

**Structure:** `<div hx-mouse:[event].[options]="[expression]">...</div>`

`hx-mouse` provides advanced mouse event handling with gesture support and enhanced event information.

---

### `hx-keyboard`

**Example:** `<div hx-keyboard:keydown.ctrl.s="save()">...</div>`

**Structure:** `<div hx-keyboard:[event].[modifiers]="[expression]">...</div>`

`hx-keyboard` provides enhanced keyboard event handling with support for complex key combinations and shortcuts.

---

## Extended Magic Properties

---

### `$fetch`

**Example:** `$fetch.get('/api/data')`

`$fetch` provides enhanced HTTP request capabilities with path handlers, mocking, and form data utilities.

**Available methods:**
- `get(url, options)` - Perform GET request
- `addPathHandler(path, handler)` - Add custom path handler
- `removePathHandler(handler)` - Remove path handler
- `mockResponse(params)` - Mock HTTP responses for testing
- `formData(data)` - Create FormData from object
- `install()` - Install as global fetch concept
- `uninstall()` - Remove global fetch concept

**Example:**
```html
<div hx-data="{
    data: null,
    loading: false,
    async fetchData() {
        this.loading = true;
        try {
            this.data = await $fetch.get('/api/users');
        } finally {
            this.loading = false;
        }
    }
}">
    <button hx-on:click="fetchData()">Fetch Users</button>
    <div hx-show="loading">Loading...</div>
    <div hx-show="data" hx-text="JSON.stringify(data)"></div>
</div>
```

**FormData helper:**
```html
<div hx-data="{
    submitForm() {
        const formData = $fetch.formData({
            name: 'John Doe',
            email: 'john@example.com'
        });
        return $fetch.get('/submit', { method: 'POST', body: formData });
    }
}">
    <button hx-on:click="submitForm()">Submit</button>
</div>
```

---

### `$format`

**Example:** `$format.comma(1234567)`

`$format` provides comprehensive data formatting utilities for numbers, dates, strings, and more.

**Number formatting:**
- `comma(number)` - Add thousand separators (1,234,567)
- `round(number, decimals)` - Round to specified decimal places
- `currency(number, currencyCode, locale)` - Format as currency
- `prefix(data, prefix)` - Add prefix to data
- `suffix(data, suffix)` - Add suffix to data
- `affix(data, prefix, suffix)` - Add both prefix and suffix

**String formatting:**
- `upperCase(string)` - Convert to uppercase
- `lowerCase(string)` - Convert to lowercase
- `titleCase(string)` - Convert to title case
- `truncate(string, limit, trail)` - Truncate with ellipsis
- `plural(count, singular, plural)` - Handle pluralization

**Date formatting:**
- `date(date, format)` - Format dates with patterns
- `relativeTime(date)` - Relative time formatting

**Array/Object formatting:**
- `join(array, separator)` - Join array elements
- `keys(object)` - Get object keys
- `values(object)` - Get object values
- `slice(data, keys)` - Extract specific keys/indices

**Example:**
```html
<div hx-data="{
    price: 1234567.89,
    name: 'john doe',
    date: new Date(),
    items: ['apple', 'banana', 'cherry']
}">
    <p hx-text="'Price: ' + $format.currency(price, 'USD')"></p>
    <p hx-text="'Name: ' + $format.titleCase(name)"></p>
    <p hx-text="'Date: ' + $format.date(date, 'Y-m-d')"></p>
    <p hx-text="'Items: ' + $format.join(items, ', ')"></p>
</div>
```

---

### `$wait`

**Example:** `$wait(promise, 'Loading...')`

`$wait` manages promise states and provides loading transitions while waiting for async operations to complete.

**Parameters:**
- `data` - Promise or any data to wait for
- `transitionData` - Data to show while waiting (loading message, spinner, etc.)

**Returns:**
- While waiting: returns `transitionData`
- After resolution: returns the resolved value

**Example:**
```html
<div hx-data="{
    result: null,
    async loadData() {
        const promise = new Promise(resolve => {
            setTimeout(() => resolve('Data loaded!'), 2000);
        });
        
        // Show 'Loading...' while waiting
        this.result = $wait(promise, 'Loading...');
        
        // Update with actual result when promise resolves
        try {
            this.result = await promise;
        } catch (error) {
            this.result = 'Error loading data';
        }
    }
}">
    <button hx-on:click="loadData()">Load Data</button>
    <p hx-text="result || 'No data'"></p>
</div>
```

**Advanced example with fetch:**
```html
<div hx-data="{
    users: null,
    async fetchUsers() {
        const promise = fetch('/api/users').then(r => r.json());
        this.users = $wait(promise, [{ name: 'Loading...', loading: true }]);
        this.users = await promise;
    }
}">
    <button hx-on:click="fetchUsers()">Fetch Users</button>
    <template hx-for="user in users || []">
        <div hx-text="user.name" hx-class:loading="user.loading"></div>
    </template>
</div>
```

---

### `$server`

**Example:** `$server.upload('/upload', formData)`

`$server` provides server interaction utilities for file uploads, downloads, and duplex communication.

**Available methods:**
- `upload(url, data, method)` - Upload files to server
- `download(url, data, method)` - Download files from server  
- `duplex(url, data, method)` - Bidirectional server communication

**Upload example:**
```html
<form hx-data="{
    file: null,
    uploading: false,
    async uploadFile() {
        if (!this.file) return;
        
        this.uploading = true;
        try {
            const formData = new FormData();
            formData.append('file', this.file);
            
            const result = await $server.upload('/api/upload', formData);
            console.log('Upload successful:', result);
        } finally {
            this.uploading = false;
        }
    }
}">
    <input type="file" hx-on:change="file = $event.target.files[0]">
    <button hx-on:click="uploadFile()" hx-bind:disabled="!file || uploading">
        <span hx-text="uploading ? 'Uploading...' : 'Upload'"></span>
    </button>
</form>
```

**Download example:**
```html
<div hx-data="{
    async downloadReport() {
        try {
            const blob = await $server.download('/api/reports/monthly', {
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'monthly-report.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }
}">
    <button hx-on:click="downloadReport()">Download Report</button>
</div>
```

---

### `$overlay`

**Example:** `$overlay.show()`

`$overlay` manages overlay visibility and provides z-index management for modals, dropdowns, and other overlay elements.

**Available methods:**
- `show()` - Show overlay
- `hide()` - Hide overlay
- `toggle()` - Toggle overlay visibility
- `isVisible()` - Check if overlay is visible
- `offsetShowCount(delta)` - Adjust show count

**Example:**
```html
<div hx-data="{ modalOpen: false }">
    <button hx-on:click="modalOpen = true; $overlay.show()">
        Open Modal
    </button>
    
    <div hx-show="modalOpen" 
         hx-overlay="modalOpen"
         hx-on:click.outside="modalOpen = false; $overlay.hide()"
         style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h2>Modal Title</h2>
        <p>Modal content goes here...</p>
        <button hx-on:click="modalOpen = false; $overlay.hide()">Close</button>
    </div>
</div>
```

**Advanced overlay management:**
```html
<div hx-data="{
    dropdownOpen: false,
    modalOpen: false,
    
    openDropdown() {
        this.dropdownOpen = true;
        $overlay.show(); // Increment overlay count
    },
    
    closeDropdown() {
        this.dropdownOpen = false;
        $overlay.hide(); // Decrement overlay count
    },
    
    openModal() {
        this.modalOpen = true;
        $overlay.show(); // Stack overlays
    },
    
    closeModal() {
        this.modalOpen = false;
        $overlay.hide();
    }
}">
    <!-- Dropdown -->
    <div style="position: relative;">
        <button hx-on:click="openDropdown()">Open Dropdown</button>
        <div hx-show="dropdownOpen" 
             hx-overlay="dropdownOpen"
             hx-on:click.outside="closeDropdown()">
            Dropdown content
            <button hx-on:click="openModal()">Open Modal</button>
        </div>
    </div>
    
    <!-- Modal -->
    <div hx-show="modalOpen" hx-overlay="modalOpen">
        Modal content
        <button hx-on:click="closeModal()">Close Modal</button>
    </div>
</div>
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
