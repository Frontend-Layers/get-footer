# Get Footer

Fetch package information from npm registry and display it as a customizable footer on your web page.

---
## Features

- Runs instantly via CDN `<script>` tag
- Config through a single `data-get-footer` attribute
- Multiple footer styles out of the box
- Supports multiple elements
- Custom format templates
- Caches package data to reduce API calls
- Downloads statistics support

---

## Usage

```html
<footer>
  <div class="copy" data-get-footer="package_name"></div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/get-footer"></script>
```

## Configuration

```html
<div data-get-footer="package_name[,][target-element|template][,][template][,]{format}"></div>
```

**Parameters:**

`data-get-footer="[package-name][,][target-element|template][,][template][,]{format}"`

- **1st parameter** (required): Package name to fetch data for
- **2nd parameter** (optional): Can be either:
  - Target element selector (starts with `#` or `.`) where the footer will be inserted
  - Template name (see Templates section below)
- **3rd parameter** (optional): Template name (if 2nd parameter is a target element)
- **Format** (optional): Custom format, specified within `{}` for personalized footer

## Built-in Templates

| Template  | Description                                |
| --------- | ------------------------------------------ |
| modern    | Modern style with emojis (default)         |
| classic   | Traditional copyright style                |
| minimal   | Simple package name and version            |
| boxed     | Boxed style with emoji                     |
| extended  | Extended info with last update date        |
| corporate | Corporate style with full copyright notice |
| full      | Complete package information display       |

## Custom Format

You can customize the footer format using placeholders that will be replaced with package data.

**Available Placeholders:**

| Key             | Description                  |
| --------------- | ---------------------------- |
| %name           | Package name                 |
| %version        | Package version              |
| %description    | Package description          |
| %lastUpdate     | Last update date             |
| %author         | Author's name                |
| %license        | License information          |
| %homepage       | Homepage URL                 |
| %repository     | Repository URL               |
| %maintainers    | Names of maintainers         |
| %totalDownloads | Total downloads (last month) |
| %npmURL         | NPM package URL              |
| %copy           | Copyright symbol (©)         |
| %year           | Current year                 |

Example of custom format:

```html
<div data-get-footer="webpack, { <a href='%npmURL'>%name</a> %copy %year | Version: %version | Updated: %lastUpdate | Downloads: %totalDownloads }"></div>
```

## Examples

```html
<!-- Default modern template -->
<div data-get-footer="express, modern"></div>

<!-- Custom target element -->
<div id="custom-footer"></div>
<div data-get-footer="jest, #custom-footer, modern"></div>

<!-- Custom format -->
<div data-get-footer="webpack, { <a href='%npmURL'>%name</a> %copy %year | Version: %version }"></div>
```

## Contributing

Contributions welcome!

## License

MIT License