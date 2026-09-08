# browser-debug-panel

A lightweight, **zero-dependency** browser debug overlay you can drop into any website.

Press `Ctrl + Shift + D` (or `Cmd + Shift + D` on Mac) to toggle the panel.

Perfect for debugging on devices where DevTools is painful (phones, tablets, embedded WebViews, kiosks, etc.).

## Features

- **FPS + frame time** counter
- **Viewport / screen / device pixel ratio** info
- **User-Agent + platform** details
- **localStorage & sessionStorage** inspector + live editor
- **Console log capture** (log / warn / error / info)
- **Quick actions**: clear storage, hard reload, copy page URL, toggle dark mode on the page
- Completely client-side — no server, no build step
- Tiny and self-contained

## Quick Start

### Option 1 — Script tag (easiest)

```html
<script src="https://cdn.jsdelivr.net/gh/DeclineOptionalCookies/browser-debug-panel@main/debug-panel.js"></script>
```

The panel auto-initializes.

### Option 2 — Local file

```html
<script src="./debug-panel.js"></script>
```

### Option 3 — Manual control

```html
<script src="./debug-panel.js"></script>
<script>
  // The panel is available as window.DebugPanel
  // window.DebugPanel.toggle();
</script>
```

## Keyboard Shortcut

| Platform | Shortcut |
|----------|----------|
| Windows / Linux | `Ctrl + Shift + D` |
| macOS | `Cmd + Shift + D` |

You can also call `window.DebugPanel.toggle()` from your own code.

## Demo

Open `index.html` locally or enable GitHub Pages on this repository.

## API

```js
window.DebugPanel.toggle()     // show / hide
window.DebugPanel.show()       // force show
window.DebugPanel.hide()       // force hide
window.DebugPanel.isVisible()  // boolean
```

## License

MIT — do whatever you want with it.

---

Made for developers who still have to debug on real devices.
