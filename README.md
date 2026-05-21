# Productivity Suite — Chrome Extension

A multi-feature Chrome extension built with Manifest V3 to boost your productivity.

## Features

- **Tab Session Management** — Save and restore groups of tabs instantly.
- **Notes** — Quick note-taking from the popup and new tab page.
- **Website Blocker** — Block distracting websites via the settings page.
- **Custom New Tab** — A beautiful dashboard replacing Chrome's default new tab.
- **Keyboard Shortcuts** — Quick actions without leaving the keyboard.
- **Context Menu** — Right-click to save any page to your notes.
- **Data Export** — Export all your data as a JSON backup.

## Quick Start

### Prerequisites

- **Node.js** (v16+)
- **Google Chrome** (latest)

### Build

```bash
npm install
npm run build
```

This copies all source files from `src/` into `dist/`, ready for Chrome.

### Load in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the `dist/` folder from this project.

### Development

For development, you can also load the `src/` folder directly as an unpacked extension.

## Project Structure

```
├── src/                    # Source code
│   ├── manifest.json       # Extension manifest (MV3)
│   ├── background.js       # Service worker
│   ├── popup.html/js       # Popup UI
│   ├── options.html/js     # Settings page
│   ├── newtab.html/js      # New tab override
│   ├── blocked.html        # Blocked site page
│   ├── icons/              # Extension icons
│   └── styles/             # CSS files
│       ├── common.css      # Shared design system
│       ├── popup.css       # Popup styles
│       ├── options.css     # Options styles
│       └── newtab.css      # New tab styles
├── dist/                   # Built extension (load this in Chrome)
├── doc/                    # Documentation
├── build.js                # Build script
├── package.json            # Project config
└── README.md               # This file
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+P` | Open popup |
| `Ctrl+Shift+S` | Quick save current session |

## Chrome APIs Used

- `chrome.storage.local` — Sessions, notes (large data)
- `chrome.storage.sync` — Blocked sites (synced settings)
- `chrome.tabs` — Tab queries and management
- `chrome.scripting` — Content script injection
- `chrome.contextMenus` — Right-click menu integration
- `chrome.commands` — Keyboard shortcuts
- `chrome.runtime` — Message passing between components

## Permissions

Only the minimum required permissions are requested:

- `storage` — Save user data
- `tabs` — Read and manage tabs
- `scripting` — Inject scripts for website blocking
- `contextMenus` — Add right-click menu items
- `<all_urls>` — Required for website blocker functionality

## Export Format

The exported JSON file (`productivity_suite_export.json`) contains:

```json
{
  "sessions": { "session-name": { "urls": [...], "createdAt": "..." } },
  "notes": "Your notes content",
  "blockedSites": ["example.com", "..."]
}
```

## Author

CHITTURI DOLA SATYA SIVA SHANKAR BABA
